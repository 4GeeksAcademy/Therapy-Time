import "../../styles/landing.css";
import React, { useState, useContext, useEffect } from "react";
import { Context } from "../store/appContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEnvelope, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { NavbarTherapist } from "../component/navbar"

export const Inbox = () => {
    const { store, actions } = useContext(Context);
    const [nameFilter, setNameFilter] = useState("");
    const [selectedConsultations, setSelectedConsultations] = useState([]);
    const [modalSuccess, setModalSuccess] = useState(false);
    const [showConfirmationModalInbox, setShowConfirmationModalInbox] = useState(false);
    const [showConfirmationModalDeleted, setShowConfirmationModalDeleted] = useState(false);
    const [activeTab, setActiveTab] = useState("inbox");
    const [showModalConsultation, setShowModalConsultation] = useState(false)
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [consultationPerPage] = useState(15);
    const [consultationData, setConsultationData] = useState({
        id: "",
        name: "",
        lastname: "",
        age: "",
        phone: "",
        consultation: ""
    });

    useEffect(() => {
        actions.getConsultations();
    }, []);

    const openModalSuccess = () => {
        setModalSuccess(true);
    };

    const closeModalSuccess = () => {
        setModalSuccess(false);
    };

    const closeConfirmationModal = () => {
        setShowConfirmationModalInbox(false);
    };

    const openConfirmationModalDeleted = () => {
        setShowConfirmationModalDeleted(true)
    };

    const closeConfirmationModalDeleted = () => {
        setShowConfirmationModalDeleted(false)
    };

    const closeModalConsultation = () => {
        setShowModalConsultation(false)
    };

    const openModalConsultation = () => {
        setShowModalConsultation(true)
    };

    const handleNameFilterChange = (event) => {
        setNameFilter(event.target.value);
        setShowUnreadOnly(false);
    };

    const handleMarkAsUnread = async () => {
        try {
            await Promise.all(selectedConsultations.map(id => actions.changeStatusConsultation(id)));
            await actions.getConsultations();
            setSelectedConsultations([...store.consultations.filter(consultation => !consultation.is_deleted).sort((a, b) => new Date(b.arrival_date) - new Date(a.arrival_date))]);
            setSelectedConsultations([]);
        } catch (error) {
            console.error("Error al marcar las consultas como no leídas:", error.message);
        }
    };

    const handleDeleteSelectedConsultations = async () => {
        try {
            setShowConfirmationModalInbox(true);
        } catch (error) {
            console.error("Error al eliminar las consultas seleccionadas:", error.message);
        }
    };

    const filteredConsultations = store.consultations
        .filter(consultation => {
            if (activeTab === "inbox") {
                return !consultation.is_deleted;
            } else if (activeTab === "deleted") {
                return consultation.is_deleted;
            }
        })
        .filter(consultation =>
            consultation.name.toLowerCase().includes(nameFilter.toLowerCase()) ||
            consultation.lastname.toLowerCase().includes(nameFilter.toLowerCase())
        )
        .filter(consultation => !showUnreadOnly || !consultation.is_read)
        .sort((a, b) => new Date(b.arrival_date) - new Date(a.arrival_date));

    const handleConsultationClick = async (id, event) => {
        try {
            if (event && event.target.tagName.toLowerCase() !== "input") {
                const data = await actions.getOneConsultation(id);
                setConsultationData(data);
                // Abres el modal de consulta
                setShowModalConsultation(true);
                // Si la consulta está marcada como no leída, la marcamos como leída
                if (!data.is_read) {
                    await actions.markConsultationAsRead(id);
                    await actions.getConsultations();
                }
            }
        } catch (error) {
            console.error("Error al obtener la consulta:", error.message);
        }
    };

    const handleDeleteSingleConsultation = async (id) => {
        try {
            setShowConfirmationModalInbox(true);
            setSelectedConsultations([id]);
        } catch (error) {
            console.error("Error al eliminar la consulta:", error.message);
        }
    };

    const confirmDeletion = async () => {
        try {
            setShowConfirmationModalInbox(false);
            await Promise.all(selectedConsultations.map(id => actions.logicalDeletionMessage(id)));
            setSelectedConsultations([]);
            openModalSuccess();
            await actions.getConsultations();

        } catch (error) {
            console.error("Error al eliminar las consultas seleccionadas:", error.message);
        }
    };

    const handleCheckboxChange = (consultationId) => {
        setSelectedConsultations(prevState => {
            if (prevState.includes(consultationId)) {
                return prevState.filter(id => id !== consultationId);
            } else {
                return [...prevState, consultationId];
            }
        });
    };

    const handleMarkAsUnreadSingle = async (id) => {
        try {
            await actions.changeStatusConsultation(id);
            await actions.getConsultations();
        } catch (error) {
            console.error("Error al marcar la consulta como no leída:", error.message);
        }
    };

    const confirmPhysicalDeletion = async (id) => {
        try {
            await Promise.all(id.map(id => actions.physicalDeletionMessage(id)));
            await actions.getConsultations();
            closeConfirmationModalDeleted();
            openModalSuccess();
            setSelectedConsultations([]);
        } catch (error) {
            console.error("Error al eliminar permanentemente las consultas seleccionadas:", error.message);
        }
    };

    const handlePhysicalDeletion = async (id) => {
        try {
            setSelectedConsultations([id]);
            openConfirmationModalDeleted();
        } catch (error) {
            console.error("Error al eliminar el mensaje:", error.message);
        }
    };

    const handlePermanentDeletion = async () => {
        openConfirmationModalDeleted();
    };

    const indexOfLastConsultation = currentPage * consultationPerPage;
    const indexOfFirstConsultation = indexOfLastConsultation - consultationPerPage;
    const currentConsultations = filteredConsultations.slice(indexOfFirstConsultation, indexOfLastConsultation);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div style={{ backgroundColor: 'white', minHeight: '100vh', minWidth: '100vw' }}>
            <div className="container mt-5 border" style={{ paddingTop: '1vh' }}>
                <ul className="nav nav-tabs" >
                    <li className="nav-item">
                        <button className={`nav-link ${activeTab === "inbox" ? "active" : "text-muted"}`} onClick={() => handleTabChange("inbox")}>Bandeja de entrada</button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link ${activeTab === "deleted" ? "active" : "text-muted"}`} onClick={() => handleTabChange("deleted")}>Papelera</button>
                    </li>
                </ul>
                <div>
                    <div className="container-fluid mt-3 mb-3">
                        <div className="row aling-items-center">
                            <div className="col-md-3">
                                <input type="text" className="form-control" placeholder="Buscar por nombre o apellido" value={nameFilter} onChange={handleNameFilterChange} />
                            </div>
                            <div className="col-md-3">
                                <div className="form-check">
                                    <input className="form-check-input mt-2" type="checkbox" checked={showUnreadOnly} onChange={() => setShowUnreadOnly(!showUnreadOnly)} id="showUnreadOnly" />
                                    <label className="form-check-label mt-1" htmlFor="showUnreadOnly" style={{ color: 'grey' }}>
                                        Mostrar solo no leídos
                                    </label>
                                </div>
                            </div>
                            <div className="col-md-6 d-flex justify-content-end">
                                {activeTab === "inbox" && (
                                    <>
                                        <button style={{ border: 'none', backgroundColor: 'transparent' }} onClick={handleMarkAsUnread}>
                                            <FontAwesomeIcon icon={faEnvelope} title="Marcar como no leído" style={{ color: '#B2A79F', fontSize: '3vh' }} />
                                        </button>
                                        <button style={{ border: 'none', backgroundColor: 'transparent' }} onClick={handleDeleteSelectedConsultations}>
                                            <FontAwesomeIcon icon={faTrash} title="Eliminar" style={{ color: '#B2A79F', fontSize: '3vh', marginLeft: '3vh' }} />
                                        </button>
                                    </>
                                )}
                                {activeTab === "deleted" && (
                                    <a href="#" onClick={handlePermanentDeletion} style={{ color: 'grey' }}>Eliminar permanentemente</a>
                                )}
                            </div>
                        </div>
                    </div>
                    {filteredConsultations.length > 0 ? (
                        <table className="table table-hover">
                            <tbody style={{ color: 'grey' }}>
                                {currentConsultations.map((consultation, index) => (
                                    <tr key={index} style={{ backgroundColor: consultation.is_read ? '#f2f2f2' : 'white' }} onClick={() => handleConsultationClick(consultation.id)}>
                                        <td className="align-middle">
                                            <input type="checkbox" style={{ marginLeft: '2vh' }} checked={selectedConsultations.includes(consultation.id)} onChange={() => handleCheckboxChange(consultation.id)} />
                                        </td>
                                        <td className="align-middle" onClick={() => handleConsultationClick(consultation.id, event)}>{consultation.arrival_date}</td>
                                        <td className="align-middle" onClick={() => handleConsultationClick(consultation.id, event)} style={{ width: '20%' }}>{consultation.name} {consultation.lastname}</td>
                                        <td className="align-middle" onClick={() => handleConsultationClick(consultation.id, event)} style={{ width: '40%' }}>{consultation.consultation.substring(0, 50)}...</td>
                                        {activeTab === "deleted" && (
                                            <td className="align-middle">
                                                <button className="btn" style={{ backgroundColor: 'transparent', border: 'none' }} onClick={() => handlePhysicalDeletion(consultation.id)}>
                                                    <FontAwesomeIcon icon={faTrash} style={{ color: '#6c757d' }} />
                                                </button>
                                            </td>
                                        )}
                                        {activeTab === "inbox" && (
                                            <td className="align-middle text-end">
                                                <button className="btn me-2" style={{ backgroundColor: 'transparent', border: 'none' }} onClick={() => handleDeleteSingleConsultation(consultation.id)}>
                                                    <FontAwesomeIcon icon={faTrash} style={{ color: '#6c757d' }} />
                                                </button>
                                                <button className="btn" style={{ backgroundColor: 'transparent', border: 'none' }} onClick={() => handleMarkAsUnreadSingle(consultation.id)}>
                                                    <FontAwesomeIcon icon={faEnvelope} style={{ color: '#6c757d' }} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="alert" role="alert" style={{ backgroundColor: '#FAFAFA', color: '#7E7E7E' }}>
                            No hay registros disponibles.
                        </div>
                    )}
                </div>
                <nav>
                    <ul className="pagination">
                        {Array.from({ length: Math.ceil(filteredConsultations.length / consultationPerPage) }, (_, i) => (
                            <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                <button style={{ backgroundColor: '#B2A79F', color: 'white', border: '1px solid transparent', outline: 'none' }} className="page-link" onClick={() => paginate(i + 1)}>{i + 1}</button>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className={`modal fade ${showConfirmationModalInbox ? 'show d-block' : 'd-none'}`} id="confirmationModalInbox" tabIndex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ textAlign: 'left' }} id='contactModal'>
                            <div className="modal-header">
                                <h5 className="modal-title" id="confirmationModalLabel">Confirmación</h5>
                                <button type="button" className="btn_close_contact" onClick={closeConfirmationModal} aria-label="Close">X</button>
                            </div>
                            <div className="modal-body">
                                ¿Estás seguro de continuar?
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-guardar" onClick={() => setShowConfirmationModalInbox(false)}>Cancelar</button>
                                <button type="button" className="btn btn-guardar-contact" onClick={confirmDeletion}>Eliminar</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`modal fade ${showConfirmationModalDeleted ? 'show d-block' : 'd-none'}`} id="confirmationModalDeleted" tabIndex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ textAlign: 'left' }} id='contactModal'>
                            <div className="modal-header">
                                <h5 className="modal-title" id="confirmationModalLabel">Confirmación</h5>
                                <button type="button" className="btn_close_contact" onClick={closeConfirmationModalDeleted} aria-label="Close">X</button>
                            </div>
                            <div className="modal-body">
                                Los mensajes seran eliminados de forma permanente. ¿Estás seguro de que deseas continuar?
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-guardar" onClick={() => setShowConfirmationModalDeleted(false)}>Cancelar</button>
                                <button type="button" className="btn btn-guardar-contact" onClick={() => confirmPhysicalDeletion(selectedConsultations)}>Eliminar</button>
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
                <div className={`modal fade ${showModalConsultation ? 'show d-block' : 'd-none'}`} id="showConsultation" tabIndex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ textAlign: 'left' }} id='contactModal'>
                            <div className="modal-header d-flex justify-content-between align-items-center">
                                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" onClick={closeModalConsultation} />
                                <div className="d-flex align-items-center">
                                    <p>{consultationData.arrival_date}</p>
                                </div>
                            </div>
                            <div className="modal-body">
                                <div>
                                    <p>Nombre completo: {consultationData.name} {consultationData.lastname}</p>
                                    <p>Edad: {consultationData.age}</p>
                                    <p>Teléfono: {consultationData.phone}</p>
                                    <p>Consulta: {consultationData.consultation}</p>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-guardar-contact" data-bs-dismiss="modal" onClick={closeModalConsultation}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Inbox;
