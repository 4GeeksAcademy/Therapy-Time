import React, { useContext, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { BackendURL } from "./component/backendURL";
import { Context } from "./store/appContext";
import injectContext from "./store/appContext";
import { AppointmentScheduler } from "./pages/appointmentScheduler";
import { EditDate } from "./pages/editDate.js";
import { EditProfile } from "./pages/editProfile";
import { HomePatient } from "./pages/homePatient";
import { HomeTherapist } from "./pages/homeTherapist";
import { IncomeControl } from "./pages/incomeControl";
import { Inbox } from "./pages/inbox";
import { isAuthenticated } from "./authentication";
import { Landing } from "./pages/landing";
import { Login } from "./pages/login";
import { NewDate } from "./pages/newDate.js";
import { Patients } from "./pages/patients";
import { Payment } from "./pages/payment";
import { PaymentList } from "./pages/paymentList";
import { Recovery } from "./pages/recovery";
import { Reset_password } from "./pages/resetPassword";
import { Scheduling } from "./pages/scheduling.js";
import { Navbar } from "./component/generalNavbar.js"


const Layout = () => {
    const basename = process.env.BASENAME || "";
    if (!process.env.BACKEND_URL || process.env.BACKEND_URL == "") return <BackendURL />;

    const { store } = useContext(Context);
    const userRole = JSON.parse(localStorage.getItem('data'))

    useEffect ( () =>{
       console.log(userRole)
    }, [])

    return (
        <div>
            <BrowserRouter basename={basename}>
                <ScrollToTop>
                    <Navbar />
                    <Routes>
                        <Route element={<Landing />} path="/" />
                        <Route element={<Login />} path="/login" />
                        <Route element={<Recovery />} path="/recovery" />
                        <Route element={<Reset_password />} path="/reset_password" />
                        {!isAuthenticated() ? <Route element={<Navigate to="/login" />} path="*" /> : <>
                            <Route element={userRole.role === 1 ? <HomePatient /> : <HomeTherapist />} path="/home" />
                            <Route element={<EditProfile />} path="/editProfile" />
                            <Route element={<Payment />} path="/payment" />
                            <Route element={<PaymentList />} path="/payment_list" />
                            <Route element={<Scheduling />} path="/scheduling" />
                            <Route element={<AppointmentScheduler />} path="/appointment_scheduling" />
                            <Route element={<IncomeControl />} path="/income_control" />
                            <Route element={<Inbox />} path="/inbox" />
                            <Route element={<Patients />} path="/patients" />
                            <Route element={<NewDate />} path="/new_date" />
                            <Route element={<EditDate />} path="/edit_date" />
                        </>}
                    </Routes>
                </ScrollToTop>
            </BrowserRouter>
        </div>
    );
};

export default injectContext(Layout);
