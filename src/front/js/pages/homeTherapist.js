import React, { useContext } from "react";
import { Context } from "../store/appContext";
import "../../styles/home.css";
import { Link } from "react-router-dom";
import { NavbarTherapist } from "../component/navbar"

export const HomeTherapist = () => {
    const { store, actions } = useContext(Context);

    return (
        <div className="text-center homepsico conteiner-fluid">
            <NavbarTherapist />
            <div className="grid-container" style={{background:'#EDE9E9'}}>
                <div className="grid-item" style={{ backgroundImage: `url('https://github.com/4GeeksAcademy/finalProject-LATAM-pt25/blob/prototype/src/front/img/grid-1.png?raw=true')`, backgroundSize: 'cover' } }>
                    <Link to="/patients" className="textLink">Gestion de pacientes</Link>
                </div>
                <div className="grid-item" style={{ backgroundImage: `url('https://github.com/4GeeksAcademy/finalProject-LATAM-pt25/blob/prototype/src/front/img/grid-2.png?raw=true')`, backgroundSize: 'cover' } }>
                    <Link to="/scheduling" className="textLink">Manejo de agenda</Link>
                </div>
                <div className="grid-item" style={{ backgroundImage: `url('https://github.com/4GeeksAcademy/finalProject-LATAM-pt25/blob/prototype/src/front/img/grid-3.png?raw=true')`, backgroundSize: 'cover' } } >
                    <Link to="/appointment_scheduling" className="textLink">Asignacion de turnos</Link>
                </div>
                <div className="grid-item" style={{ backgroundImage: `url('https://github.com/4GeeksAcademy/finalProject-LATAM-pt25/blob/prototype/src/front/img/grid-4.png?raw=true')`, backgroundSize: 'cover' } } >
                    <Link to="/income_control" className="textLink">Control de ingresos</Link>
                </div>
                <div className="grid-item" style={{ backgroundImage: `url('https://github.com/4GeeksAcademy/finalProject-LATAM-pt25/blob/prototype/src/front/img/grid-2.png?raw=true')`, backgroundSize: 'cover' } }>
                    <Link to="/inbox" className="textLink">Bandeja de entrada</Link>
                </div>
                <div className="logo-container">
                
                </div>
            </div>
        </div>
    );
};
