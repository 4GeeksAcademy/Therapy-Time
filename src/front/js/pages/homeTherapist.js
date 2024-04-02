import React, { useContext } from "react";
import { Context } from "../store/appContext";
import "../../styles/home.css";
import { Link } from "react-router-dom";
import box_1 from "../../img/box_1.png";
import box_2 from "../../img/box_2.png";
import box_3 from "../../img/box_3.png";
import box_4 from "../../img/box_4.png";


export const HomeTherapist = () => {
    const { store, actions } = useContext(Context);

    return (
        <div className="text-center homepsico conteiner-fluid" style={{background:'#EDE9E9'}}>
            <div className="grid-container">
                <div className="grid-item" style={{ backgroundImage: `url(${box_1})`, backgroundSize: 'cover' } }>
                    <Link to="/patients" className="textLink">Gestión de pacientes</Link>
                </div>
                <div className="grid-item" style={{ backgroundImage: `url(${box_2})`, backgroundSize: 'cover' } }>
                    <Link to="/scheduling" className="textLink">Disponibilidad de agenda</Link>
                </div>
                <div className="grid-item" style={{ backgroundImage: `url(${box_3})`, backgroundSize: 'cover' } } >
                    <Link to="/appointment_scheduling" className="textLink">Asignación de turnos</Link>
                </div>
                <div className="grid-item" style={{ backgroundImage: `url(${box_4})`, backgroundSize: 'cover' } }>
                    <Link to="/inbox" className="textLink">Bandeja de entrada</Link>
                </div>
            </div>
        </div>
    );
};
