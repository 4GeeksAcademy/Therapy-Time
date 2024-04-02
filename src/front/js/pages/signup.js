import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";

export const Signup = () => {
  const {actions } = useContext(Context);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  const handleInputChange = () => {
    setErrorMessage('');
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden");
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
    if (!passwordRegex.test(password)) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres, una mayúscula y un carácter especial");
      return;
    }

    try {
      const data = await actions.createUser(username, email, password);
      console.log('Usuario creado con éxito:', data);
      navigate("/login");
    } catch (error) {
      console.error('Error creating user:', error.message);
      setErrorMessage(error.message);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="container signup">
      <div className="row">
        <div className="col-md-5">
          <h1 className="titleSignup">Create an account</h1>
        </div>
        <div className="col-md-7">
          {errorMessage && (
            <div className="alert alert-danger" role="alert">
              {errorMessage}
            </div>
          )}
          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="username"
                className="form-control"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); handleInputChange(); }}
                required
              />
            </div>
            <div className="form-group">
              <label>Email address</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); handleInputChange(); }}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); handleInputChange(); }}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); handleInputChange(); }}
                required
              />
            </div>
            <button type="submit" className="btn btnSignup">
              Create
            </button>
          </form>
        </div>
      </div>
      <div className="row aling-items-center">
        <div className="col-md-5">
          <Link to="/login" className="linkSignup">
            ← Go Back
          </Link>
        </div>
        <div className="col-md-7">
          <hr className="mt-4" />
        </div>
      </div>
    </div>
  );
};

