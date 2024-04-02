import React, { useContext, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import "../../styles/login.css";
import big_logo from "../../img/big_logo.png";

export const Reset_password = () => {
    const { actions } = useContext(Context);
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({
        username: "",
        resetToken: "",
        newPassword: "",
        confirmPassword: "",
        global: ""
    });
    const [showSuccess, setShowSuccess] = useState(false);
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&()_+])[A-Za-z\d!@#$%^&()_+]{8,}$/;

    const clearError = (field) => {
        if (field === 'global') {
            setErrors({ ...errors, global: "" });
        } else {
            setErrors({ ...errors, [field]: "" });
            if (errors.global) {
                setErrors({ ...errors, global: "" });
            }
        }
    };

    const errorTextStyle = {
        color: 'red',
        maxWidth: '50vh',
        wordWrap: 'break-word'
    };

    const handleGoToLogin = () =>{
        navigate('/login');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (username.trim() === "") {
            newErrors.username = "*El campo es obligatorio";
        }
        if (resetToken.trim() === "") {
            newErrors.resetToken = "*El campo es obligatorio";
        }
        if (newPassword.trim() === "") {
            newErrors.newPassword = "*El campo es obligatorio";
        } else if (!passwordRegex.test(newPassword)) {
            newErrors.newPassword ="La contraseña debe tener al menos 8 caracteres, una mayúscula y un carácter especial";
        }
        if (confirmPassword.trim() === "") {
            newErrors.confirmPassword = "*El campo es obligatorio";
        } else if (!passwordRegex.test(confirmPassword)) {
            newErrors.confirmPassword ="La contraseña debe tener al menos 8 caracteres, una mayúscula y un carácter especial";
        } else if (confirmPassword !== newPassword) {
            newErrors.confirmPassword = "Las contraseñas no coinciden";
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors({...errors, ...newErrors});
            return;
        }
        try {
            setErrors({ ...errors, global: "" });
            const response = await actions.handleChangePassword(username, resetToken, newPassword);
            setShowSuccess(true);
        } catch (error) {
            setErrors({ ...errors, global: error.message || 'Error al restablecer la contraseña' });
        }
    };

    return (
        <div className="d-flex justify-content-center vh-100">
            <div className="col-6 d-flex flex-column align-items-center justify-content-center formLogin" style={{ backgroundColor: '#EDE9E9' }}>
                {!showSuccess ? (
                    <form onSubmit={handleSubmit} className="text-start">
                        <div className="token">
                            <div className="form-group mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ingrese su nombre de usuario"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onFocus={() => clearError('username')}
                                    style={{width:'50vh'}}
                                />
                                {errors.username && <p style={errorTextStyle}>{errors.username}</p>}
                                {errors.global === 'El usuario ingresado es inválido' && <p style={errorTextStyle}>{errors.global}</p>}
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ingrese tu código de validación"
                                    value={resetToken}
                                    onChange={(e) => setResetToken(e.target.value)}
                                    onFocus={() => clearError('resetToken')} 
                                />
                                {errors.resetToken && <p style={errorTextStyle}>{errors.resetToken}</p>}
                                {errors.global === 'El token ingresado es inválido o ha expirado' && <p style={errorTextStyle}>{errors.global}</p>}
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Ingrese su nueva contraseña"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    onFocus={() => clearError('newPassword')}
                                />
                                {errors.newPassword && <p style={errorTextStyle}>{errors.newPassword}</p>}
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Repita su nueva contraseña"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onFocus={() => clearError('confirmPassword')}
                                />
                                {errors.confirmPassword && <p style={errorTextStyle}>{errors.confirmPassword}</p>}
                            </div>
                            <button type="submit" className="btn" style={{ backgroundColor: '#8A97A6', color: 'whitesmoke', width:'50vh' }}>Guardar cambios</button>
                        </div>
                    </form>
                ) : (
                    <div>
                        <p style={{color:'#8A97A6'}}>La contraseña se ha cambiado exitosamente</p>
                        <p onClick={handleGoToLogin} style={{ cursor: 'pointer', color:'#8A97A6'}}>← Volver al inicio de sesión</p>
                    </div>
                )}
            </div>
            <div className="col-6 d-flex flex-column align-items-center justify-content-center" style={{ backgroundColor: '#FAFAFA' }}>
                <img className="animate__backInRight" style={{ width: '75vh', maxWidth: '90%', height: 'auto' }} src={big_logo} />
            </div>
        </div>
    );
};