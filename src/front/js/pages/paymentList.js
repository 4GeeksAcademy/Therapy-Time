import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import { NavbarPatient } from "../component/navbar_patient"
import { PaymentTable } from "../component/paymentTable"

export const PaymentList = () => {
    const {actions, store} = useContext(Context)

    return (
        <div className="text-center homepatient conteiner-fluid" style={{ height: '90.8vh', backgroundColor: '#EDE9E9' }}>
            <div className="container" style={{ fontFamily: 'Nanum Gothic, sans-serif', paddingTop: '8vh' }}>
                <PaymentTable />
            </div>
        </div>
    )
}