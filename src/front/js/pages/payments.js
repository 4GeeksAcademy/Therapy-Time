import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import { NavbarPatient } from "../component/navbar_patient";

export const Payments = () => {
    const { store, actions } = useContext(Context);


    return (
        <div>
            <NavbarPatient />
            <div className="row">
                <div className="col-4 p-4">
                    <div className="row" style={{ marginTop: '80px' }}>
                        <h3>Mis pagos</h3>
                        <label>Medio de pago</label>
                        <input
                            type="text"
                        />
                    </div>
                    <div className="row">
                        <label>Desde:</label>
                        <input
                            type="date"
                        />
                    </div>
                    <div className="row">
                        <label>Hasta:</label>
                        <input
                            type="date"
                        />
                    </div>
                    <button>Filtrar</button>
                </div>
                <div className="col-8">
                    <table className="table table-striped table-bordered" style={{ borderColor: '#C4C4C4', marginTop: '120px' }}>
                        <thead style={{ backgroundColor: '#929DAB' }}>
                            <tr style={{ color: 'white' }}>
                                <th scope="col">Fecha de pago</th>
                                <th scope="col">Medio de pago</th>
                                <th scope="col">Monto</th>
                                <th scope="col">Concepto</th>
                                <th scope="col">Comprobante</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th scope="row">1</th>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                            </tr>
                            <tr>
                                <th scope="row">2</th>
                                <td>Jacob</td>
                                <td>Thornton</td>
                                <td>@fat</td>
                            </tr>
                            <tr>
                                <th scope="row">3</th>
                                <td colspan="2">Larry the Bird</td>
                                <td>@twitter</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}