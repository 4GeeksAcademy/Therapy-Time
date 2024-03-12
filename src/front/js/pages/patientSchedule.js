import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import Calendar from "react-calendar";

export const PatientSchedule = () => {
    const { actions } = useContext(Context)
    const [date, setDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);

    const dateChange = (newDate) => {
        setDate(newDate);
    };

    const toggleModal = () => {
        setShowModal(!showModal)
    }

    const renderModal = () => {

    }



    return (
        <div className="container">
            <div className="row">
                <div className="col-6">
                    <Calendar
                        onChange={dateChange}
                        value={date}
                    />
                </div>
                <div className="col-6" style={{ backgroundColor: '#Fafafa' }}>
                    <h3>Tu proximo turno: {nextTurn}</h3>
                    <p>Acceso a la sala virtual: </p>
                    <a></a>
                    <div className="col">
                        <button>Cancelar turno</button>
                    </div>
                    <div className="col">
                        <button>Modificar turno</button>
                    </div>
                    <button>Abonar por Mercado Pago</button>
                </div>
            </div>
        </div>
    )
}