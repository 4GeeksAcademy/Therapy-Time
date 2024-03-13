import React, { useContext, useState } from "react";
import { Link } from 'react-router-dom';
import { Context } from "../store/appContext";
import "../../styles/login.css";

export const Recovery = () => {
    const { actions } = useContext(Context);
    const [emailInput, setEmailInput] = useState("");
    const [emailError, setEmailError] = useState("");
    const [recoveryMessage, setRecoveryMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!emailRegex.test(emailInput)) {
            setEmailError("Formato de correo electrónico inválido.");
            return;
        } else {
            setEmailError("");
        }
        try {
            setLoading(true);
            const response = await actions.handleResetPassword(emailInput);
            setLoading(false);
            if (response && response.message) {
                setRecoveryMessage(response.message);
            }
        } catch (error) {
            setLoading(false);
            setError(error.message || 'Error al enviar la solicitud de recuperación de contraseña.');
        }   
    }

    const handleEmailChange = (e) => {
        setEmailInput(e.target.value);
    }

    const handleEmailFocus = () => {
        setEmailError(""); 
        setError("");
    }

    return (
        <div className="d-flex justify-content-center vh-100">
            <div className="col-6 d-flex flex-column align-items-center justify-content-center formLogin" style={{ backgroundColor: '#EDE9E9' }}>
                {!recoveryMessage &&
                    <form style={{margin:'25vh'}} onSubmit={handleSubmit}>
                        <div className="form-group mb-4">
                            <label htmlFor="emailInput" className="labelLogin">Ingresa la dirección de tu correo electrónico, te enviaremos un mail para que recuperes tu contraseña</label>
                            <input type="text" className="form-control" id="emailInput" value={emailInput} onChange={handleEmailChange} onFocus={handleEmailFocus} required />
                            {emailError && <p style={{ color: 'red' }}>{emailError}</p>}
                        </div>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        <div className="d-flex justify-content-between">
                            <div className="mt-2">
                                <p>
                                    <Link  style={{color:'#8A97A6'}} to="/login">← Volver</Link>
                                </p>
                            </div>
                            <div>
                                <button type="submit" className="btn" style={{ backgroundColor: '#8A97A6', color: 'whitesmoke' }} disabled={loading}>Recuperar contraseña</button>
                            </div>
                        </div>
                    </form>
                }
                {recoveryMessage && (
                    <div>
                        <p style={{color:'grey'}}>{recoveryMessage}</p>
                        <p>
                            <Link style={{color:'#8A97A6'}} to="/login">← Volver al inicio de sesion</Link>
                        </p>
                    </div>
                )}
            </div>
            <div className="col-6 d-flex flex-column align-items-center justify-content-center" style={{ backgroundColor: '#FAFAFA' }}>
                <img className="animate__backInRight" style={{width: '75vh', maxWidth: '90%', height: 'auto'}} src="https://github.com/4GeeksAcademy/finalProject-LATAM-pt25/blob/prototype/src/front/img/logo_login.png?raw=true" />
            </div>
        </div>  
    );
}
