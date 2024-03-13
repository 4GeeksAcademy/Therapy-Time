import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/landing.css";

export const Landing = () => {
    const { actions, store } = useContext(Context);
    const [showModal, setShowModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showAboutModal, setShowAboutModal] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        lastname: "",
        age: "",
        phone: "",
        consultation: ""
    });

    //Apertura y cierre de modales
    const openModal = () => {
        setShowModal(true);
    }
    const openSuccessModal = () => {
        setShowSuccessModal(true);
    }
    const closeModal = () => {
        setShowModal(false);
    };
    const closeSuccessModal = () => {
        setShowSuccessModal(false);
    };
    const openShowAboutModal = () => {
        setShowAboutModal(true)
    };
    const closeShowAboutModal = () => {
        setShowAboutModal(false)
    };

    //Envio del formulario
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const getCurrentDateTime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };
    const handleSubmit = async () => {
        const validationMessages = validateForm(formData);
        setErrorMessages(validationMessages);
        const hasErrors = Object.values(validationMessages).some(msg => msg !== "");
        if (hasErrors) {
            return;
        }
        try {
            const arrival_date = getCurrentDateTime();
            const response = await actions.sendMessage(
                formData.name,
                formData.lastname,
                formData.age,
                formData.phone,
                formData.consultation,
                arrival_date
            );
            console.log(response);
            closeModal();
            openSuccessModal();
        } catch (error) {
            console.error("Error al enviar el mensaje:", error);
        }
    };

    //Validaciones
    const [errorMessages, setErrorMessages] = useState({
        name: "",
        lastname: "",
        age: "",
        phone: "",
        consultation: ""
    });
    const handleInputFocus = (fieldName) => {
        setErrorMessages(prevErrors => ({
            ...prevErrors,
            [fieldName]: ""
        }));
    };
    const validateForm = (data) => {
        const errors = {};
        if (!data.name || data.name.trim() === "") {
            errors.name = "*El campo es obligatorio";
        } else {
            errors.name = "";
        }
        if (!data.lastname || data.lastname.trim() === "") {
            errors.lastname = "*El campo es obligatorio";
        } else {
            errors.lastname = "";
        }
        if (!data.age || data.age.trim() === "") {
            errors.age = "*El campo es obligatorio";
        } else if (!/^\d+$/.test(data.age)) {
            errors.age = "La edad debe ser un valor numérico.";
        } else {
            errors.age = "";
        }
        if (!data.phone || data.phone.trim() === "") {
            errors.phone = "*El campo es obligatorio";
        } else if (!/^\d{10}$/.test(data.phone)) {
            errors.phone = "El teléfono debe contener 10 dígitos numéricos.";
        } else {
            errors.phone = "";
        }
        if (!data.consultation || data.consultation.trim() === "") {
            errors.consultation = "*El campo es obligatorio";
        } else {
            errors.consultation = "";
        }
        return errors;
    };

    return (
        <div className="container-fluid">
            <div className={showModal || showAboutModal ? "content-behind-modal" : ""}>
                <div className="row">
                    <div className="columna-izquierda-top col-3 navMedium">
                        <img className="logo" src="https://github.com/4GeeksAcademy/finalProject-LATAM-pt25/blob/prototype/src/front/img/navbar.png?raw=true" alt="Logo" />
                    </div>
                    <div className="columna-derecha-top col-9 navMedium">
                        <div className="d-flex justify-content-between linksNav">
                            <a href="#about"><p>SOBRE MI</p></a>
                            <a href="#services"><p>SERVICIOS</p></a>
                            <a href="#turnos"><p>TURNOS</p></a>
                            <Link to="/login"><p>INGRESAR</p></Link>
                        </div>
                    </div>
                    <div className="columna-derecha-top col navSmall">
                        <div className="d-flex justify-content-between linksNav linksNavSmall">
                            <img className="logoSmall" src="https://github.com/4GeeksAcademy/finalProject-LATAM-pt25/blob/prototype/src/front/img/navbar.png?raw=true" alt="Logo" />
                            <a href="#about" className="mt-4"><p>SOBRE MI</p></a>
                            <a href="#services" className="mt-4"><p>SERVICIOS</p></a>
                            <a href="#turnos" className="mt-4"><p>TURNOS</p></a>
                            <Link to="/login" className="mt-4"><p>INGRESAR</p></Link>
                        </div>
                    </div>
                </div>
                <div className="row rowAboutSmall">
                    <div className="columna-izquierda-bottom columna-izquierda-bottomSmall col-3">
                        <img className="profile profileSmall" src="https://github.com/4GeeksAcademy/finalProject-LATAM-pt25/blob/prototype/src/front/img/profile.png?raw=true" alt="Profile" />
                    </div>
                    <div className="columna-derecha-bottom col-9">
                        <div className="textAbout textAboutSmall" id="about">
                            <h1 className="mb-3">Lic. Vigano Sofia</h1>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ultricies eleifend velit, at aliquam leo malesuada sit amet. Quisque ut erat non nisi consequat gravida.</p><p className="aboutSmallNone"> Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Maecenas posuere aliquam mauris eget congue. Proin eu sapien non quam sollicitudin efficitur. Donec nec augue id risus tincidunt consectetur.</p>
                            <a onClick={openShowAboutModal} className="btn btn_about" style={{ color: '#C57D7A' }}>[ Leer mas ]</a>
                        </div>
                    </div>
                </div>
                <div className="row services smallService align-items-center" id='services'>
                    <div className="col-3 textServices textServiceSmall" >
                        <h4 className="titleService">Servicios terapeuticos</h4>
                        <p className="pService">Con enfoque conductual contextual</p>
                    </div>
                    <div className="col-8 contentServices contentServSmall">
                        <ul>
                            <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ultricies eleifend velit, at aliquam leo malesuada sit amet.</li>
                            <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ultricies eleifend velit, at aliquam leo malesuada sit amet.</li>
                            <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ultricies eleifend velit, at aliquam leo malesuada sit amet.</li>
                            <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ultricies eleifend velit, at aliquam leo malesuada sit amet.</li>
                        </ul>
                    </div>
                    <div className="col-1 right_sidebar"></div>
                </div>
                <div className="row turnos turnoSmall align-items-center">
                    <div className="col textTurnos textTurnosSmall d-flex flex-column justify-content-center align-items-center text-center">
                        <div>
                            <h1 id='turnos'>Solicitud de turnos</h1>
                            <p>Si ya sos paciente, ingresa a tu cuenta para reservar tu cita en el boton ingresar. De lo contrario, si queres programar un primer encuentro ingresa al boton contactar para coordinar una cita</p>
                        </div>
                        <div className="d-flex justify-content-around">
                            <Link to="/login"><button className="btn" style={{ color: '#C57D7A' }}>[ Ingresar ]</button></Link>
                            <button onClick={openModal} className="btn" style={{ color: '#C57D7A' }}>[ Contactar ]</button>
                        </div>
                    </div>
                </div>
                <div className="row d-flex align-items-center justify-content-center text-center contact">
                    <div className="col p-4">
                        <h5 className="contactTitle"><b>CONTACTO</b></h5>
                        <div className="textContact">
                            <p><b>Email:<a href="mailto:lic.vigano@gmail.com"> lic.vigano@gmail.com</a></b></p>
                            <p><b>Teléfono: 3513052538</b></p>
                            <p><b>Instagram: <a href="https://www.instagram.com/psico.sofiavigano/" target="_blank">psico.sofivigano</a></b></p>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`modal fade  ${showModal ? 'show d-block' : 'd-none'}`} id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content" style={{textAlign:'left'}} id='contactModal'>
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Formulario de contacto</h1>
                            <button type="button" className="btn_close_contact" onClick={closeModal}>X</button>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-6">
                                    <div className="mb-2">
                                        <label htmlFor="name" className="col-form-label" style={{ lineHeight: '1' }}>Nombre:</label>
                                        <input type="text" className="form-control textModal" id="name" name="name" value={formData.name} onChange={handleChange} onFocus={() => handleInputFocus("name")} />
                                        <span className="text-danger">{errorMessages.name}</span>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="mb-2">
                                        <label htmlFor="lastname" className="col-form-label" style={{ lineHeight: '1' }}>Apellido:</label>
                                        <input type="text" className="form-control textModal" id="lastname" name="lastname" value={formData.lastname} onChange={handleChange} onFocus={() => handleInputFocus("lastname")} />
                                        <span className="text-danger">{errorMessages.lastname}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-6">
                                    <div className="mb-2">
                                        <label htmlFor="age" className="col-form-label" style={{ lineHeight: '1' }}>Edad:</label>
                                        <input type="text" className="form-control textModal" id="age" name="age" value={formData.age} onChange={handleChange} onFocus={() => handleInputFocus("age")} />
                                        <span className="text-danger">{errorMessages.age}</span>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="mb-2">
                                        <label htmlFor="phone" className="col-form-label" style={{ lineHeight: '1' }}>Telefono:</label>
                                        <input type="text" className="form-control textModal" id="phone" name="phone" value={formData.phone} onChange={handleChange} onFocus={() => handleInputFocus("phone")} />
                                        <span className="text-danger">{errorMessages.phone}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="mb-2">
                                    <label htmlFor="consultation" className="col-form-label" style={{ lineHeight: '1' }}>Motivo de la consulta:</label>
                                    <textarea className="form-control textModal" id="consultation" name="consultation" rows="4" value={formData.consultation} onChange={handleChange} onFocus={() => handleInputFocus("consultation")}></textarea>
                                    <span className="text-danger">{errorMessages.consultation}</span>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-guardar-contact" onClick={handleSubmit}>Enviar</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`modal fade ${showSuccessModal ? 'show d-block' : 'd-none'}`} id="successModal" tabIndex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content" style={{textAlign:'left'}} id='contactModal'>
                        <div className="modal-header justify-content-end">
                            <button type="button" className="btn_close_contact" onClick={closeSuccessModal} aria-label="Close">X</button>
                        </div>
                        <div className="modal-body">
                            <span>¡Su consulta se ha enviado con exito!</span><br></br>
                            <span>La licenciada se estara comunicando por privado con usted para coordinar un encuentro.</span><br></br>
                            <span>Muchas gracias.</span>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-guardar-contact" onClick={closeSuccessModal}>Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`modal fade ${showAboutModal ? 'show d-block' : 'd-none'}`} id="successModal" tabIndex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content" style={{textAlign:'left'}} id='contactModal'>
                        <div className="modal-header justify-content-end">
                            <button type="button" className="btn_close_contact" onClick={closeShowAboutModal} aria-label="Close" style={{ float: 'right' }}>X</button>
                        </div>
                        <div className="modal-body">
                            <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ultricies eleifend velit, at aliquam leo malesuada sit amet. Quisque ut erat non nisi consequat gravida. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Maecenas posuere aliquam mauris eget congue. Proin eu sapien non quam sollicitudin efficitur. Donec nec augue id risus tincidunt consectetur.</span><br></br>
                            <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ultricies eleifend velit, at aliquam leo malesuada sit amet. Quisque ut erat non nisi consequat gravida. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Maecenas posuere aliquam mauris eget congue. Proin eu sapien non quam sollicitudin efficitur. Donec nec augue id risus tincidunt consectetur.</span>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-guardar-contact" onClick={closeShowAboutModal}>Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default Landing;
