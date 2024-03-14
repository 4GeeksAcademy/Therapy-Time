import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import { NavbarPatient } from "../component/navbar_patient";

export const CancelModal = () => {
    const { actions } = useContext(Context)

    const date = new Date()
    const currentDate = date.getDay() + "/" + date.getMonth() + "/" + date.getFullYear()

    return (
        <div className="container">
            <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
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
                            <button type="button" className="btn btn-primary">Si, cancelar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}