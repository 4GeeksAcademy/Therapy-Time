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

    const date = new Date()

    const currentDate = date.getDay() + "/" + date.getMonth() + "/" + date.getFullYear()

    const navigate = useNavigate()

    const toggleCancelModal = () => {
        setShowCancelModal(!showCancelModal)
    }

    const toggleModifyModal = () => {
        setShowModifyModal(!showModifyModal)
    }

    const goToPay = () => {
        navigate("/payments")
    }

    useEffect(() => {
        const fetchNextAppointment = async () => {
            try {
                const response = await actions.protectedFetch("/next_appointment", "GET", null);

                if (!response.ok) {
                    if (nextTurn === null) {
                        return
                    }
                    throw new Error("Error fetching next appointment");
                }
                const appointment = await response.json();
                setNextTurn(appointment);
            } catch (error) {
                console.error("Error fetching next appointment:", error);
            }
        };
        fetchNextAppointment();
    }, []);

    return (
        <div>
            <NavbarPatient />
            <div className="row">
                <div className="col-6">
                    {/* CALENDARIO ACA */}
                </div>
                <div className="col-6" style={{ backgroundColor: '#Fafafa' }}>
                    <div className="row">
                        <h3>Tu proximo turno: {nextTurn ? nextTurn.date : "No hay turnos próximos"}</h3>
                        <h4>Hora: </h4>
                        <p>Acceso a la sala virtual: </p>
                        <a href="#">{/*Agregar link al meet*/}</a>
                    </div>
                    <div className="d-flex justify-content-center p-2">
                        <button onClick={() => setShowCancelModal(true)} style={{ marginRight: '10px' }}>Cancelar turno</button>
                        <button onClick={() => setShowModifyModal(true)} style={{ marginLeft: '10px' }}>Modificar turno</button>
                        {showCancelModal && <CancelModal onClose={() => setShowCancelModal(false)} />}
                        {showModifyModal && <ModifyModal onClose={() => setShowModifyModal(false)} currentDate={currentDate} />}
                    </div>
                    <div className="row d-flex justify-content-center">
                        <button>Abonar por Mercado Pago</button>
                    </div>
                </div>
            </div>
        </div>
    )
}