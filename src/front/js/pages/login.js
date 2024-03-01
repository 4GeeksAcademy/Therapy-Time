import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export const Login = () => {
    const { actions, store } = useContext(Context);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState({ password: '', networkError: '' });
    const [errorMessages, setErrorMessages] = useState({
        username: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false)

    const navigate = useNavigate();

    useEffect(() => {
        actions.getUsers();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        const errors = validateForm();
        setErrorMessages(errors);

        if (Object.values(errors).every(error => error === "")) {
            try {
                const result = await actions.loginUser(username, password);
                if (result.success) {
                    navigate("/home");
                } else {
                    setErrorMessage(prevState => ({ ...prevState, password: "La contraseña es invalida" }));
                }
            } catch (error) {
                console.error("Error en el inicio de sesión:", error.message);
                setErrorMessage(prevState => ({ ...prevState, networkError: "Error de red" }));
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
        setErrorMessage(prevState => ({ ...prevState, password: '' }));
    };

    const handleInputFocus = (fieldName) => {
        setErrorMessages(prevErrors => ({
            ...prevErrors,
            [fieldName]: ""
        }));
    };

    const validateForm = () => {
        const errors = {};
        if (username.trim() === "") {
            errors.username = "*El campo es obligatorio";
        } else {
            const existingUser = store.user.find(user => user.username === username);
            if (!existingUser) {
                errors.username = "El usuario no está registrado";
            } else {
                errors.username = "";
                if (password.trim() === "") {
                    errors.password = "*El campo es obligatorio";
                }
                else {
                    errors.password = ""
                }
            }
        }
        return errors;
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    return (
        <div className="container login">
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label htmlFor="username">Usuario :</label>
                    <input
                        type="text"
                        className="form-control"
                        id="username"
                        name="username"
                        placeholder="Enter your username"
                        value={username}
                        onChange={handleInputChange}
                        onFocus={() => handleInputFocus("username")}
                    />
                    {errorMessages.username && <p className="text-danger">{errorMessages.username}</p>}
                </div>
                <div className="form-group">
<<<<<<< HEAD
                    <label htmlFor="password">Contraseña :</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={handleInputChange}
                        onFocus={() => handleInputFocus("password")}
                    />
=======
                    <label htmlFor="password">Password:</label>
                    <div className="input-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={handleInputChange}
                            onFocus={() => handleInputFocus("password")}
                        />
                        <button className="btn btn-outline-secondary" id="toggle-password" type="button" onClick={togglePasswordVisibility}>
                            <FontAwesomeIcon
                                icon={showPassword ? faEyeSlash : faEye}
                                className="eye-icon"
                            />
                        </button>
                    </div>
>>>>>>> 5de70e7e952de318603e138f0724067f22382757
                    {errorMessages.password && <p className="text-danger">{errorMessages.password}</p>}
                </div>
                {errorMessage.password && (
                    <span className="text-danger">{errorMessage.password}</span>
                )}
                {errorMessage.networkError && (
                    <div className="alert alert-danger" role="alert">
                        {errorMessage.networkError}
                    </div>
                )}
                <div className="text-center">
                    <button type="submit" className="btn btnLogin">
                        Ingresar
                    </button>
                </div>
            </form>
            <div className="mt-3 text-center link">
                <p>
<<<<<<< HEAD
                    ¿Olvidaste tu contraseña? <Link to="/recovery">Haz click aqui para recuperarla</Link>
=======
                    Forgot your password? <Link to="/recovery">Recover it here</Link>
>>>>>>> 5de70e7e952de318603e138f0724067f22382757
                </p>
                <p>
                    <Link to="/">← Volver</Link>
                </p>
            </div>
        </div>
    );
};
