import React, { useState, useContext, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrashAlt, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { NavbarTherapist } from "../component/navbar";
import { Context } from "../store/appContext";
import { SchedulingTherapistEdit } from "../component/editRservation";
import { SchedulingTherapist } from "../component/schedulingTherapist"
import { SchedulingNonRegistered } from "../component/schedulingNonRegistered"
import "../../styles/landing.css";

export const AppointmentScheduler = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const { store, actions } = useContext(Context);
    const [reservations, setReservations] = useState([]);
    const [activeTab, setActiveTab] = useState("inbox");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [modalSuccess, setModalSuccess] = useState(false);
    const [reservationIdToDelete, setReservationIdToDelete] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [users, setUsers] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [searchError, setSearchError] = useState('');
    const [searchType, setSearchType] = useState("");
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        lastname: "",
        phone: "",
        dni: ""
    });

    const clearForm = () => {
        setFormData({
            id: "",
            name: "",
            lastname: "",
            phone: "",
            dni: ""
        });
    };

    const clearNonUserForm = () => {
        setNonUserData({
            name: "",
            lastname: "",
            phone: "",
            dni: ""
        });
    };

    const updateReservations = () => {
        actions.getAllReservations();
    };

    const [nonUserData, setNonUserData] = useState({
        name: "",
        lastname: "",
        phone: "",
        dni: ""
    });

    const handleFormChangeNonUser = (event) => {
        const { name, value } = event.target;
        setNonUserData({
            ...nonUserData,
            [name]: value
        });
    };

    const handleSearchTypeChange = (type) => {
        setSearchType(type);
    };

    useEffect(() => {
        if (activeTab === "Papelera") {
            setSearchType("active");
        }
    }, [activeTab]);


    useEffect(() => {
        actions.getAllReservations();
        actions.getGlobalEnabled();
    }, []);

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchValue(value);
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSearchSubmit = async (event) => {
        if (event) {
            event.preventDefault();
        }
        try {
            const { success, message } = await actions.searchUserByDNI(searchValue);
            if (success) {
                const user = store.userByDNI;
                if (user && user.id) {
                    setFormData({
                        id: user.id,
                        name: user.name,
                        lastname: user.lastname,
                        phone: user.phone,
                        dni: user.dni
                    });
                    setSearchValue('');
                } else if (dni.length > 8 || dni.length < 8) {
                    setSearchError("El DNI debe tener 8 números.")
                } else {
                    setSearchError("No existen usuarios registrados con ese DNI.");
                }

            } else {
                console.log(message);
            }
        } catch (error) {
            console.error("Error al buscar usuario:", error.message);
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await actions.getUsers();
                setUsers(data);
            } catch (error) {
                console.error("Error al obtener usuarios:", error.message);
            }
        };
        fetchUsers();
    }, []);

    const handleDeleteConfirmation = (reservationId) => {
        setReservationIdToDelete(reservationId);
        setShowSuccessModal(true);
    };

    const handleConfirmDelete = async () => {
        const result = await actions.deleteReservation(reservationIdToDelete);
        if (result.error) {
            console.error("Error al intentar cancelar la reserva: ", result.error);
        } else {
            console.log("Reserva cancelada exitosamente");
            setShowSuccessModal(false);
            setModalSuccess(true);
            actions.getAllReservations();
        }
    };

    const handleCloseModal = () => {
        setShowSuccessModal(false);
    };

    const closeModalSuccess = () => {
        setModalSuccess(false);
        actions.getAllReservations();
        setFormData({
            id: "",
            name: "",
            lastname: "",
            phone: "",
            dni: ""
        })
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setFormData({
            id: "",
            name: "",
            lastname: "",
            phone: "",
            dni: ""
        })
    };

    useEffect(() => {
        const filterReservations = () => {
            if (activeTab === "inbox") {
                const filteredReservations = store.reservations.filter(reservation => {
                    const reservationDate = new Date(reservation.fecha);
                    return reservationDate.toDateString() === currentDate.toDateString();
                });
                setReservations(filteredReservations);
            } else {
                setReservations(store.reservations);
            }
        };
        filterReservations();
    }, [currentDate, activeTab, store.reservations]);

    const handlePrevDay = () => {
        const prevDate = new Date(currentDate);
        prevDate.setDate(prevDate.getDate() - 1);
        setCurrentDate(prevDate);
    };

    const handleNextDay = () => {
        const nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + 1);
        setCurrentDate(nextDate);
    };

    const formatDate = date => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        let formattedDate = date.toLocaleDateString('es-ES', options);
        formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
        return formattedDate;
    };

    const generateTimeSlots = () => {
        const timeSlots = [];
        for (let hour = 8; hour < 20; hour++) {
            const timeSlot = `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`;
            timeSlots.push(timeSlot);
        }
        return timeSlots;
    };

    const handleEdit = (idReservation) => {
        const dataReservation = reservations.find(reservation => reservation.id === idReservation);
        setSelectedReservation(dataReservation);
        setShowEditModal(true);
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearchSubmit();
        }
    };

    const handleDniInputFocus = () => {
        setFormData({
            id: "",
            name: "",
            lastname: "",
            phone: "",
            dni: ""
        });
    };

    return (
        <div style={{ backgroundColor: 'white', minHeight: '100vh', paddingBottom: '7vh' }}>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nanum+Gothic&display=swap" />
            <div className="container mt-5 border" style={{ paddingTop: '2vh', fontFamily: 'Nanum Gothic, sans-serif' }}>
                <ul className="nav nav-tabs">
                    <li className="nav-item">
                        <button className={`nav-link ${activeTab === "inbox" ? "active" : "text-muted"}`} onClick={() => handleTabChange("inbox")}>Turnos asignados</button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link ${activeTab === "Papelera" ? "active" : "text-muted"}`} onClick={() => handleTabChange("Papelera")}>Nuevo turno</button>
                    </li>
                </ul>
                <div className="container">
                    {activeTab === "inbox" && (
                        <div>
                            <div className="table-responsive mt-3">
                                <table className="table">
                                    <thead className="border" style={{ backgroundColor: '#bdb5b5', color: 'white' }}>
                                        <tr>
                                            <th colSpan="6" className="text-center border" style={{ backgroundColor: '#FAFAFA', color: 'grey' }}>
                                                <div className="d-flex justify-content-between align-items-center" style={{ maxWidth: '40%', margin: 'auto' }}>
                                                    <button className="btn" onClick={handlePrevDay} style={{ color: 'grey' }}>
                                                        <FontAwesomeIcon icon={faChevronLeft} />
                                                    </button>
                                                    <p style={{ lineHeight: 'normal', margin: 0 }}>{formatDate(currentDate)}</p>
                                                    <button className="btn" onClick={handleNextDay} style={{ color: 'grey' }}>
                                                        <FontAwesomeIcon icon={faChevronRight} />
                                                    </button>
                                                </div>
                                            </th>
                                        </tr>
                                        <tr>
                                            <th scope="col" style={{ fontWeight: 'normal' }}>Horario</th>
                                            <th scope="col" style={{ fontWeight: 'normal' }}>Paciente</th>
                                            <th scope="col" style={{ fontWeight: 'normal' }}>Contacto</th>
                                            <th scope="col" style={{ fontWeight: 'normal' }}>Sala virtual</th>
                                            <th scope="col" style={{ fontWeight: 'normal' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {generateTimeSlots().map((timeSlot, index) => {
                                            const matchingReservation = reservations.find(reservation => {
                                                const reservationDate = new Date(reservation.fecha);
                                                return reservationDate.getHours().toString().padStart(2, '0') === timeSlot.substring(0, 2);
                                            });
                                            return (
                                                <tr key={index}>
                                                    <td>{timeSlot}</td>
                                                    {matchingReservation ? (
                                                        <>
                                                            <td>{matchingReservation.nombre_paciente}</td>
                                                            <td>{matchingReservation.telefono}</td>
                                                            <td>
                                                                {matchingReservation.link_sala_virtual ? (
                                                                    <a href={matchingReservation.link_sala_virtual} target="_blank" rel="noopener noreferrer">Ingresar</a>
                                                                ) : null}
                                                            </td>
                                                            <td>
                                                                <FontAwesomeIcon icon={faPencilAlt} style={{ color: 'grey' }} onClick={() => handleEdit(matchingReservation.id)} className="btn mr-2" />
                                                                <FontAwesomeIcon icon={faTrashAlt} style={{ color: 'grey' }} className="btn" onClick={() => handleDeleteConfirmation(matchingReservation.id)} />
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td>-</td>
                                                            <td>-</td>
                                                            <td>-</td>
                                                            <td>-</td>
                                                        </>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className={`modal fade ${showSuccessModal ? 'show d-block' : 'd-none'}`} id="showSuccessModal" tabIndex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
                                <div className="modal-dialog modal-dialog-centered">
                                    <div className="modal-content" id='contactModal' style={{ textAlign: 'left' }} >
                                        <div className="modal-header justify-content-end">
                                            <button type="button" className="btn_close_contact" onClick={handleCloseModal} aria-label="Close">X</button>
                                        </div>
                                        <div className="modal-body">
                                            <span>¿Seguro desea cancelar su próximo turno?</span>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-guardar" onClick={handleCloseModal}>Cancelar</button>
                                            <button type="button" className="btn btn-guardar-contact" onClick={handleConfirmDelete}>Eliminar</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={`modal fade ${modalSuccess ? 'show d-block' : 'd-none'}`} id="successModal" tabIndex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
                                <div className="modal-dialog modal-dialog-centered">
                                    <div className="modal-content" style={{ textAlign: 'left' }} id='contactModal'>
                                        <div className="modal-header d-flex justify-content-between">
                                            <span>Eliminación exitosa.</span>
                                            <button type="button" className="btn_close_contact" onClick={closeModalSuccess} aria-label="Close">X</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={`modal fade ${showEditModal ? 'show d-block' : 'd-none'}`} id="editModal" tabIndex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
                                <div className="modal-dialog modal-dialog-centered modal-xl">
                                    <div className="modal-content" style={{ textAlign: 'left', fontFamily: 'Nanum Gothic, sans-serif' }}>
                                        <div className="modal-header">
                                            <h5 className="modal-title" id="editModalLabel">Editar turno</h5>
                                            <button type="button" className="btn-close" onClick={() => setShowEditModal(false)} aria-label="Close"></button>
                                        </div>
                                        <div className="modal-body" style={{ paddingRight: '2vh' }}>
                                            <SchedulingTherapistEdit idReservation={selectedReservation ? selectedReservation.id : null} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="container">
                    {activeTab === "Papelera" && (
                        <div>
                            <form onSubmit={handleSearchSubmit}>
                                <div className="mb-2 mt-4">
                                    <div className="form-check form-check-inline">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="searchType"
                                            id="activePatient"
                                            value="active"
                                            checked={searchType === "active"}
                                            onChange={() => handleSearchTypeChange("active")}
                                        />
                                        <label className="form-check-label" htmlFor="activePatient">Paciente activo</label>
                                    </div>
                                    <div className="form-check form-check-inline">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="searchType"
                                            id="newConsultation"
                                            value="new"
                                            checked={searchType === "new"}
                                            onChange={() => handleSearchTypeChange("new")}
                                        />
                                        <label className="form-check-label" htmlFor="newConsultation">Nueva consulta</label>
                                    </div>
                                </div>
                                {searchType === "active" && (
                                    <div>
                                        <div className="d-flex align-items-center mb-3">
                                            <div>
                                                <input type="text" className="form-control mt-3" id="searchByDNI" placeholder="Búsqueda por DNI" value={searchValue} onChange={handleSearchChange} onKeyDown={handleKeyPress} onFocus={handleDniInputFocus} />
                                            </div>
                                            <div className="mt-3">
                                                <button type="submit" className="btn btn-guardar-contact">Buscar</button>
                                            </div>
                                        </div>
                                        {searchError && <span className="text-danger">{searchError}</span>}
                                        <div className="row">
                                            <div className="col-lg-6 mb-2">
                                                <label htmlFor="name" className="form-label">Nombre:</label>
                                                <input style={{ backgroundColor: '#FAFAFA' }} type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleFormChange} readOnly />
                                            </div>
                                            <div className="col-lg-6 mb-2">
                                                <label htmlFor="lastName" className="form-label">Apellido:</label>
                                                <input style={{ backgroundColor: '#FAFAFA' }} type="text" className="form-control" id="lastname" name="lastname" value={formData.lastname} onChange={handleFormChange} readOnly />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-lg-6 mb-3">
                                                <label htmlFor="contact" className="form-label">Contacto:</label>
                                                <input style={{ backgroundColor: '#FAFAFA' }} type="text" className="form-control" id="phone" name="phone" value={formData.phone} onChange={handleFormChange} readOnly />
                                            </div>
                                            <div className="col-lg-6 mb-3">
                                                <label htmlFor="dni" className="form-label">DNI:</label>
                                                <input style={{ backgroundColor: '#FAFAFA' }} type="text" className="form-control" id="dni" name="dni" value={formData.dni} onChange={handleFormChange} readOnly />
                                            </div>
                                        </div>
                                        <div className="mt-2 mb-3">
                                            <SchedulingTherapist patientId={formData.id}  clearForm={clearForm} updateReservations={updateReservations} />
                                        </div>
                                    </div>
                                )}
                                {searchType === "new" && (
                                    <div>
                                        <div>
                                            <div className="row mt-3">
                                                <div className="col-lg-6 mb-3">
                                                    <label htmlFor="newName" className="form-label">Nombre:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="newName"
                                                        name="name"
                                                        value={nonUserData.name}
                                                        onChange={handleFormChangeNonUser}
                                                        required
                                                        style={{ backgroundColor: '#FAFAFA' }}
                                                    />
                                                </div>
                                                <div className="col-lg-6 mb-3">
                                                    <label htmlFor="newLastName" className="form-label">Apellido:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="newLastName"
                                                        name="lastname"
                                                        value={nonUserData.lastname}
                                                        onChange={handleFormChangeNonUser}
                                                        required
                                                        style={{ backgroundColor: '#FAFAFA' }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-lg-6 mb-3">
                                                    <label htmlFor="newPhone" className="form-label">Teléfono:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="newPhone"
                                                        name="phone"
                                                        value={nonUserData.phone}
                                                        onChange={handleFormChangeNonUser}
                                                        required
                                                        style={{ backgroundColor: '#FAFAFA' }}
                                                    />
                                                </div>
                                                <div className="col-lg-6 mb-3">
                                                    <label htmlFor="newDNI" className="form-label">DNI:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="newDNI"
                                                        name="dni"
                                                        value={nonUserData.dni}
                                                        onChange={handleFormChangeNonUser}
                                                        required
                                                        style={{ backgroundColor: '#FAFAFA' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-2 mb-3">
                                            <SchedulingNonRegistered formData={nonUserData} clearNonUserForm={clearNonUserForm} updateReservations={updateReservations} />
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};