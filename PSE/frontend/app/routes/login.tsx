import React, { useState } from 'react';
import { NavLink, useNavigate } from "@remix-run/react";
import '../style/login.css';
import type { MetaFunction } from "@remix-run/node";


export const meta: MetaFunction = () => {
  return [
    { title: "Pear to Peer" },
    { name: "Login", content: "Allows a user to login" },
  ];
};

const apiBaseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost'

/**
 * Login Component
 * This component handles user login functionality.
 * Users can enter their email and password to log in.
 * On successful login, the user is redirected to the home page.
 * If there are errors, appropriate messages are displayed.
 */
export default function Login() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const navigate = useNavigate();

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  /**
   * submitClicked - Handles the form submission for login
   * Makes a POST request to the backend with the email and password.
   * On success, navigates to the home page.
   * On error, displays the appropriate error messages.
   */
  const submitClicked = async () => {
    // Check if all required fields are filled
    if (!email || !password) {
      setMessage('Please fill in all required fields.');
      return;
    }

    // Local development URL
    // const url = 'http://localhost:5000/api/login';

    // Server
    const url = `${apiBaseUrl}/api/login`;

    // Send login request to the backend
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    const result = await response.json();

    // Handle the response
    if (response.ok) {

      localStorage.setItem('auth_token', result.access_token);
      navigate('/');
    } else if (result.error) {
      setMessage(result.error);
      setPassword("");
      setIsValid(false);
    }
  };

  return (
    <div>
      <header className="header">
        <h1>Login</h1>
      </header>
      <div className="container">
        <div className="form-container">
          <div className="input-group">
            <label htmlFor="inputEmail" className="form-label">Email</label>
            <input
              type="email"
              id="inputEmail"
              name="email"
              className="form-control"
              value={email}
              onChange={handleEmailChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="inputPassword" className="form-label">Password</label>
            <input
              type="password"
              id="inputPassword"
              name="password"
              className="form-control"
              value={password}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <div id="submitButton">
            <button type="button" className="btn-submit" onClick={submitClicked}>Submit</button>
          </div>

          {message && (
            <div className={`message ${isValid ? 'message-valid' : 'message-invalid'}`}>
              {message}
            </div>
          )}

          <div className="register-link-container">
            Don't have an account?
            <NavLink to="/register" className="register-link">Click here to register!</NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}
