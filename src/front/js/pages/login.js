import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "../../styles/login.css";

export const Login = () => {
    const { actions } = useContext(Context);
    const { store } = useContext(Context);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const errors = validateForm();

        if (errors) {
            try {
                const result = await actions.loginUser(username, password);
                if (result.success) {
                    if (store.role === 1) {
                        navigate("/patient_schedule")
                    } else {
                        navigate("/home");
                    }
                } else {
                    setErrorMessage("El usuario o la contraseña son incorrectos");
                }
            } catch (error) {
                console.error("Error en el inicio de sesión:", error.message);
                setErrorMessage("Error de red");
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "username") {
            setUsername(value);
        } else if (name === "password") {
            setPassword(value);
        }
        setErrorMessage('');
    };

    const validateForm = () => {
        if (username.trim() === "" || password.trim() === "") {
            setErrorMessage("*Complete todos los campos");
            return false;
        }
        return true;
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword)
    }

    return (
        <div className="d-flex justify-content-center vh-100">
            <div className="col-6 d-flex flex-column align-items-center justify-content-center formLogin" style={{ backgroundColor: '#EDE9E9' }}>
                <form onSubmit={handleLogin}>
                    <div className="form-group mb-4">
                        <label htmlFor="username" className="labelLogin">Nombre de usuario :</label>
                        <input
                            type="text"
                            className="form-control"
                            id="username"
                            name="username"
                            placeholder="Ingrese su nombre de usuario"
                            value={username}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password" className="labelLogin">Contraseña :</label>
                        <div className="input-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control"
                                id="password"
                                name="password"
                                value={password}
                                placeholder="Ingrese su contraseña"
                                onChange={handleInputChange}
                                style={{ paddingRight: '40px' }}
                            />
                            <div className="input-group-append" style={{ position: 'absolute', right: 0, top: 0 }}>
                                <button className="btn" type="button" id="button-addon-password" onClick={toggleShowPassword}>
                                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} className="eye-icon" style={{ color: '#B2A79F' }} />
                                </button>
                            </div>
                        </div>
                    </div>
                    {errorMessage && (
                        <p className="text-danger">{errorMessage}</p>
                    )}
                    <div className="text-end link mb-4">
                        <Link to="/recovery" style={{ color: '#a76f6d', fontSize: '15px' }}>¿Olvidaste tu contraseña?</Link>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <Link to='/' style={{ color: '#8A97A6' }}>&#x27F5; Volver</Link>
                        </div>
                        <div className="text-end">
                            <button type="submit" className="btn" style={{ backgroundColor: '#8A97A6', color: 'whitesmoke' }}>
                                Ingresar
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            <div className="col-6 d-flex flex-column align-items-center justify-content-center" style={{ backgroundColor: '#FAFAFA' }}>
                <img className="animate__backInRight" style={{ width: '75vh', maxWidth: '90%', height: 'auto' }} src="https://github.com/4GeeksAcademy/finalProject-LATAM-pt25/blob/prototype/src/front/img/logo_login.png?raw=true" />
            </div>
        </div>
    );
};
