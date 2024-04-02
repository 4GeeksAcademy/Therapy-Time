import React, { useState, useContext, useEffect } from "react";
import { Context } from "../store/appContext";
import { Link } from "react-router-dom";
import "../../styles/home.css";
import moment from 'moment';
import 'moment/locale/es';
import "../../styles/landing.css";

export const HomePatient = () => {
    const { actions } = useContext(Context);
    const [virtualLink, setVirtualLink] = useState(null);
    const [nextReservation, setNextReservation] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [modalSuccess, setModalSuccess] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const virtualLinkResp = await actions.getVirtualLink();
                const reservationResp = await actions.getPatientReservation();

                if (!virtualLinkResp.error) {
                    setVirtualLink(virtualLinkResp.virtual_link);
                } else {
                    console.error("Error al obtener el link de sala virtual: ", virtualLinkResp.error);
                }

                if (!reservationResp.error) {
                    const adjustedDate = moment.utc(reservationResp.date).utcOffset(reservationResp.date);
                    reservationResp.date = adjustedDate;

                    setNextReservation(reservationResp);
                } else {
                    console.error("Error al obtener la próxima reservación: ", reservationResp.error);
                }
            } catch (error) {
                console.error("Error en la solicitud: ", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const formatReservationDateTime = (dateTime) => {
        const formattedDateTime = moment(dateTime).format('dddd DD/MM [a las] HH:mm');
        return formattedDateTime.charAt(0).toUpperCase() + formattedDateTime.slice(1);
    };

    const handleCancelReservation = () => {
        setShowSuccessModal(true);
    };

    const confirmCancelReservation = async () => {
        try {
            const response = await actions.deleteReservation(nextReservation.id);
            console.log("Respuesta de la cancelación de la reservación:", response);
            if (response.message === 'Reserva cancelada exitosamente') {
                setModalSuccess(true);
                console.log("Reservación cancelada exitosamente");
                setNextReservation(null);
            } else {
                console.error("Error al cancelar la reservación: ", response.message);
            }
        } catch (error) {
            console.error("Error al cancelar la reservación: ", error);
        } finally {
            setShowSuccessModal(false);
        }
    };

    const closeSuccessModal = () => {
        setShowSuccessModal(false);
    };

    const closeModalSuccess = () => {
        setModalSuccess(false)
    };

    return (
        <div className="text-center homepatient conteiner-fluid" style={{ height: '87.8vh', backgroundColor: '#EDE9E9' }}>
            <div className="container" style={{ fontFamily: 'Nanum Gothic, sans-serif', paddingTop: '11vh' }}>
                <div className="row">
                    <div className="col-6 p-4" style={{ height: '60vh', backgroundColor: '#FAFAFA', backgroundImage: 'url(https://github.com/4GeeksAcademy/finalProject-LATAM-pt25/blob/dating_blocking/src/front/img/logoPaciente.png?raw=true)' }}>
                        <h2 style={{ textAlign: 'left', maxWidth: '40%', color: '#808080' }}>Tu próximo</h2>
                        <div className="d-flex">
                            <h2 style={{ textAlign: 'left', marginBottom: '6vh', maxWidth: '40%', color: '#808080' }}>turno:</h2>
                            {loading ? (
                                <div className="spinner-border" role="status" style={{ width: '1.2rem', height: '1.2rem', color: '#bdb76b', marginTop: '1.4vh', marginLeft: '1.2vh', borderWidth: '0.1rem' }}>
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            ) : (
                                <>
                                    {nextReservation ? (
                                        <h5 style={{ marginTop: '1.5vh', color: '#bdb76b', marginLeft: '3vh', fontStyle: 'oblique' }}>
                                            {`${formatReservationDateTime(nextReservation.date)}`}
                                        </h5>
                                    ) : (
                                        <h5 style={{ marginTop: '1.5vh', color: '#bdb76b', marginLeft: '3vh', fontStyle: 'oblique' }}>Sin turno agendado</h5>
                                    )}
                                </>
                            )}
                        </div>
                        {virtualLink ? (
                            <a href={virtualLink} target="_blank" className="btn btn-block" style={{ width: '99%', marginBottom: '3.5vh', height: '8vh', backgroundColor: '#bdb5b5', color: 'white', fontFamily: 'Jura, sans-serif', fontSize: '3vh' }}>Acceso a sala virtual</a>
                        ) : (
                            <button disabled className="btn btn-block" style={{ width: '99%', marginBottom: '3.5vh', height: '8vh', backgroundColor: '#bdb5b5', color: 'white', fontFamily: 'Jura, sans-serif', fontSize: '3vh' }}>Acceso a sala virtual</button>
                        )}
                        <div className="d-flex ustify-content-between " style={{ marginBottom: '3.5vh', fontFamily: 'Jura, sans-serif' }}>
                            <button className="btn " disabled={!nextReservation} onClick={handleCancelReservation} style={{ width: '98%', height: '8vh', backgroundColor: '#bdb5b5', color: 'white', fontSize: '3vh' }}>Cancelar</button>
                            {nextReservation ? (
                                <Link to="/edit_date" className="btn " style={{ width: '98%', height: '8vh', backgroundColor: '#bdb5b5', color: 'white', fontSize: '3vh' }}>Modificar</Link>
                            ) : (
                                <button className="btn" disabled={true} style={{ width: '98%', height: '8vh', backgroundColor: '#bdb5b5', color: 'white', fontSize: '3vh', pointerEvents: 'none', display: 'block', textDecoration: 'none' }}>Modificar</button>
                            )}
                        </div>
                        <Link to="/payment"><button className="btn btn-block" disabled={!nextReservation} style={{ width: '99%', height: '8vh', fontFamily: 'Jura, sans-serif', backgroundColor: '#bdb5b5', color: 'white', fontSize: '3vh' }}>Abonar con Mercado Pago</button></Link>
                    </div>
                    <div className="col-6 p-4 d-flex flex-column align-items-center justify-content-center" style={{ height: '60vh', backgroundColor: '#FAFAFA', color: 'grey', borderLeftColor: '#EDE9E9', borderLeftWidth: '2vh', borderLeftStyle: 'solid' }}>
                        <div className="p-4 border d-flex flex-column align-items-center justify-content-center" style={{ height: '40vh' }}>
                            <p>Para solicitar un nuevo turno ingresá al siguiente enlace:</p>
                            <Link to="/new_date" className="border p-2" style={{ fontSize: '2.5vh', backgroundColor: '#8A97A6', color: 'white', width: '40vh', borderRadius: '0.5vh', fontFamily: 'Jura, sans-serif' }}>Nuevo Turno</Link>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`modal fade ${showSuccessModal ? 'show d-block' : 'd-none'}`} id="showSuccessModal" tabIndex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content" style={{ textAlign: 'left' }} id="contactModal">
                        <div className="modal-header justify-content-end">
                            <button type="button" className="btn_close_contact" onClick={closeSuccessModal} aria-label="Close">X</button>
                        </div>
                        <div className="modal-body">
                            <span>¿Seguro desea cancelar su próximo turno?</span>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-guardar" onClick={closeSuccessModal}>Cancelar</button>
                            <button type="button" className="btn btn-guardar-contact" onClick={confirmCancelReservation}>Confirmar</button>
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
        </div>
    );
};
