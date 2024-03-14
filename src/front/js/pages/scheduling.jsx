import React, { useState, useEffect, useContext } from 'react';
import { Context } from "../store/appContext";
import "../../styles/calendar.css";

export const Scheduling = () => {
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
      const response = await actions.apiFetch('/available_dates', 'GET');
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

  }, [month, showModal === false]);


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
  };
  const handleHourCheckboxChange = (hour) => {
    setSelectedHour(hour)
    setSelectedHours((prevSelectedHours) => {
      if (prevSelectedHours.includes(hour)) {
        return prevSelectedHours.filter((selectedHour) => selectedHour !== hour);
      } else {
        return [...prevSelectedHours, hour];
      }
    });
    console.log(selectedHours)
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
      await actions.apiFetch(`/unblock/${id}`, 'DELETE');
      console.log('Hora desbloqueada exitosamente');
      handleCloseModal();
    } catch (error) {
      console.error('Error al desbloquear la hora:', error);
    }
  };
  const handleBlockSelectedHours = async () => {
    try {
      const data = {
        date: `2024-${month > 9 ? '' : '0'}${month}-${selectedDay > 9 ? '' : '0'}${selectedDay} ${hour > 9 ? '' : '0'}${hour}:00:00`,
        time: hour,
        id: `2024${month > 9 ? '' : '0'}${month}${selectedDay > 9 ? '' : '0'}${selectedDay}${hour > 9 ? '' : '0'}${hour}`,
      };
      const response = await actions.apiFetch('/block_hours', 'POST', { data });

      if (response.ok) {
        // Realizar alguna acción después de bloquear las horas
        handleCloseModal()
        console.log('Horas bloqueadas con éxito');
      } else {
        console.error('Error al bloquear horas:', response.statusText);
      }
    } catch (error) {
      console.error('Error al bloquear horas:', error);
    }
  };

  const renderModalContent = () => {
    const hours = Array.from({ length: 13 }, (_, index) => index + 8);

    return (
      <div className="modal-content">
        <h2>Horas disponibles para el día {selectedDay}</h2>
        <button onClick={handleCloseModal}>Cerrar</button>
        <button onClick={handleBlockSelectedHours}>Bloquear horas seleccionadas</button>
        <ul>
          {/* {hours.map(hour => (
            <div key={hour}>
              <input
                type="checkbox"
                id={`hourCheckbox_${hour}`}
                checked={selectedHours.includes(hour)}
                onChange={() => handleHourCheckboxChange(hour)}
              />
              <label htmlFor={`hourCheckbox_${hour}`}>{hour}</label>
            </div>
          ))} */}
          {hours.map((hour) => {
            const matchingHour = extractedInfo.some((item) => (
              item.year === 2024 &&
              item.month === month &&
              item.day === selectedDay &&
              item.hour === hour
            ));

            return (
              <li
                key={hour}
                onClick={() => handleHourClick(hour)}
                className={`pestanita ${matchingHour ? "bg-danger" : ""}`}
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
                    <button className='blockDate'>bloquear</button>
                    <button className='unblockDate'>Besbloquear</button>
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
