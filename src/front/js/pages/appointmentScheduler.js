import "../../styles/appointmentScheduler.css";
import React, { useState, useEffect, useContext } from 'react';
import { NavbarTherapist } from "../component/navbar.js"
import { Context } from "../store/appContext";

export const AppointmentScheduler = () => {
    const { actions } = useContext(Context);
    const [calendar, setCalendar] = useState([]);
    const [month, setMonth] = useState(1); //empieza en enero
    const [selectedDay, setSelectedDay] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedHours, setSelectedHours] = useState([]);
    const [unavailableDates, setUnavailableDates] = useState([]);
    const [extractedInfo, setExtractedInfo] = useState([]);
    const [userId, setUserId] = useState("")
    const [userData, setUserData] = useState({
        user_id: "",
        date_id: ""
    });
    const initialUserData = {
        id: "",
        role_id: 1,
        username: "",
        name: "",
        lastname: "",
        dni: "",
        phone: "",
        email: "",
        virtual_link: "",
        is_active: true
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
            const response = await actions.apiFetch('/fetch_bloquear', 'GET');
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
        if (unavailableDates.length > 0) {
            const extractedInfo = unavailableDates.map(item => {
                const { month, year, day, hour } = extractDateInfo(item.date);
                return { year, month, day, hour };
            });
            setExtractedInfo(extractedInfo);
        }

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
    useEffect(() => {
        const user = actions.getUsers();
        setUserData(initialUserData);
        console.log(user)
    }, []);

    const handleChangeName = (e) => {
        setUserId(e.target.value)
        console.log(userId)
    };
    const handleChangeDni = (e) => {
        setUserData({ ...userData, dni: `${e.target.value}` })
        console.log(userData)
    };
    const handleDayClick = (day) => {
        setSelectedDay(day);
        setShowModal(true);
        //console.log("se seleccionó el día: ", selectedDay)

    };
    const handleCloseModal = () => {
        setShowModal(false);
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

        handleCloseModal()
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

    const renderModalContent = () => {
        const hours = Array.from({ length: 13 }, (_, index) => index + 8);

        return (
            <div className="modal-content">
                <h2>Horas disponibles para el día {selectedDay}</h2>
                <button onClick={handleCloseModal}>Cerrar</button>
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
                                onClick={() => matchingHour ? pass : handleSelectHours(data)}
                                className={`pestanita 
                          ${matchingHour ? "bg-danger" : ""}
                          ${isSelected ? "selected" : ""}
                          `}
                            >
                                {hour}:00 - {hour + 1}:00
                                {matchingHour ? null :
                                    <div className="botones">
                                        <button className='blockDate' onClick={() => handleBlockTime(hour)}>Bloquear Hora</button>
                                        <button className='unblockDate' onClick={() => handleUnblockTime(hour)}>Desbloquear Hora</button>
                                    </div>}
                            </li>
                        );
                    })}
                </ul>

            </div>
        );
    };

    return (
        <div className="container-fluid">
            <NavbarTherapist></NavbarTherapist>
            <div className="row d-flex justify-content-around mt-5">
                <div className="col-md-5 d-flex flex-column justify-content-center">
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
                <div className="col-md-5 d-flex justify-content-center">
                    <div className="card p-4">
                        <h2 className="text-center mb-4">Selección de Pacientes</h2>
                        <form>
                            <div className="form-group">
                                <div className="form-check">
                                    <input type="checkbox" className="form-check-input" id="esPaciente" />
                                    <label className="form-check-label" htmlFor="esPaciente">Es paciente</label>
                                </div>
                                <div className="form-check">
                                    <input type="checkbox" className="form-check-input" id="nuevoPaciente" />
                                    <label className="form-check-label" htmlFor="nuevoPaciente">Nuevo paciente</label>
                                </div>
                            </div>
                            <div className="form-group">

                                <input type="text" className="form-control" id="filtroNombre" placeholder="Filtrar por nombre" onChange={handleChangeName} />
                            </div>
                            <div className="form-group">

                                <input type="text" className="form-control" id="filtroDni" placeholder="Filtrar por DNI" onChange={handleChangeDni} />
                            </div>
                            <div className="form-group">

                                <input type="text" className="form-control" id="nombreCompleto" placeholder="Ingresar nombre completo" />
                            </div>
                            <button type="submit" className="btn btn-primary btn-block">Confirmar</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
