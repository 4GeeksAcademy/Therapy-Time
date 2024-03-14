import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import { NavbarPatient } from "../component/navbar_patient";
import { CancelModal } from "../component/cancelModal";
import { ModifyModal } from "../component/modifyModal";

export const PatientSchedule = () => {
    const { actions } = useContext(Context)
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showModifyModal, setShowModifyModal] = useState(false);
    const [nextTurn, setNextTurn] = useState(null)
    const [appointmentError, setAppointmentError] = useState(null);

    const date = new Date()

    const currentDate = date.getDay() + "/" + date.getMonth() + "/" + date.getFullYear()

    const navigate = useNavigate()

    useEffect(() => {
        const fetchNextAppointment = async () => {
            try {
                const response = await actions.protectedFetch("/next_appointment", "GET", null);
                if (!response.ok) {
                    throw new Error("Error fetching next appointment"); // More specific error
                }

                const appointment = await response.json();

                setNextTurn(appointment);
                setAppointmentError(null); // Clear any previous error on successful fetch
            } catch (error) {
                console.error("Error fetching next appointment:", error);
                if (error.message.includes("409 Conflict")) {
                    setAppointmentError("Solo se puede cancelar con 24hs de anticipación");
                } else {
                    setAppointmentError("Error al traer proximo turno"); // Set the error message
                }
            }
        };

        fetchNextAppointment();
    }, []);

    return (
        <div>
            <NavbarPatient />
            <div className="row" style={{ marginTop: '150px' }}>
                <div className="col-6">
                    {/* CALENDARIO ACA */}
                </div>
                <div className="col-6" style={{ backgroundColor: '#Fafafa' }}>
                    <div className="row">
                        <h3>Tu proximo turno: {nextTurn ? nextTurn.date : "No hay turnos próximos"}</h3>
                        <h4>Hora: </h4>
                        <p>Acceso a la sala virtual: </p>
                        <a href="#">{/*Agregar link al meet*/}</a>
                        {appointmentError && (
                            <div className="alert alert-danger d-flex justify-content-center" role="alert">
                                {appointmentError}
                            </div>
                        )}
                    </div>
                    <div className="d-flex justify-content-center p-2">
                        <button onClick={() => setShowCancelModal(true)} data-bs-toggle="modal" data-bs-target="#cancel" style={{ marginRight: '10px' }}>Cancelar turno</button>
                        <button onClick={() => setShowModifyModal(true)} data-bs-toggle="modal" data-bs-target="#modify" style={{ marginLeft: '10px' }}>Modificar turno</button>
                        {showCancelModal && <CancelModal onClose={() => setShowCancelModal(false)} />}
                        {showModifyModal && <ModifyModal onClose={() => setShowModifyModal(false)} currentDate={currentDate} />}
                    </div>
                    <div className="d-flex justify-content-center">
                        <Link to="/payments">
                            <button>Abonar por Mercado Pago</button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}