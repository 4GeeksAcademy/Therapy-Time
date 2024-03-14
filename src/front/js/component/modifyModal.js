import React, { useContext } from "react";
import { Context } from "../store/appContext";

export const ModifyModal = () => {
    const { actions } = useContext(Context)

    const date = new Date()
    const currentDate = date.getDay() + "/" + date.getMonth() + "/" + date.getFullYear()

    return (
        <div className="modal" tabIndex="-1" id="modify" style={{ backgroundColor: 'white', border: 'none', color: 'grey', border: 'solid rgb(218, 217, 217) 0.5vh', fontFamily: 'Nanum Gothic' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Modificar turno</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <input
                            type="calendar"
                            placeholder={currentDate}
                            label="Seleccione una fecha"
                        />
                        <input
                            type="time"
                            placerholder="9:00"
                            label="Seleccione un horario"
                        />
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary">Confirmar</button>
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    </div>
                </div>
            </div>
        </div>
    )
}