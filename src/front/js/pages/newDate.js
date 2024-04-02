import React, { useState, useContext, useEffect } from "react";
import { Context } from "../store/appContext";
import "../../styles/home.css";
import { NavbarPatient, NavbarPatients } from "../component/navbar_patient";
import 'moment/locale/es';
import { SchedulingPatient } from "../component/schedulingPatient"

export const NewDate = () => {
    const { actions } = useContext(Context);

    return (
        <div className="text-center homepatient conteiner-fluid" style={{ height: '87.8vh', backgroundColor: '#EDE9E9' }}>
            <div className="container" style={{ fontFamily: 'Nanum Gothic, sans-serif', paddingTop: '11vh' }}>
                <div>
                    <div className="container border p-4 " style={{backgroundColor:'white'}}>
                        <SchedulingPatient />
                    </div>
                </div>
            </div>
        </div>
    );
};
