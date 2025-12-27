import React, { useState } from 'react';
import { NavLink, useNavigate } from "@remix-run/react";
import '../style/register.css';
import type { MetaFunction } from "@remix-run/node";


export const meta: MetaFunction = () => {
  return [
    { title: "Pear to Peer" },
    { name: "Register", content: "Allows a user to register" },
  ];
};


const apiBaseUrl = process.env.REACT_APP_API_BASE_URL  || 'http://localhost'

/**
 * Register Component
 * This component handles the user registration process.
 * Users can enter their first name, last name, email, and password.
 * On successful registration, the user is redirected to the home page.
 * If there are errors, appropriate messages are displayed.
 */
export default function Register() {
  // State to manage form data
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: ''
  });

  // State to manage error messages
  const [messages, setMessages] = useState<string[]>([]);

  // State to manage password validity
  const [ValidPassword, setValidPassword] = useState<boolean | null>(null);

  // Navigate function from react-router to programmatically navigate to different routes
  const navigate = useNavigate();

  /**
   * handleChange - Handles changes to input fields
   */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  /**
   * SubmitClicked - Handles form submission
   * Makes a POST request to the backend with the form data.
   * On success, navigates to the home page.
   * On error, displays the appropriate error messages.
   */
  const SubmitClicked = async () => {
    const { fname, lname, email, confirmEmail, password, confirmPassword } = formData;
    // Check if all required fields are filled
    if (!fname || !lname || !email || !confirmEmail || !password || !confirmPassword) {
      setMessages(['Please fill in all required fields.']);
      return;
    }

    const response = await fetch(`${apiBaseUrl}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (response.ok) {
      navigate('/login');
    } else {
      if (result.error_1) {
        setMessages(result.error_1);
        setFormData({ ...formData, password: '' });
        setValidPassword(false);
      } else if (result.error_2) {
        navigate('/login');
      } else {
        setMessages([result.error_3]);
      }
    }
  };

  return (
    <div>
      <header className="header">
        <h1>Register</h1>
      </header>
      <div className="container">
        <div className="form-container">
          <div className="input-group">
            <label htmlFor="inputFirstname" className="form-label">First name</label>
            <input
              type="text"
              id="inputFirstname"
              name="fname"
              className="form-control"
              value={formData.fname}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="inputLastname" className="form-label">Last name</label>
            <input
              type="text"
              id="inputLastname"
              name="lname"
              className="form-control"
              value={formData.lname}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="inputEmail" className="form-label">Email</label>
            <input
              type="email"
              id="inputEmail"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="inputConfirmEmail" className="form-label">Confirm Email</label>
            <input
              type="email"
              id="inputConfirmEmail"
              name="confirmEmail"
              className="form-control"
              value={formData.confirmEmail}
              onChange={handleChange}
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
              aria-describedby="passwordHelpBlock"
              value={formData.password}
              onChange={handleChange}
            />
            <div id="passwordHelpBlock" className="form-text">
              Your password must be 8-30 characters long, contain at least one capital letter and one number.
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="inputConfirmPassword" className="form-label">Confirm Password</label>
            <input
              type="password"
              id="inputConfirmPassword"
              name="confirmPassword"
              className="form-control"
              aria-describedby="confirmPasswordHelpBlock"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <div id="confirmPasswordHelpBlock" className="form-text">
              Passwords must match
            </div>
          </div>

          <div id="submitButton">
            <button type="button" className="btn-submit" onClick={SubmitClicked}>Submit</button>
          </div>
          {messages.length > 0 && (
            <div className={`message ${ValidPassword ? 'message-valid' : 'message-invalid'}`}>
              <ul>
                {messages.map((msg, index) => (
                  <li key={index}>{msg}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="login-link-container">
            Already have an account?
            <NavLink to="/login" className="login-link">Click here to login!</NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}
