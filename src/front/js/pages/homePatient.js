import React, { useContext } from "react";
import { Context } from "../store/appContext";
import "../../styles/home.css";
import { NavbarPatient} from "../component/navbar_patient"


export const HomePatient = () => {
	const { store, actions } = useContext(Context);

	return (
		<div className="container">
			<NavbarPatient />
		</div>
	);
};
