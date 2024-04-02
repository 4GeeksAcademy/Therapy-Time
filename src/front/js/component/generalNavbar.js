import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Context } from "../store/appContext";
import { NavbarPatient } from "./navbar_patient.js";
import { NavbarTherapist } from "./navbar.js";
import { isAuthenticated } from "../authentication";

export const Navbar = () => {
    const { store } = useContext(Context);
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [role, setRole] = useState()
    const userRole = JSON.parse(localStorage.getItem('data'))

    useEffect(() => {
        setIsLoggedIn(isAuthenticated());
        setRole(userRole?.role)
    }, [userRole]);

    const isLandingPage = location.pathname === "/";
    const isLoguinPage = location.pathname === "/login"

    if (isLandingPage || isLoguinPage || !isLoggedIn) {
        return null;
    }

    if (role === 1) {
        return <NavbarPatient />;
    } else if (role === 2) {
        return <NavbarTherapist />;
    } else {
        return null;
    }
};
