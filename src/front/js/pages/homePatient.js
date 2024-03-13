import React, { useContext } from "react";
import { Context } from "../store/appContext";
import rigoImageUrl from "../../img/rigo-baby.jpg";
import "../../styles/home.css";
import { NavbarPatient, NavbarPatients} from "../component/navbar_patient"


export const HomePatient = () => {
	const { store, actions } = useContext(Context);

	return (
		<div className="container">
			<NavbarPatient />
		</div>
	);
};
