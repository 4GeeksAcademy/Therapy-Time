
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
  const [unavailableDates, setUnavailableDates] = useState([])

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

  useEffect(() => {
    
    const fetchUnavailableDates = async () => {
      try {
        const response = await actions.apiFetch('/bloquear', 'GET');
        setUnavailableDates(response);
      } catch (error) {
        console.error('Error al obtener fechas no disponibles:', error);
      }
    };
    console.log(unavailableDates)
    fetchUnavailableDates();
  
    const currentYear = new Date().getFullYear();
    const currentDate = new Date(currentYear, month-1, 1); //-1 para que empiece desde enero
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
    
  }, [ ]);
  useEffect(() => {
    console.log(unavailableDates);
  }, [unavailableDates]); 

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setShowModal(true);
    console.log("se seleccionó el día: ", selectedDay)
    console.log(calendar)
    
  };
  const handleHourClick = (hour) => {
    setSelectedHour(hour);
    setShowModal(true)
    console.log("hora seleccionada", hour, ":00", "del día", selectedDay)
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };
  const handleBlockTime = async (hour) => {
    
    const data = {
      date: `2024-${month > 9 ? '' : '0'}${month}-${selectedDay > 9 ? '' : '0'}${selectedDay} ${hour > 9 ? '' : '0'}${hour}:00:00`,
      time: hour,
    };
    
    console.log(data, hour,  " Antes del POST")
    await actions.apiFetch('/bloquear', 'POST', data)
      .then(data => {
        console.log('Hora bloqueada exitosamente:', data);
        handleCloseModal();
      })
      .catch(error => {
        console.error('Error al bloquear la hora:', error);

      });
      console.log(data, hour,  " Después del POST")
  };
  const handleUnblockTime = async (hour) => {
    
    const data = {
      time: hour,
      availability: true,
      date: `2024-${month > 9 ? '' : '0'}${month}-${selectedDay > 9 ? '' : '0'}${selectedDay} ${hour > 9 ? '' : '0'}${hour}:00:00`
    };
    console.log(data)
    await actions.apiFetch('/bloquear', 'PUT', data)
      .then(data => {
        console.log('Hora desblobloqueada exitosamente:', data);
        handleCloseModal();
      })
      .catch(error => {
        console.error('Error al desbloquear la hora:', error);

      });
  };

  const renderModalContent = () => {
    const hours = Array.from({ length: 13 }, (_, index) => index + 8);
    
    console.log("renderizó el modal")

    return (
      <div className="modal-content">
        <h2>Horas disponibles para el día {selectedDay}</h2>
        <ul>
          {hours.map((hour) => (
            <li key={hour} onClick={() => handleHourClick(hour)}>
              {hour}:00 - {hour + 1}:00
              <button onClick={()=>handleBlockTime(hour)}>Bloquear Hora</button>
              <button onClick={()=>handleUnblockTime(hour)}>Desbloquear Hora</button>
            </li>
          ))}
        </ul>

        <button onClick={handleCloseModal}>Cerrar</button>
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
                <td key={cellIndex} onClick={() => handleDayClick(cell)}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          {renderModalContent()}
        </div>
      )}
    </div>
  );
};