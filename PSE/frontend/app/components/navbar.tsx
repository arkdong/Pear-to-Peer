// Module/library imports
import { NavLink } from "@remix-run/react";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Style imports
import "app/style/navbar.css";

// NavBar functional component definition
const NavBar = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Effect hook to check login status when component mounts
  useEffect(() => {
    const token = localStorage.getItem('auth_token');

    if (token !== undefined && token !== null){
      setIsLoggedIn(true);
    }
    else{
      setIsLoggedIn(false);
    }
  });

  // Function to handle user logout
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    alert('User is logged out');
    setIsLoggedIn(false);
    navigate('/login');
  };

  // Function to navigate to user page
  const handleUser = () => {
    navigate('/user')
  }

  // Function to toggle dropdown menu
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  }

  // Function to handle home button click
  const handleHome = () => {
    navigate('/');
  }

  // Return the JSX for rendering the Navbar
  return (
    <div className="navBar">
      <div className="logo">
        <img src="app/icons/pear_to_peer_icon.png" alt="Logout" className="logoIcon" onClick={handleHome} />
      </div>
      <div className="navLinks">
        <NavLink to="/" className={({ isActive }) => isActive ? "activeLink" : "customUnderline"}>Home</NavLink>
        <NavLink to="/join-courses" className={({ isActive }) => isActive ? "activeLink" : "customUnderline"}>Join courses</NavLink>
        <NavLink to="/about-us" className={({ isActive }) => isActive ? "activeLink" : "customUnderline"}>About us</NavLink>
      </div>
      <div className="userAccount">
        <button onClick={toggleDropdown} className="userButton">
          <img src="app/icons/user.png" alt="User Account" className="userIcon" />
        </button>
        {dropdownOpen && (
          <div className="dropdownMenu">
            {isLoggedIn ? (
              <div>
                <button onClick={() => {handleUser(); toggleDropdown();}} className="dropdownItem">User Page</button>
                <button onClick={() => {handleLogout(); toggleDropdown();}} className="dropdownItem">Logout</button>
              </div>
            ) : (
              <NavLink to="/login" onClick={toggleDropdown} className="dropdownItem">Login</NavLink>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default NavBar;
