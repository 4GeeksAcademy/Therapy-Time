import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";

export const NavbarPatient = () => {
	const { actions } = useContext(Context)
	const [userData, setUserData] = useState("")
	const navigate = useNavigate()

	useEffect(() => {
		const fetchData = async () => {
			try {
				const resp = await actions.getUserData();

				if (resp.error) {
					console.error("No se pudo cargar datos de usuario");
				}

				setUserData(resp);

			} catch (error) {
				console.error("No se pudo cargar datos de usuario");
			}
		};
		fetchData();
	}, [actions]);

	const logoutFunction = async () => {
		try {

			const result = await actions.logout();

		} catch (error) {
			console.error(error)
		}

		console.log("Cierre de sesión exitoso")
		navigate("/")
		return { token: localStorage.getItem("token") }
	}

	return (
		<nav className="navbar" style={{ backgroundColor: '#EDE9E9' }}>
			<div className="container">
				<div id="home-link">
					<Link to="/home">
						<span className="navbar-brand mb-0 h1">Inicio</span>
					</Link>
				</div>
				<div className="d-flex justify-content-center" id="center-nav">
					<Link to="/patient_schedule">
						<p style={{ color: '#8A97A6' }} id="turns-button">Turnero</p>
					</Link>
					<div className="vr d-flex" style={{ color: '#8A97A6', margin: '10px', margin: '0px 20px',  height: '26px',  display: 'flex !important'}}></div>
					<Link to="/payments">
						<p style={{ color: '#8A97A6' }} id="payments-button">Mis Pagos</p>
					</Link>
				</div>
				<div id="profile-button">
					<div className="dropdown">
						<button className="btn dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" style={{ color: '#CA857D' }}>
							{userData.name + " " + userData.lastname}
						</button>
						<ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
							<li><Link className="dropdown-item" to="/editProfile" style={{ color: '#CA857D' }}>Mi perfil</Link></li>
							<li><button className="dropdown-item btn" onClick={logoutFunction} style={{ color: '#CA857D' }}>Cerrar sesión</button></li>
						</ul>
					</div>
				</div>
			</div>
		</nav>
	);
};