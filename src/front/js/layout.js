import React, { useState, useEffect, useContext } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { BackendURL } from "./component/backendURL";
import { Context } from "./store/appContext";
import injectContext from "./store/appContext";
import { Landing } from "./pages/landing";
import { Login } from "./pages/login"
import { Recovery } from "./pages/recovery";
import { HomePatient } from "./pages/homePatient";
import { HomeTherapist } from "./pages/homeTherapist";
import {Scheduling} from "./pages/scheduling.jsx";
import { AppointmentScheduler } from "./pages/appointmentScheduler";
import { IncomeControl } from "./pages/incomeControl";
import { Inbox } from "./pages/inbox";
import { Patients } from "./pages/patients";
import { Payments } from "./pages/payments";
import { PatientSchedule } from "./pages/patientSchedule";
import { Reset_password } from "./pages/resetPassword";
import { EditProfile } from "./pages/editProfile";
import { isAuthenticated } from "./authentication";

const Layout = () => {
    const basename = process.env.BASENAME || "";
    if (!process.env.BACKEND_URL || process.env.BACKEND_URL == "") return <BackendURL />;

    const { store } = useContext(Context);
    const [role, setRole] = useState(store.role);

    useEffect(() => {
        setRole(store.role);
        console.log(store.role)
    }, [store.role]);


    return (
        <div>
            <BrowserRouter basename={basename}>
                <ScrollToTop>
                    <Routes>
                        <Route element={<Landing />} path="/" />
                        <Route element={<Login />} path="/login" />
                        <Route element={!isAuthenticated() ? <Navigate to="/login" /> : role === "Patient" ? <HomePatient /> : <HomeTherapist />} path="/home" />
                        <Route element={<Recovery />} path="/recovery" />
                        <Route element={!isAuthenticated() ? <Navigate to="/login" /> : <EditProfile />} path="/editProfile" />
                        <Route element={!isAuthenticated() ? <Navigate to="/login" /> : <Payments />} path="/payments" />
                        <Route element={!isAuthenticated() ? <Navigate to="/login" /> : <PatientSchedule />} path="/patient_schedule" />
                        <Route element={!isAuthenticated() ? <Navigate to="/login" /> : <Scheduling />} path="/scheduling" />
                        <Route element={!isAuthenticated() ? <Navigate to="/login" /> : <AppointmentScheduler />} path="/appointment_scheduler" />
                        <Route element={!isAuthenticated() ? <Navigate to="/login" /> : <IncomeControl />} path="/income_control" />
                        <Route element={!isAuthenticated() ? <Navigate to="/login" /> : <Inbox />} path="/inbox" />
                        <Route element={<Reset_password />} path="/reset_password" />
                        <Route element={!isAuthenticated() ? <Navigate to="/login" /> : <Patients />} path="/patients" />
                    </Routes>
                </ScrollToTop>
            </BrowserRouter>
        </div>
    );
};

export default injectContext(Layout);