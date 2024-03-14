import React, { useState, useEffect, useContext } from 'react';
import { Context } from "../store/appContext";
import "../../styles/calendar.css";

export const Block = () => {
  const { actions } = useContext(Context);
  const [calendar, setCalendar] = useState([]);
  const [month, setMonth] = useState(1); //empieza en enero
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal] = useState(false);
    const [selectedHour, setSelectedHour] = useState(null);
  const [selectedHours, setSelectedHours] = useState([]);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [extractedInfo, setExtractedInfo] = useState([]);

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
      const response = await actions.apiFetch('/bloquear', 'GET');
      setUnavailableDates(response);
    } catch (error) {
      console.error('Error al obtener fechas no disponibles:', error);
    }
  };
  useEffect(() => {
    fetchUnavailableDates()
    function extractDateInfo(dateString) {
      const dateObject = new Date(dateString);
      const month = dateObject.getMonth() + 1; // Los meses en JavaScript van de 0 a 11
      const year = dateObject.getFullYear();
      const day = dateObject.getDate();
      const hour = dateObject.getHours() + 5;
      //console.log(hour)
      return { month, year, day, hour };
    }
    const extractedInfo = unavailableDates.map(item => {
      const { month, year, day, hour } = extractDateInfo(item.date);
      return { year, month, day, hour };
    });
    setExtractedInfo(extractedInfo)

    const currentYear = new Date().getFullYear();
    const currentDate = new Date(currentYear, month - 1, 1); //-1 para que empiece desde enero
    const firstDayOfWeek = currentDate.getDay();
    let day = 1;

    const newCalendar = [];

    for (let i = 0; i < 6; i++) {
      const row = [];

      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDayOfWeek) {
          // Celdas vacías antes del primer día del mes
          row.push('');
        } else if (day <= 31) {
          row.push(day);
          day++;
        } else {
          // Celdas vacías después del último día del mes
          row.push('');
        }
      }

      newCalendar.push(row);
    }
    setCalendar(newCalendar);
    fetchUnavailableDates();
    
  }, [ month, showModal===false]);


  const handleDayClick = (day) => {
    setSelectedDay(day);
    setShowModal(true);
    //console.log("se seleccionó el día: ", selectedDay)

  };
  const handleHourClick = (hour) => {
    setSelectedHour(hour);
    setShowModal(true)
    //console.log("hora seleccionada", hour, ":00", "del día", selectedDay)
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedHours([])
  };
  const handleSelectHours = (data) => {
    // Verifica si el elemento ya está seleccionado
    const isSelected = selectedHours.find(item => item.id === data.id);
    if (isSelected) { // si existe
      setSelectedHours(prevHours => prevHours.filter(item => item.id !== data.id));
    } else {
      //Si no existe
      setSelectedHours(prevHours => [...prevHours, data]);
    }
  };
  const handleBlockTime = async (hour) => {

    const data = {
      date: `2024-${month > 9 ? '' : '0'}${month}-${selectedDay > 9 ? '' : '0'}${selectedDay} ${hour > 9 ? '' : '0'}${hour}:00:00`,
      time: hour,
      id: `2024${month > 9 ? '' : '0'}${month}${selectedDay > 9 ? '' : '0'}${selectedDay}${hour > 9 ? '' : '0'}${hour}`,
    };

    //console.log(data, hour,  " Antes del POST")
    await actions.apiFetch('/bloquear', 'POST', data)
      .then(data => {
        console.log('Hora bloqueada exitosamente:', data);
        handleCloseModal();
      })
      .catch(error => {
        console.error('Error al bloquear la hora:', error);

      });
    //console.log(data, hour,  " Después del POST")
  };
  const handleUnblockTime = async (hour) => {
    const id = `2024${month > 9 ? '' : '0'}${month}${selectedDay > 9 ? '' : '0'}${selectedDay}${hour > 9 ? '' : '0'}${hour}`;

    try {
      await actions.apiFetch(`/bloquear/${id}`, 'DELETE');
      console.log('Hora desbloqueada exitosamente');
      handleCloseModal();
    } catch (error) {
      console.error('Error al desbloquear la hora:', error);
    }
  };
  const handleBlockSelectedHours = async ()=>{
    await actions.apiFetch('/bloquear', 'POST', selectedHours)
      .then(selectedHours => {
        console.log('Hora bloqueada exitosamente:', selectedHours);
        handleCloseModal();
        setSelectedHours([])
      })
      .catch(error => {
        console.error('Error al bloquear la hora:', error);
        console.log(selectedHours)
      });
  }
  const handleUnblockSelectedHours = async ()=>{
    await actions.apiFetch('/bloquear/multiple', 'DELETE', selectedHours)
      .then(selectedHours => {
        console.log('Hora bloqueada exitosamente:', selectedHours);
        handleCloseModal();
        setSelectedHours([])
      })
      .catch(error => {
        console.error('Error al bloquear la hora:', error);
        console.log(selectedHours)
      });
  }
  const handleBlockAllHours = async () => {
    try {
      const allHours = [];
      // Iterar sobre las horas desde las 8 hasta las 20
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
      handleCloseModal();
      setSelectedHours([]);
    } catch (error) {
      console.error('Error al bloquear las horas:', error);
    }
  };
  const handleunBlockAllHours = async () => {
    try {
      const allHours = [];
      // Iterar sobre las horas desde las 8 hasta las 20
      for (let hour = 8; hour <= 20; hour++) {
        const data = {
          date: `2024-${month > 9 ? '' : '0'}${month}-${selectedDay > 9 ? '' : '0'}${selectedDay} ${hour > 9 ? '' : '0'}${hour}:00:00`,
          time: hour,
          id: `2024${month > 9 ? '' : '0'}${month}${selectedDay > 9 ? '' : '0'}${selectedDay}${hour > 9 ? '' : '0'}${hour}`,
        };
        allHours.push(data);
      }
      
      await actions.apiFetch('/bloquear/multiple', 'DELETE', allHours);
      console.log('Horas bloqueadas exitosamente:', allHours);
      handleCloseModal();
      setSelectedHours([]);
    } catch (error) {
      console.error('Error al bloquear las horas:', error);
    }
  };
  const renderModalContent = () => {
    const hours = Array.from({ length: 13 }, (_, index) => index + 8);

    return (
      <div className="modal-content">
        <h2>Horas disponibles para el día {selectedDay}</h2>
        <button onClick={handleCloseModal}>Cerrar</button>
        <button onClick={handleBlockAllHours}>bloquear todo el día</button>
        <button onClick={handleBlockSelectedHours}>Bloquear horas seleccionadas</button>
        <button onClick={handleUnblockSelectedHours}>desbloquear horas seleccionadas</button>
        <button onClick={handleunBlockAllHours}>desbloquear todo el día</button>
        <ul>

          {hours.map((hour) => {
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
            // Esta seleccionada la hora? 
            const isSelected = selectedHours.find(item => item.id === data.id);
            return (
              <li
                key={hour}
                onClick={() => handleSelectHours(data)}
                className={`pestanita 
                          ${matchingHour ? "bg-danger" : ""}
                          ${isSelected ? "selected" : ""}
                          `}
              >
                {hour}:00 - {hour + 1}:00
                <div className="botones">
                  <button className='blockDate' onClick={() => handleBlockTime(hour)}>Bloquear Hora</button>
                  <button className='unblockDate' onClick={() => handleUnblockTime(hour)}>Desbloquear Hora</button>
                </div>
              </li>
            );
          })}
        </ul>

      </div>
    );
  };

  return (
    <div>
      <h2>Calendario 2024</h2>
      <h2> {meses[month]} </h2>
      <div className="button-container">
        <button onClick={() => setMonth(month - 1)}>Mes Anterior</button>
        <button onClick={() => setMonth(month + 1)}>Mes Siguiente</button>
      </div>
      <table className="calendar">
        <thead>
          <tr>
            <th>Domingo</th>
            <th>Lunes</th>
            <th>Martes</th>
            <th>Miércoles</th>
            <th>Jueves</th>
            <th>Viernes</th>
            <th>Sábado</th>
          </tr>
        </thead>
        <tbody>
          {calendar.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className='pestanita' onClick={() => handleDayClick(cell)}>
                  {cell}
                  <div className="botones">
                    {/* <button className='unblockDate'>Besbloquear</button> */}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay">
          {renderModalContent()}
        </div>
      )}
    </div>
  );
};
