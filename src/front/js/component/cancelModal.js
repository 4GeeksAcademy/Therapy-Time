import React, { useContext, useState } from "react";
import { Context } from "../store/appContext";

export const CancelModal = () => {
    const { actions } = useContext(Context)
    const [nextTurn, setNextTurn] = useState(null)

    const date = new Date()
    const currentDate = date.getDay() + "/" + date.getMonth() + "/" + date.getFullYear()

    const deleteAppointment = async () => {
        try {
            await actions.deleteNextAppointment()
            setNextTurn(null)
        } catch (error) {
            console.error("Error al borrar el turno: ", error)
            setAppointmentError("Error al borrar el turno")
        }
    }

    return (
        <div className="modal fade" id="cancel" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true" style={{ backgroundColor: 'white', border: 'none', color: 'grey', border: 'solid rgb(218, 217, 217) 0.5vh', fontFamily: 'Nanum Gothic' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="staticBackdropLabel">Cancelar turno</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="modal-body">
                            <p className="fw-bold">Los turnos solo se pueden cancelar con 24hs de anticipación.</p>
                            <p>¿Esta seguro que desea cancelar el turno?</p>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">No, volver</button>
                        <button type="button" className="btn btn-primary" onClick={deleteAppointment} data-bs-dismiss="modal">Si, cancelar</button>
                    </div>
                </div>
            </div>
        </div>
    )
}