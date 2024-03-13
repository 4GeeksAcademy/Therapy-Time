import "../../styles/home.css";
import "../../styles/landing.css";
import React, { useState, useContext, useEffect } from "react";
import { Context } from "../store/appContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt} from '@fortawesome/free-solid-svg-icons';
import { NavbarTherapist } from "../component/navbar"

export const Patients = () => {
    const { store, actions } = useContext(Context);
    const [showModal, setShowModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showInactive, setShowInactive] = useState(false);
    const [nameFilter, setNameFilter] = useState("");
    const [dniFilter, setDniFilter] = useState("");
    const [showModalEdit, setShowModalEdit] = useState(false);
    const [successAction, setSuccessAction] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [patientsPerPage] = useState(10);
    const [userData, setUserData] = useState({
        id : "",
        role_id: 1,
        username: "",
        name: "",
        lastname: "",
        dni: "",
        phone: "",
        email: "", 
        virtual_link: "",
        is_active : true
    });
    const initialUserData = {
        id : "",
        role_id: 1,
        username: "",
        name: "",
        lastname: "",
        dni: "",
        phone: "",
        email: "", 
        virtual_link: "",
        is_active : true
    };

    useEffect(() => {
        actions.getUsers();
    }, []);

    //Apertura y cierre de modales
    const openModal = () => {
        setShowModal(true);
        setUserData(initialUserData);
    };
    const closeModal = () => {
        setShowModal(false);
        setShowModalEdit(false);
    };
    const closeSuccessModal = () => {
        setShowSuccessModal(false);
        actions.getUsers();
    };

    //Alta de nuevos usuarios
    const handleSubmit = async () => {
        const validationMessages = validateForm(userData, false);
        setErrorMessages(validationMessages);
        
        const hasErrors = Object.values(validationMessages).some(msg => msg !== "");
        if (hasErrors) {
            return; 
        }
        try {
            await actions.createUser(
                userData
            );
            closeModal();
            setSuccessAction("add"); 
            setShowSuccessModal(true);
            setUserData({
                id: "",
                role_id: 1,
                username: "",
                name: "",
                lastname: "",
                dni: "",
                phone: "",
                email: "",
                virtual_link: "", 
                is_active: true
            });
        } catch (error) {
            console.error("Error al crear usuario:", error.message);
        }
    };

    //Filtros de busqueda/listado
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "is_active") {
            setIsActive(value === "activo");
            setUserData(prevState => ({
                ...prevState,
                [name]: value === "activo" ? true : false
            }));
        } else {
            setUserData(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    };
    const toggleShowInactive = () => {
        setShowInactive(!showInactive);
    };
    const handleChangeNameFilter = (e) => {
        setNameFilter(e.target.value);
    };  
    const handleChangeDniFilter = (e) => {
        setDniFilter(e.target.value);
    };   
    const filteredUsers = store.user.filter(user => {
        const nameMatches = (user.name && user.name.toLowerCase().includes(nameFilter.toLowerCase())) || (user.lastname && user.lastname.toLowerCase().includes(nameFilter.toLowerCase()));
        const dniMatches = user.dni && user.dni.includes(dniFilter);
        return nameMatches && dniMatches;
    });
    const activeFilteredUsers = filteredUsers.filter(user => user.is_active);
    const inactiveFilteredUsers = filteredUsers.filter(user => !user.is_active);
    const sortedActiveFilteredUsers = activeFilteredUsers.sort((a, b) => a.name.localeCompare(b.name));
    const sortedInactiveFilteredUsers = inactiveFilteredUsers.sort((a, b) => a.name.localeCompare(b.name));
    const sortedFilteredUsers = [...sortedActiveFilteredUsers, ...sortedInactiveFilteredUsers];
    
    //Edicion de usuario
    const handleGetUser = async(id) =>{
        try{
            const data = await actions.getUser(id);
            setUserData(data);
            setShowModalEdit(true);
            const validationMessages = validateForm(data, true); 
            setErrorMessages(validationMessages);
        } catch (error) {
            console.error("Error al obtener el usuario:", error.message);
        }
    };
    const handleSaveChanges = async () => {
        const validationMessages = validateForm(userData, true);
        setErrorMessages(validationMessages);
        
        const hasErrors = Object.values(validationMessages).some(msg => msg !== "");
        if (hasErrors) {
            return; 
        }
        try {
            const userId = userData.id;
            await actions.editUser(userId, userData);
            closeModal();
            setSuccessAction("edit"); 
            setShowSuccessModal(true);
        } catch (error) {
            console.error("Error al guardar los cambios:", error.message);
        }
    };
    
    //Validaciones
    const [errorMessages, setErrorMessages] = useState({
        username: "",
        name: "",
        lastname: "",
        dni: "",
        phone: "",
        email: ""
    });
    const handleInputFocus = (fieldName) => {
        setErrorMessages(prevErrors => ({
            ...prevErrors,
            [fieldName]: ""
        }));
    };
    const validateForm = (data, isEditing) => {
        const errors = {};
        if (data.username.trim() === "") {
            errors.username = "*El campo es obligatorio";
        } else {
            errors.username = "";
        }
        if (data.name.trim() === "") {
            errors.name = "*El campo es obligatorio";
        } else {
            errors.name = "";
        }        
        if (data.lastname.trim() === "") {
            errors.lastname = "*El campo es obligatorio";
        } else {
            errors.lastname = "";
        }
        if (data.dni.trim() === "") {
            errors.dni = "*El campo es obligatorio";
        } else if (!/^\d{8}$/.test(data.dni)) {
            errors.dni = "El DNI debe contener 8 dígitos numéricos.";
        } else {
            errors.dni = "";
        }
        if (data.phone.trim() === "") {
            errors.phone = "*El campo es obligatorio";
        } else if (!/^\d{10}$/.test(data.phone)) {
            errors.phone = "El teléfono debe contener 10 dígitos numéricos.";
        } else {
            errors.phone = "";
        }
        if (data.email.trim() === "") {
            errors.email = "*El campo es obligatorio";
        } else if (!isValidEmail(data.email)) {
            errors.email = "El email no tiene un formato válido.";
        } else {
            errors.email = "";
        }

        if (!isEditing) {
            const existingEmail = store.user.some(user => user.email === data.email);
            if (existingEmail) {
                errors.email = "Este correo electrónico ya está registrado.";
            }
            const existingDNI = store.user.some(user => user.dni === data.dni);
            if (existingDNI) {
                errors.dni = "Este DNI ya está registrado.";
            }
        }
        return errors;
    };
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        return emailRegex.test(email);
    };
    
    //Paginacion
    const paginate = pageNumber => setCurrentPage(pageNumber);
    const visibleUsers = (showInactive ? sortedFilteredUsers : sortedActiveFilteredUsers);

    return (
        <div style={{backgroundColor: 'white', minHeight: '100vh', minWidth: '100vw'}}>
            <NavbarTherapist />
            <div className="container mt-5 border" style={{paddingTop:'2vh'}}>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nanum+Gothic&display=swap" />
                <div className="d-flex justify-content-start align-items-center mb-3" style={{fontFamily: 'Nanum Gothic, sans-serif'}}>
                    <div className="input-group flex-grow-1 ">
                        <span className="input-group-text" style={{backgroundColor:'#FAFAFA', color:'#7E7E7E'}}>Nombre o Apellido</span>
                        <input type="text" className="form-control" value={nameFilter} onChange={handleChangeNameFilter} />
                    </div>
                    <div className="input-group m-3">
                        <span className="input-group-text"style={{backgroundColor:'#FAFAFA', color:'#7E7E7E'}}>DNI</span>
                        <input type="text" className="form-control" value={dniFilter} onChange={handleChangeDniFilter} />
                    </div>
                    <div className="input-group flex-grow-1 m-3">
                        <input className="form-check-input me-2" type="checkbox" id="showInactiveCheckbox" onChange={toggleShowInactive}/>
                        <label className="form-check-label mr-1" htmlFor="showInactiveCheckbox">
                            Mostrar pacientes inactivos
                        </label>
                    </div>
                    <button type="button" className="btn ms-3" style={{backgroundColor:'#C47C7A', color:'white'}} onClick={openModal}>+</button>
                </div>
                <table className="table table-hover" style={{backgroundColor:'white', color: '#7E7E7E', fontFamily: 'Nanum Gothic, sans-serif'}}>
                    <thead style={{backgroundColor: '#FAFAFA'}}>
                        <tr>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>DNI</th>
                            <th>Teléfono</th>
                            <th>Sala virtual</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedFilteredUsers.length > 0 ? (
                            sortedFilteredUsers.slice((currentPage - 1) * patientsPerPage, currentPage * patientsPerPage).map((user, index) => (
                                (showInactive || user.is_active) && (
                                    <tr key={index}>
                                        <td>{user.name}</td>
                                        <td>{user.lastname}</td>
                                        <td>{user.dni}</td>
                                        <td>{user.phone}</td>
                                        <td>
                                            <a href={user.virtual_link} target="_blank" rel="noopener noreferrer">
                                                Ingresar
                                            </a>
                                        </td>
                                        <td>{user.is_active ? 'Activo' : 'Inactivo'}</td>
                                        <td>
                                            <FontAwesomeIcon icon={faPencilAlt} className="me-2" onClick={() => handleGetUser(user.id)} />
                                        </td>
                                    </tr>
                                )
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7">No hay registros disponibles</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <ul className="pagination justify-content-start">
                    {Array.from({ length: Math.ceil(visibleUsers.length / patientsPerPage) }, (_, index) => (
                        <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                            <button onClick={() => paginate(index + 1)} className="page-link" style={{backgroundColor:'#B2A79F', color:'white',   border: '1px solid transparent', outline: 'none'}}>
                                {index + 1}
                            </button>
                        </li>
                    ))}
                </ul>
                <div className={`modal fade ${showModal ? 'show d-block' : 'd-none'}`} id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{textAlign:'left'}} id="contactModal">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="exampleModalLabel">Nuevo paciente</h1>
                                <button type="button" className="btn_close_contact" onClick={closeModal} aria-label="Close">X</button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="row">
                                        <div className="mb-3">
                                            <label htmlFor="userName" className="col-form-label">Nombre de usuario:</label>
                                            <input type="text" className="form-control textModal" id="userName" name="username" value={userData.username} onChange={handleChange}  onFocus={() => handleInputFocus("username")} />
                                            <span className="text-danger">{errorMessages.username}</span>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-6">    
                                            <div className="mb-3">
                                                <label htmlFor="name" className="col-form-label">Nombre:</label>
                                                <input type="text" className="form-control textModal" id="name" name="name" value={userData.name} onChange={handleChange}  onFocus={() => handleInputFocus("name")} />
                                                <span className="text-danger">{errorMessages.name}</span>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="mb-3">
                                                <label htmlFor="lastName" className="col-form-label">Apellido:</label>
                                                <input type="text" className="form-control textModal" id="lastName" name="lastname" value={userData.lastname} onChange={handleChange}  onFocus={() => handleInputFocus("lastname")} />
                                                <span className="text-danger">{errorMessages.lastname}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-6">
                                            <div className="mb-3">
                                                <label htmlFor="dni" className="col-form-label">DNI:</label>
                                                <input type="text" className="form-control textModal" id="dni" name="dni" value={userData.dni} onChange={handleChange}  onFocus={() => handleInputFocus("dni")}  />
                                                <span className="text-danger">{errorMessages.dni}</span>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="mb-3">
                                                <label htmlFor="phone" className="col-form-label">Telefono de contacto:</label>
                                                <input type="text" className="form-control textModal" id="phone" name="phone" value={userData.phone} onChange={handleChange}  onFocus={() => handleInputFocus("phone")} />
                                                <span className="text-danger">{errorMessages.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-6">
                                            <div className="mb-3">
                                                <label htmlFor="email" className="col-form-label">Email:</label>
                                                <input type="text" className="form-control textModal" id="email" name="email" value={userData.email} onChange={handleChange}  onFocus={() => handleInputFocus("email")}  /> 
                                                <span className="text-danger">{errorMessages.email}</span>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="mb-3">
                                                <label htmlFor="virtual_link" className="col-form-label">Link a sala vitual:</label>
                                                <textarea className="form-control textModal" id="virtual_link" name="virtual_link" value={userData.virtual_link} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-guardar-contact" onClick={handleSubmit}>Guardar</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`modal fade ${showSuccessModal ? 'show d-block' : 'd-none'}`} id="successModal" tabIndex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{textAlign:'left'}} id="contactModal">
                            <div className="modal-header justify-content-end">
                                <button type="button" className="btn_close_contact" onClick={closeSuccessModal} aria-label="Close">X</button>
                            </div>
                            <div className="modal-body">
                                {successAction === "add" ? (
                                    <span>El paciente se ha agregado con éxito.</span>
                                ) : successAction === "edit" ? (
                                    <span>Los cambios se han guardado con éxito.</span>
                                ) : null}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-guardar-contact" onClick={closeSuccessModal}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`modal fade ${showModalEdit ? 'show d-block' : 'd-none'}`} id="modalEdit" tabIndex="-1" aria-labelledby="ModalEdit" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{textAlign:'left'}} id="contactModal">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="exampleModalLabel">Editar paciente</h1>
                                <button type="button" className="btn_close_contact" onClick={closeModal} aria-label="Close">X</button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="row">
                                        <div className="mb-2">
                                            <label htmlFor="userName" className="col-form-label">Nombre de usuario:</label>
                                            <input type="text" className="form-control textModal" id="userName" name="username" value={userData.username} onChange={handleChange} onFocus={() => handleInputFocus("username")} />
                                            <span className="text-danger">{errorMessages.username}</span>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-6">    
                                            <div className="mb-2">
                                                <label htmlFor="name" className="col-form-label">Nombre:</label>
                                                <input type="text" className="form-control textModal" id="name" name="name" value={userData.name} onChange={handleChange}  onFocus={() => handleInputFocus("name")}  />
                                                <span className="text-danger">{errorMessages.name}</span>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="mb-2">
                                                <label htmlFor="lastName" className="col-form-label">Apellido:</label>
                                                <input type="text" className="form-control textModal" id="lastName" name="lastname" value={userData.lastname} onChange={handleChange}  onFocus={() => handleInputFocus("lastname")} />
                                                <span className="text-danger">{errorMessages.lastname}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-6">
                                            <div className="mb-2">
                                                <label htmlFor="dni" className="col-form-label">DNI:</label>
                                                <input type="text" className="form-control textModal" id="dni" name="dni" value={userData.dni} onChange={handleChange}  onFocus={() => handleInputFocus("dni")}  />
                                                <span className="text-danger">{errorMessages.dni}</span>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="mb-2">
                                                <label htmlFor="phone" className="col-form-label">Telefono de contacto:</label>
                                                <input type="text" className="form-control textModal" id="phone" name="phone" value={userData.phone} onChange={handleChange}  onFocus={() => handleInputFocus("phone")}  />
                                                <span className="text-danger">{errorMessages.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-6">
                                            <div className="mb-2">
                                                <label htmlFor="email" className="col-form-label">Email:</label>
                                                <input type="email" className="form-control textModal" id="email" name="email" value={userData.email} onChange={handleChange}  onFocus={() => handleInputFocus("email")}  /> 
                                                <span className="text-danger">{errorMessages.email}</span>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="mb-2">
                                                <label htmlFor="status" className="col-form-label">Estado:</label>
                                                <select className="form-control textModal" id="status" name="is_active" value={userData.is_active ? "activo" : "inactivo"} onChange={handleChange}>
                                                    <option value="" disabled>Seleccione</option>
                                                    <option value="activo">Activo</option>
                                                    <option value="inactivo">Inactivo</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="mb-2">
                                                <label htmlFor="virtual_link" className="col-form-label">Link a sala vitual:</label>
                                                <textarea className="form-control textModal" id="virtual_link" name="virtual_link" value={userData.virtual_link} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-guardar-contact" onClick={handleSaveChanges}>Guardar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};



