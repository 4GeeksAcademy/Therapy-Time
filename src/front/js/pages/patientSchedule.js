import React, { useState, useEffect, useContext } from 'react';
import { Context } from "../store/appContext";

import "../../styles/calendar.css";

export const PatientSchedule = () => {
    const { actions } = useContext(Context);
    const [calendar, setCalendar] = useState([]);
    const [month, setMonth] = useState(1);
    const [selectedDay, setSelectedDay] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedHour, setSelectedHour] = useState(null);
    const [scheduledHours, setScheduledHours] = useState([]);
    const [showScheduleButton, setShowScheduleButton] = useState(false);

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
        const currentYear = new Date().getFullYear();
        const currentDate = new Date(currentYear, month - 1, 1);
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
    }, [month, showModal]);

    const handleDayClick = (day) => {
        setSelectedDay(day);
        setShowModal(true);
    };

    const handleHourClick = (hour) => {
        setSelectedHour(hour);
        setShowScheduleButton(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setShowScheduleButton(false);
    };

    const handleScheduleAppointment = async () => {
        if (selectedHour !== null && selectedDay !== null) {
            const data = {
                date: `2024-${month > 9 ? '' : '0'}${month}-${selectedDay > 9 ? '' : '0'}${selectedDay}`,
                time: selectedHour
            };

            try {
                await actions.apiFetch('/schedule', 'POST', data);
                console.log('Cita agendada exitosamente');
                setScheduledHours([...scheduledHours, selectedHour]);
            } catch (error) {
                console.error('Error al agendar cita:', error);
            }
        }
    };

    const handleCancelAppointment = async () => {
        if (selectedHour !== null && selectedDay !== null) {
            const id = selectedHour; // O cualquier otro identificador único que uses en tu backend

            try {
                await actions.apiFetch(`/cancel/${id}`, 'DELETE');
                console.log('Cita cancelada exitosamente');
                const updatedScheduledHours = scheduledHours.filter(hour => hour !== selectedHour);
                setScheduledHours(updatedScheduledHours);
            } catch (error) {
                console.error('Error al cancelar cita:', error);
            }
        }
    };

    const renderModalContent = () => {
        const hours = Array.from({ length: 13 }, (_, index) => index + 8);

        return (
            <div className="modal-content">
                <h2>Horas disponibles para el día {selectedDay}</h2>
                <button onClick={handleCloseModal}>Cerrar</button>
                <ul>
                    {hours.map((hour) => {
                        const isScheduled = scheduledHours.includes(hour);
                        const hourClass = isScheduled ? "bg-warning" : "bg-green";

                        return (
                            <li
                                key={hour}
                                onClick={() => handleHourClick(hour)}
                                className={`pestanita ${hourClass}`}
                            >
                                {hour}:00 - {hour + 1}:00
                            </li>
                        );
                    })}
                </ul>
                {showScheduleButton && (
                    <div>
                        <button onClick={handleScheduleAppointment}>Agendar Cita</button>
                        <button onClick={handleCancelAppointment}>Cancelar Cita</button>
                    </div>
                )}
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
}
