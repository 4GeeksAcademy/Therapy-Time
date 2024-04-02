import React, { useState, useContext, useEffect } from 'react';
import { Context } from "../store/appContext";
import { NavbarTherapist } from "../component/navbar"
import { SchedulingComponent } from "../component/scheduling"
import "../../styles/scheduling.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';


export const Scheduling = () => {
  const {actions, store } = useContext(Context);
  const [activeTab, setActiveTab] = useState('global');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [endTime, setEndTime] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [formDisabled, setFormDisabled] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const POSSIBLE_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const POSSIBLE_HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
  const [scheduleData, setScheduleData] = useState([]);
  const [selectedDay, setSelectedDay] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [startTime, setStartTime] = useState('');
  
  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const filterAvailableEndHours = () => {
    if (!startTime) return [];

    let availableHours = [];
    let lastSelectedHourIndex = POSSIBLE_HOURS.indexOf(startTime);

    for (let i = lastSelectedHourIndex + 1; i < POSSIBLE_HOURS.length; i++) {
      let hour = POSSIBLE_HOURS[i];
      let isAvailable = true;

      for (let j = 0; j < scheduleData.length; j++) {
        if (hour >= scheduleData[j].start_hour && hour <= scheduleData[j].end_hour) {
          isAvailable = false;
          if (hour === scheduleData[j].start_hour) {
            availableHours.push(hour);
          }
          break;
        }
      }
      if (!isAvailable) {
        break;
      }
      availableHours.push(hour);
    }
    return availableHours;
  };
  
  const filterAvailableStartHours = () => {
    let availableHours = POSSIBLE_HOURS.filter(hour => {
      return !scheduleData.some(slot => (slot.start_hour <= hour && hour < slot.end_hour));
    });
    availableHours = availableHours.filter(hour => hour !== '20:00');
    return availableHours;
  };

  const handleAddSchedule = () => {
    if (!startTime || !endTime || startTime >= endTime) {
      setErrorMessage('Ingrese horas válidas.');
      return;
    }
    const newSlot = { start_hour: startTime, end_hour: endTime };
    const updatedData = [...scheduleData, newSlot];
    setScheduleData(updatedData);
    setStartTime('');
    setEndTime('');
    setErrorMessage('');
    setHasChanges(true);
  };

  const handleDayChange = (day) => {
    setSelectedDay(day);
    setDayOfWeek(day);
    const dayData = store.globalEnabled.filter(item => item.day === day);
    setScheduleData(dayData);
    setStartTime('');
    setEndTime('');
    setErrorMessage('');
    setFormDisabled(false);
  };

  const handleDeleteSchedule = async (id) => {
    try {
      await actions.deleteGlobalEnabled(id);
      const updatedData = scheduleData.filter(slot => slot.id !== id);
      setScheduleData(updatedData);
      setHasChanges(true);
    } catch (error) {
      console.error("Error al eliminar el registro de disponibilidad global:", error);
    }
  };

  const handleEndTimeChange = (e) => {
    setEndTime(e.target.value);
  };

  const handleSave = async () => {
    if (!selectedDay || !dayOfWeek) {
      setErrorMessage('Seleccione un día y una hora.');
      return;
    }
    try {
      const newSlots = scheduleData.map(slot => ({
        day: selectedDay,
        start_hour: slot.start_hour,
        end_hour: slot.end_hour
      }));
      const response = await actions.addGlobalEnabled(newSlots);
      console.log('Disponibilidad agregada:', response);
      setScheduleData([]);
      setStartTime('');
      setEndTime('');
      setErrorMessage('');
      openSuccessModal();
      actions.getGlobalEnabled();
      setFormDisabled(true);
      setSelectedDay('');
      setDayOfWeek('');
      setHasChanges(false);
    } catch (error) {
      console.error("Error al guardar disponibilidad global:", error);
      setErrorMessage(error.message || 'Error de red');
    }
  };

  const handleStartTimeChange = (e) => {
    setStartTime(e.target.value);
    setEndTime('');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const openSuccessModal = () => {
    setShowSuccessModal(true);
  };

  useEffect(() => {
    actions.getGlobalEnabled();
    setFormDisabled(true);
    setSelectedDay('');
    setDayOfWeek('');
    setScheduleData([]);
    setStartTime('');
    setEndTime('');
    setErrorMessage('');
  }, []);

  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh', minWidth: '100vw' }}>
      <div className="container mt-5 border" style={{ paddingTop: '1vh' }}>
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button className={`nav-link ${activeTab === "global" ? "active" : "text-muted"}`} onClick={() => handleTabChange("global")}>Disponibilidad global</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === "byDate" ? "active" : "text-muted"}`} onClick={() => handleTabChange("byDate")}>Disponibilidad por fechas</button>
          </li>
        </ul>
        <div>
          {activeTab === 'global' && (
              <div className="row" style={{ paddingTop: '2vh', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '3vh', marginBottom: '4vh', paddingRight: '4vh', fontFamily: 'Nanum Gothic, sans-serif' }}>
                <div className="col">
                  <table className="table schedulingTable" style={{ backgroundColor: 'white', color: '#7E7E7E' }}>
                    <thead style={{ backgroundColor: '#FAFAFA' }}>
                      <tr>
                        <th style={{ width: '10%' }}>Día</th>
                        {POSSIBLE_HOURS.map((hour, index) => (
                          <th key={index} style={{ width: '4%' }}>
                            {hour !== '20:00' ? hour : null}
                          </th>
                        ))}

                        <th style={{ width: '5%' }}>Editar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {POSSIBLE_DAYS.map((day, index) => (
                          <tr key={index}>
                              <td><strong>{day}</strong></td>
                              {POSSIBLE_HOURS.map((hour, hourIndex) => (
                                  <td key={hourIndex} style={{ 
                                      backgroundColor: store.globalEnabled.some(item => 
                                          item.day === day && 
                                          ((hour === '19:00' && (startTime === '19:00' && hour === '19:00' || endTime === '20:00' && hour === '20:00')) || (hour >= item.start_hour && hour < item.end_hour))
                                      ) ? '#a9a9a9' : 'transparent',
                                      width: '4%',
                                  }}>
                                  </td>
                              ))}
                              <td style={{ width: '7%', textAlign: 'center' }}>
                                  <FontAwesomeIcon icon={faPencilAlt} onClick={() => handleDayChange(day)} />
                              </td>
                          </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="col d-flex align-items-center justify-content-center" style={{ color: '#7E7E7E' }}>
                  <div>
                    <div className="row mb-3">
                      <div>
                        <label htmlFor="day-of-week" style={{ width: '32vh' }}>Día de la semana:</label>
                      </div>
                      <div>
                        <input type="text" id="day-of-week" value={dayOfWeek} readOnly disabled={formDisabled} style={{ width: '100%' }} />
                      </div>
                    </div>
                    <div className="mb-3">
                      {scheduleData.map((slot, index) => (
                        <div key={index} className='d-flex align-items-center justify-content-between'>
                          <span>{slot.start_hour} - {slot.end_hour}</span>
                          <FontAwesomeIcon icon={faTrashAlt} onClick={() => handleDeleteSchedule(slot.id)} style={{ marginRight: '2.8vh' }} />
                        </div>
                      ))}
                    </div>
                    <div className="mb-3">
                      <div className='d-flex flex-column mb-1'>
                        <select id="start-time" value={startTime} onChange={handleStartTimeChange} disabled={formDisabled} style={{ width: '18vh' }}>
                          <option value="">Hora inicio</option>
                          {filterAvailableStartHours().map(hour => (
                            <option key={hour} value={hour}>{hour}</option>
                          ))}
                        </select>
                      </div>
                      <div className='d-flex justify-content-between'>
                        <div className='d-flex flex-column' style={{ width: '18vh' }}>
                          <select id="end-time" value={endTime} onChange={handleEndTimeChange} disabled={formDisabled} style={{ width: '100%' }}>
                            <option value="">Hora fin</option>
                            {filterAvailableEndHours().map(hour => (
                              <option key={hour} value={hour}>{hour}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <FontAwesomeIcon icon={faPlus} onClick={handleAddSchedule} disabled={formDisabled} style={{ marginRight: '2.8vh' }} />
                        </div>
                      </div>
                    </div>
                    {errorMessage && <p className="text-danger">{errorMessage}</p>}
                    <div style={{ width: '100%' }}>
                      <button onClick={handleSave} disabled={formDisabled || !hasChanges} style={{ width: '100%', padding: '0', marginBottom: '2vh', backgroundColor: '#C47C7A', color: 'white', padding: '0.5vh' }}>Guardar</button>
                    </div>
                  </div>
                </div>
                <div className={`modal fade ${showSuccessModal ? 'show d-block' : 'd-none'}`} id="successModal" tabIndex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content" style={{ textAlign: 'left' }} id="contactModal">
                      <div className="modal-header justify-content-end">
                        <button type="button" className="btn_close_contact" onClick={closeSuccessModal} aria-label="Close">X</button>
                      </div>
                      <div className="modal-body">
                        <span>Disponibilidad cargada exitosamente!</span>
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-guardar-contact" onClick={closeSuccessModal}>Cerrar</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          )}
          {activeTab === 'byDate' && (
            <div className="container-fluid mt-3 mb-3">
              <SchedulingComponent />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};





