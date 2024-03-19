import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Context } from "../store/appContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { NavbarTherapist } from "../component/navbar";
import "../../styles/profile.css";

export const EditProfile = () => {
    const { actions } = useContext(Context);
    const [editable, setEditable] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmError, setConfirmError] = useState('');
    const [name, setName] = useState('');
    const [lastname, setLastname] = useState('');
    const [dni, setDni] = useState('');
    const [dniError, setDniError] = useState('');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resp = await actions.getUserData();
                if (resp.error) {
                    throw new Error("No se pudieron cargar los datos del usuario");
                }
                setUsername(resp.username);
                setName(resp.name);
                setLastname(resp.lastname);
                setDni(resp.dni);
                setEmail(resp.email);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, [actions]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        switch (name) {
            case "username":
                setUsername(value);
                break;
            case "name":
                setName(value);
                break;
            case "lastname":
                setLastname(value);
                break;
            case "dni":
                setDni(value);
                break;
            case "email":
                setEmail(value);
                break;
            case "password":
                setPassword(value);
                break;
            case "confirmPassword":
                setConfirmPassword(value);
                break;
            default:
                break;
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirm(!showConfirm)
    };

    const isNumber = (input) => {
        return !isNaN(input)
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEditable(false);

        const changes = {};

        try {

            if (username !== '') {
                changes.username = username;
            }

            if (name !== '') {
                changes.name = name;
            }

            if (lastname !== '') {
                changes.lastname = lastname;
            }

            if (dni !== '') {
                if (!isNumber(dni)) {
                    setDniError("Solo se permiten números");
                    return;
                }
                changes.dni = dni;
            }

            if (password !== '') {
                if (password !== confirmPassword) {
                    setConfirmError("Las contraseñas no coinciden");
                    return;
                }
                const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;

                if (!passwordRegex.test(password)) {
                    setPasswordError("La contraseña debe tener al menos 8 caracteres, una mayúscula y un carácter especial.");
                    return;
                }

                changes.password = password;

            }

            if (email !== '') {
                const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

                if (!emailRegex.test(email)) {
                    setEmailError("Debe ingresar una casilla de mail valida");
                    return;
                }

                changes.email = email;
            }

            const result = await actions.editProfile(changes);
            console.log("Profile updated successfully:", result);

            fetchData();

            setPasswordError('');
            setConfirmError('');
            setEmailError('');
            setDniError('');
        } catch (error) {
            console.error("Error actualizando el perfil:", error);
        }
    };

    const handleEdit = () => {
        setEditable(!editable);
    };

    return (
        <div>
            <NavbarTherapist />
            <div style={{ backgroundColor: 'white', height: '85vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="container p-3" style={{ borderTopRightRadius: '5vh', borderLeft: '#EDE9E9 solid 0.5vh', borderBottom: '#EDE9E9 solid 0.5vh', margin: '50vh' }} >
                    <div className="p-5 " style={{ backgroundColor: '#EDE9E9' }}>
                        <form onSubmit={handleSubmit}>
                            <div className="row mb-2">
                                <div className="col">
                                    <div className="form-group">
                                        <label htmlFor="username" className="titleEdit">Nombre de usuario</label>
                                        <input type="text"
                                            className="form-control textProfile"
                                            id="username"
                                            name="username"
                                            value={username}
                                            maxLength={50}
                                            onChange={handleInputChange}
                                            readOnly={!editable}
                                            style={{ backgroundColor: editable ? 'white' : '#FAFAFA' }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="row mb-2">
                                <div className="col">
                                    <div className="form-group">
                                        <label htmlFor="name" className="titleEdit">Nombre</label>
                                        <input type="text"
                                            className="form-control textProfile"
                                            id="name"
                                            name="name"
                                            value={name}
                                            maxLength={25}
                                            onChange={handleInputChange}
                                            readOnly={!editable}
                                            style={{ backgroundColor: editable ? 'white' : '#FAFAFA' }}
                                        />
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="form-group">
                                        <label htmlFor="lastname" className="titleEdit">Apellido</label>
                                        <input type="text"
                                            className="form-control textProfile"
                                            id="lastname"
                                            name="lastname"
                                            value={lastname}
                                            maxLength={25}
                                            onChange={handleInputChange}
                                            readOnly={!editable}
                                            style={{ backgroundColor: editable ? 'white' : '#FAFAFA' }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="row mb-2">
                                <div className="col">
                                    <div className="form-group">
                                        <label htmlFor="dni" className="titleEdit">DNI</label>
                                        <input type="text"
                                            className="form-control textProfile"
                                            id="dni"
                                            name="dni"
                                            value={dni}
                                            maxLength={8}
                                            onChange={handleInputChange}
                                            readOnly={!editable}
                                            style={{ backgroundColor: editable ? 'white' : '#FAFAFA' }}
                                        />
                                        {dniError && (
                                            <div className="text-danger">
                                                {dniError}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="form-group">
                                        <label htmlFor="email" className="titleEdit">Email</label>
                                        <input type="email"
                                            className="form-control textProfile"
                                            id="email"
                                            name="email"
                                            value={email}
                                            onChange={handleInputChange}
                                            readOnly={!editable}
                                            style={{ backgroundColor: editable ? 'white' : '#FAFAFA' }}
                                        />
                                        {emailError && (
                                            <div className="text-danger">
                                                {emailError}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="row mb-2">
                                <div className="col">
                                    <div className="form-group">
                                        <label htmlFor="password" className="titleEdit">Contraseña</label>
                                        <div className="input-group">
                                            <input type={showPassword ? "password" : "text"}
                                                className="form-control textProfile"
                                                id="password"
                                                name="password"
                                                value={password}
                                                onChange={handleInputChange}
                                                readOnly={!editable}
                                                style={{ backgroundColor: editable ? 'white' : '#FAFAFA' }}
                                            />
                                            <button className="btn btn-outline-secondary" type="button" id="button-addon-password"
                                                onClick={togglePasswordVisibility}>
                                                <FontAwesomeIcon
                                                    icon={showPassword ? faEyeSlash : faEye}
                                                    className="eye-icon"
                                                />
                                            </button>
                                        </div>
                                        {passwordError && (
                                            <div className="text-danger">
                                                {passwordError}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="form-group">
                                        <label htmlFor="confirm" className="titleEdit">Confirmar contraseña</label>
                                        <div className="input-group">
                                            <input type={showConfirm ? "password" : "text"}
                                                className="form-control textProfile"
                                                id="confirm"
                                                name="confirmPassword"
                                                value={confirmPassword}
                                                onChange={handleInputChange}
                                                readOnly={!editable}
                                                style={{ backgroundColor: editable ? 'white' : '#FAFAFA' }}
                                            />
                                            <button className="btn btn-outline-secondary" type="button" id="button-addon-confirm"
                                                onClick={toggleConfirmPasswordVisibility}>
                                                <FontAwesomeIcon
                                                    icon={showConfirm ? faEyeSlash : faEye}
                                                    className="eye-icon"
                                                />
                                            </button>
                                        </div>
                                        {confirmError && (
                                            <div className="text-danger">
                                                {confirmError}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="row mb-2">
                                <div className="col">
                                </div>
                                <div className="col d-flex justify-content-end">
                                    <div className="form-group d-flex align-items-center">
                                        <button className="btn_editar p-2" style={{ width: '25vh' }} type="button" onClick={editable ? handleSubmit : handleEdit}>
                                            {editable ? "Guardar" : "Editar"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form >
                    </div>
                </div>
            </div>
        </div>
    );
};

