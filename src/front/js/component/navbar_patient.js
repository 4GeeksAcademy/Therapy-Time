import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import logo_navbar from "../../img/logo_navbar.png";
import { Spinner } from "react-bootstrap";

export const NavbarPatient = () => {
	const { actions } = useContext(Context)
	const [userData, setUserData] = useState(null)
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
	};

	if (userData === null) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color:'grey' }}>
				<Spinner animation="border" role="status">
					<span className="visually-hidden">Cargando...</span>
				</Spinner>
			</div>
		);
	}
	return (
		<nav className="navbar" style={{ backgroundColor: '#EDE9E9', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
			<div id="home-link">
				<Link to="/home">
					<img style={{ maxHeight: '8vh' }} className="mt-2" src={logo_navbar}></img>
				</Link>
			</div>
			<div id="home-link" className="d-flex ">
				<Link to="/home" style={{ color: '#8A97A6', fontSize: '3vh', marginRight: '3vh' }}>
					<p id="turns-button" className="navTherapist mt-3">Turnero</p>
				</Link>
				<div>
					<p className="navTherapist mt-3" style={{ color: '#8A97A6', fontSize: '3vh' }}>|</p>
				</div>
				<Link to="/payment_list" style={{ color: '#8A97A6', fontSize: '3vh', marginLeft: '3vh' }}>
					<p id="turns-button" className="navTherapist mt-3">  Mis pagos</p>
				</Link>
			</div>
			<div id="profile-button">
				<div className="dropdown">
					<button className="btn dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" style={{ color: '#8A97A6', fontSize: '3vh' }}>
						{userData.name + " " + userData.lastname}
					</button>
					<ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
						<li><Link className="dropdown-item navTherapist" to="/editProfile" style={{ color: '#CA857D' }}>Mi perfil</Link></li>
						<li><button className="dropdown-item btn" onClick={logoutFunction} style={{ color: '#CA857D' }}>Cerrar sesión</button></li>
					</ul>
				</div>
			</div>
		</nav>
	);
};