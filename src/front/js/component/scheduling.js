import React, { useState, useEffect, useContext } from 'react';
import { Context } from "../store/appContext";
import "../../styles/calendarTherapist.css";
import { FaTimes } from 'react-icons/fa';
import { FaChevronLeft } from 'react-icons/fa';
import { FaChevronRight } from 'react-icons/fa';

export const SchedulingComponent = () => {
  const { store, actions } = useContext(Context);
  const [calendar, setCalendar] = useState([]);
  const currentMonth = new Date().getMonth() + 1;
  const [month, setMonth] = useState(currentMonth); //empieza en enero
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedHours, setSelectedHours] = useState([]);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [extractedInfo, setExtractedInfo] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const openShowSuccessModal = () => {
    setShowSuccessModal(true)
  };

  const closeShowSuccessModal = () => {
    handleCloseModal();
    setShowSuccessModal(false)
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setYear(year => year + 1);
      setMonth(1);
    } else {
      setMonth(month => month + 1);
    }
  };

  const handlePreviousMonth = () => {
    if (month === 1) {
      setYear(year => year - 1);
      setMonth(12);
    } else {
      setMonth(month => month - 1);
    }
  };

  const meses = {
    1: 'Enero',
    2: 'Febrero',
    3: 'Marzo',
    4: 'Abril',
    5: 'Mayo',
    6: 'Junio',
    7: 'Julio',
    8: 'Agosto',
    9: 'Septiembre',
    10: 'Octubre',
    11: 'Noviembre',
    12: 'Diciembre'
  };

  const fetchUnavailableDates = async () => {
    try {
      const response = await actions.APIFetch('/final_calendar', 'GET');
      setUnavailableDates(response);
    } catch (error) {
      console.error('Error al obtener fechas no disponibles:', error);
    }
  };

  const getDayOfWeek = (year, month, day) => {
    const selectedDate = new Date(year, month - 1, day);
    const dayOfWeekNumber = selectedDate.getDay();
    const dayOfWeekNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dayOfWeekNames[dayOfWeekNumber];
  };

  const dayOfWeek = getDayOfWeek(year, month, selectedDay);

  const filtrarPorDia = (arreglo, dia) => {
    // Utilizar el método filter para obtener los objetos con el día especificado
    const algo = arreglo.filter(horario => horario.day === dia)
    return algo;
  };

  const horasBloqueadasPorDia = filtrarPorDia(store.globalEnabled, dayOfWeek)

  useEffect(() => {
    console.log(dayOfWeek);
    fetchUnavailableDates();
    actions.getGlobalEnabled();
    function extractDateInfo(dateString) {
      const dateObject = new Date(dateString);
      const month = dateObject.getMonth() + 1; // Los meses en JavaScript van de 0 a 11
      const year = dateObject.getFullYear();
      const day = dateObject.getDate();
      const hour = dateObject.getHours() + 5;

      return { month, year, day, hour };
    }
    if (unavailableDates.length > 0) {
      const extractedInfo = unavailableDates.map(item => {
        const { month, year, day, hour } = extractDateInfo(item.date);
        // console.log(extractDateInfo(item.date))
        return { year, month, day, hour };
      });
      setExtractedInfo(extractedInfo);
    } else {
      setExtractedInfo([])
    }
    const currentDate = new Date(year, month - 1, 1);
    const firstDayOfWeek = currentDate.getDay();
    let day = 1;

    const newCalendar = [];

    for (let i = 0; i < 6; i++) {
      const row = [];

      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDayOfWeek) {

          row.push('');
        } else if (day <= 31) {
          row.push(day);
          day++;
        } else {

          row.push('');
        }
      }
      newCalendar.push(row);
    }
    setCalendar(newCalendar);
  }, [year, month, selectedDay, showModal === true]);

  const handleDayClick = (day) => {
    const selectedDate = new Date(year, month - 1, day);
    const currentDate = new Date();

    if (selectedDate < currentDate) {
      return;
    }

    if (day) {
      setSelectedDay(day);
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedHours([])
  };

  const handleSelectHours = (data) => {
    const isSelected = selectedHours.find(item => item.id === data.id);
    if (isSelected) {
      setSelectedHours(prevHours => prevHours.filter(item => item.id !== data.id));
    } else {
      setSelectedHours(prevHours => [...prevHours, data]);
    }
  };

  const handleBlockSelectedHours = async () => {
    await actions.apiFetch('/bloquear', 'POST', selectedHours)
      .then(selectedHours => {
        console.log('Hora bloqueada exitosamente:', selectedHours);
        openShowSuccessModal();
        setSelectedHours([])
      })
      .catch(error => {
        console.error('Error al bloquear la hora:', error);
        console.log(selectedHours)
      });
  };

  const handleUnblockSelectedHours = async () => {
    await actions.apiFetch('/desbloquear/multiple', 'DELETE', selectedHours)
      .then(selectedHours => {
        console.log('Hora bloqueada exitosamente:', selectedHours);
        openShowSuccessModal();
        setSelectedHours([])
      })
      .catch(error => {
        console.error('Error al bloquear la hora:', error);
        console.log(selectedHours)
      });
  };

  const handleBlockAllHours = async () => {
    try {
      const allHours = [];
      for (let hour = 8; hour <= 20; hour++) {
        const data = {
          date: `2024-${month > 9 ? '' : '0'}${month}-${selectedDay > 9 ? '' : '0'}${selectedDay} ${hour > 9 ? '' : '0'}${hour}:00:00`,
          time: hour,
          id: `2024${month > 9 ? '' : '0'}${month}${selectedDay > 9 ? '' : '0'}${selectedDay}${hour > 9 ? '' : '0'}${hour}`,
        };
        allHours.push(data);
      }

      await actions.apiFetch('/bloquear', 'POST', allHours);
      console.log('Horas bloqueadas exitosamente:', allHours);
      openShowSuccessModal();
      setSelectedHours([]);
    } catch (error) {
      console.error('Error al bloquear las horas:', error);
    }
  };

  const handleunBlockAllHours = async () => {
    try {
      const allHours = [];
      for (let hour = 8; hour <= 20; hour++) {
        const data = {
          date: `2024-${month > 9 ? '' : '0'}${month}-${selectedDay > 9 ? '' : '0'}${selectedDay} ${hour > 9 ? '' : '0'}${hour}:00:00`,
          time: hour,
          id: `2024${month > 9 ? '' : '0'}${month}${selectedDay > 9 ? '' : '0'}${selectedDay}${hour > 9 ? '' : '0'}${hour}`,
        };
        allHours.push(data);
      }

      await actions.apiFetch('/desbloquear/multiple', 'DELETE', allHours);
      console.log('Horas bloqueadas exitosamente:', allHours);
      openShowSuccessModal();
      setSelectedHours([]);
    } catch (error) {
      console.error('Error al bloquear las horas:', error);
    }
  };

  const renderModalContent = () => {
    const hours = Array.from({ length: 12 }, (_, index) => index + 8);
    return (
      <div>
        <div className='d-flex justify-content-between align-items-center mb-2' style={{ fontFamily: 'Nanum Gothic, sans-serif' }}>
          <div>
            <h5>Disponibilidad {selectedDay} de {meses[month]}, {year}</h5>
          </div>
          <div>
            <FaTimes onClick={handleCloseModal} style={{ cursor: 'pointer', color: 'grey' }} />
          </div>
        </div>
        <div className="row">
          {hours.map((hour, index) => {
            const data = {
              date: `2024-${month > 9 ? '' : '0'}${month}-${selectedDay > 9 ? '' : '0'}${selectedDay} ${hour > 9 ? '' : '0'}${hour}:00:00`,
              time: hour,
              id: `2024${month > 9 ? '' : '0'}${month}${selectedDay > 9 ? '' : '0'}${selectedDay}${hour > 9 ? '' : '0'}${hour}`,
            };
            const matchingHour = extractedInfo.some((item) => (
              item.year === 2024 &&
              item.month === month &&
              item.day === selectedDay &&
              item.hour === hour
            ));
            const isSelected = selectedHours.find(item => item.id === data.id);
            const isInWorkingHours = horasBloqueadasPorDia.some((item) => (
              hour >= parseInt(item.start_hour.split(':')[0]) && hour < parseInt(item.end_hour.split(':')[0])
            ));
            const hourClassNames = `card border ${matchingHour ? "unavailableDateTherapist" : ""
              } ${isSelected ? "selected" : ""
              } ${!isInWorkingHours ? "unavailableByDateTherapist" : ""
              }`;
            return (
              <div key={hour} className="col-lg-4 col-md-4 col-sm-6 mb-2">
                <div
                  onClick={() => handleSelectHours(data)}
                  className={hourClassNames}
                  style={{ height: '100%', cursor: 'pointer' }}
                >
                  <div className="card-body d-flex align-items-center justify-content-center">
                    <p className="card-title mb-0">{hour}:00 - {hour + 1}:00</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="d-flex justify-content-center mt-2 mx-0">
          <button className='btn_horasPorFecha mx-2 ' onClick={handleBlockSelectedHours}>Bloquear selección</button>
          <button className='btn_horasPorFecha mx-2' onClick={handleUnblockSelectedHours}>Desbloquear selección</button>
          <button className='btn_horasPorFecha mx-2' onClick={handleBlockAllHours}>Bloquear todo el día</button>
          <button className='btn_horasPorFecha mx-2' onClick={handleunBlockAllHours}>Desbloquear todo el día</button>
        </div>
        <div className={`modal fade ${showSuccessModal ? 'show d-block' : 'd-none'}`} id="successModal" tabIndex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ textAlign: 'left' }} id="contactModal">
              <div className="modal-header justify-content-between">
                <div>
                  <span>Disponibilidad configurada con exito </span>
                </div>
                <div>
                  <button type="button" className="btn_close_contact" onClick={closeShowSuccessModal} aria-label="Close">X</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='d-flex'>
      <div className="left-content mt-2" style={{ marginRight: '10vh', fontFamily: 'Nanum Gothic, sans-serif' }}>
        <div className="calendar-header d-flex justify-content-between aling-items-center">
          <div className="button-container">
            <FaChevronLeft style={{ color: 'grey' }} onClick={handlePreviousMonth} />
          </div>
          <h5 className='mt-2'>{meses[month]} de {year}</h5>
          <div className="button-container">
            <FaChevronRight style={{ color: 'grey' }} onClick={handleNextMonth} />
          </div>
        </div>
        <table className="calendar" style={{ color: '#7E7E7E' }}>
          <thead style={{ backgroundColor: '#FAFAFA' }}>
            <tr>
              <th style={{ width: '14.28%' }}>Domingo</th>
              <th style={{ width: '14.28%' }}>Lunes</th>
              <th style={{ width: '14.28%' }}>Martes</th>
              <th style={{ width: '14.28%' }}>Miércoles</th>
              <th style={{ width: '14.28%' }}>Jueves</th>
              <th style={{ width: '14.28%' }}>Viernes</th>
              <th style={{ width: '14.28%' }}>Sábado</th>
            </tr>
          </thead>
          <tbody>
            {calendar.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className='pestanita' onClick={() => handleDayClick(cell)}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        {showModal ? (
          <div>
            {renderModalContent()}
          </div>
        ) : (
          <div className="no-selection-container d-flex justify-content-center align-items-center" style={{ backgroundColor: '#FAFAFA', color: 'grey', padding: '20px', height: '100%', width: '155%' }}>
            No se ha seleccionado ninguna fecha del calendario
          </div>
        )}
      </div>
    </div>
  );
};
