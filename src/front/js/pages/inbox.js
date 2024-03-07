import React, { useState, useContext, useEffect } from "react";
import { Context } from "../store/appContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEnvelope, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

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
        name : "",
        lastname : "",
        age : "",    
        phone : "",
        consultation : ""
    });

    useEffect(() => {
        actions.getConsultations();
    }, []);

    //Apertura y cierre de modales
    const openModalSuccess = () => {
        setModalSuccess(true);
    }
    const closeModalSuccess = () => {
        setModalSuccess(false);
    }
    const closeConfirmationModal = () => { 
        setShowConfirmationModalInbox(false);
    }
    const openConfirmationModalDeleted = () =>{
        setShowConfirmationModalDeleted(true)
    }
    const closeConfirmationModalDeleted = () =>{
        setShowConfirmationModalDeleted(false)
    }
    const closeModalConsultation = () =>{
        setShowModalConsultation(false)
    }
    const openModalConsultation = ()=>{
        setShowModalConsultation(true)
    }
    
    //Filtros de busqueda-seleccion
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
                openModalConsultation();
            }
        } catch (error) {
            console.error("Error al obtener la consulta:", error.message);
        }
    };
    
    //Funciones para tab inbox
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
    const handleMarkAsUnreadSingle = async (consultationId) => {
        try {
            await actions.changeStatusConsultation(consultationId);
            await actions.getConsultations();
        } catch (error) {
            console.error("Error al marcar la consulta como no leída:", error.message);
        }
    };

    //Funciones para tab papelera
    const confirmPhysicalDeletion = async (ids) => {
        try {
            await Promise.all(ids.map(id => actions.physicalDeletionMessage(id)));
            await actions.getConsultations();
            closeConfirmationModalDeleted(); 
            openModalSuccess(); 
            setSelectedConsultations([]); 
        } catch (error) {
            console.error("Error al eliminar permanentemente las consultas seleccionadas:", error.message);
        }
    }
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

    //Paginacion
    const indexOfLastConsultation = currentPage * consultationPerPage;
    const indexOfFirstConsultation = indexOfLastConsultation - consultationPerPage;
    const currentConsultations = filteredConsultations.slice(indexOfFirstConsultation, indexOfLastConsultation);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="container mt-5">
            <ul className="nav nav-tabs">
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === "inbox" ? "active" : ""}`} onClick={() => handleTabChange("inbox")}>Bandeja de entrada</button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === "deleted" ? "active" : ""}`} onClick={() => handleTabChange("deleted")}>Papelera</button>
                </li>
            </ul>
            <div>
                <div className="container-fluid mt-3 mb-3">
                    <div className="row">
                        <div className="col-md-4">
                            <input type="text" className="form-control" placeholder="Buscar por nombre o apellido" value={nameFilter} onChange={handleNameFilterChange} />
                        </div>
                        <div className="col-md-3">
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" checked={showUnreadOnly} onChange={() => setShowUnreadOnly(!showUnreadOnly)} id="showUnreadOnly" />
                                <label className="form-check-label" htmlFor="showUnreadOnly">
                                    Mostrar solo no leídos
                                </label>
                            </div>
                        </div>
                        <div className="col-md-5 d-flex justify-content-end">
                            {activeTab === "inbox" && (
                                <>
                                    <button onClick={handleMarkAsUnread}><FontAwesomeIcon icon={faEnvelope} title="Marcar como no leído"/></button>
                                    <button onClick={handleDeleteSelectedConsultations}><FontAwesomeIcon icon={faTrash} title="Eliminar" /></button>
                                </>
                            )}
                            {activeTab === "deleted" && (
                                <a href="#" onClick={handlePermanentDeletion}>Eliminar permanentemente</a>
                            )}
                        </div>
                    </div>
                </div>
                <table className="table table-hover">
                    <tbody>
                        {currentConsultations.map((consultation, index) => (
                            <tr key={index} className={consultation.is_read ? 'bg-light' : 'bg-white'}  onClick={() => handleConsultationClick(consultation.id, event)}>
                                <td>
                                    <input type="checkbox" checked={selectedConsultations.includes(consultation.id)} onChange={() => handleCheckboxChange(consultation.id)} />
                                </td>
                                <td>{consultation.arrival_date}</td>
                                <td>{consultation.name} {consultation.lastname}</td>
                                <td>{consultation.consultation.substring(0, 50)}...</td>
                                {activeTab === "deleted" && (
                                    <td>
                                        <button onClick={() => handlePhysicalDeletion(consultation.id)}>
                                            <FontAwesomeIcon icon={faTrash}/>
                                        </button>
                                    </td>
                                )}
                                {activeTab === "inbox" && (
                                    <td>
                                        <button><FontAwesomeIcon icon={faTrash} onClick={handleDeleteSelectedConsultations} /></button>
                                        <button><FontAwesomeIcon icon={faEnvelope} onClick={() => handleMarkAsUnreadSingle(consultation.id)} /></button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <nav>
                <ul className="pagination">
                    {Array.from({length: Math.ceil(filteredConsultations.length / consultationPerPage)}, (_, i) => (
                        <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => paginate(i + 1)}>{i + 1}</button>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className={`modal fade ${showConfirmationModalInbox ? 'show d-block' : 'd-none'}`} id="confirmationModalInbox" tabIndex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="confirmationModalLabel">Confirmación</h5>
                            <button type="button" className="btn-close" onClick={closeConfirmationModal} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            ¿Estás seguro de continuar?
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmationModalInbox(false)}>Cancelar</button>
                            <button type="button" className="btn btn-danger" onClick={confirmDeletion}>Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`modal fade ${showConfirmationModalDeleted ? 'show d-block' : 'd-none'}`} id="confirmationModalDeleted" tabIndex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="confirmationModalLabel">Confirmación</h5>
                            <button type="button" className="btn-close" onClick={closeConfirmationModal} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            Los mensajes seran eliminados de forma permanente. ¿Estás seguro de que deseas continuar?
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmationModalDeleted(false)}>Cancelar</button>
                            <button type="button" className="btn btn-danger" onClick={() => confirmPhysicalDeletion(selectedConsultations)}>Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`modal fade ${modalSuccess ? 'show d-block' : 'd-none'}`} id="successModal" tabIndex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="btn-close" onClick={closeModalSuccess} aria-label="Close"></button>
                        </div>
                        <div className="modal-body d-flex justify-content-center">
                            <span>Eliminación exitosa.</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`modal fade ${showModalConsultation ? 'show d-block' : 'd-none'}`} id="showConsultation" tabIndex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header d-flex justify-content-between align-items-center">
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" onClick={closeModalConsultation}/>
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
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={closeModalConsultation}>Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Inbox;
