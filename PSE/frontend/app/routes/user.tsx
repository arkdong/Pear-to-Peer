import { useState, useEffect } from 'react';
import { useNavigate } from "@remix-run/react";
import '../style/style.css';
import '../style/user.css';
import type { MetaFunction } from "@remix-run/node";


export const meta: MetaFunction = () => {
  return [
    { title: "Pear to Peer" },
    { name: "User", content: "User page with accountactions" },
  ];
};

const apiBaseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost';

/**
 * UserProfile component
 * This page allows for the viewing and deletion of an account,
 * as well as changing its password.
 */
const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [permissionLevel, setPermissionLevel] = useState('');

  const navigate = useNavigate();

  // Check for token on page load, redirect to login if not found
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (!storedToken) {

      navigate('/login');
      return;
    }
    setToken(storedToken);
  }, [navigate]);

  // Fetch user data on page load
  useEffect(() => {
    if (!token) return;

    // Fetches name etc.
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/current_user`, {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        });

        if (!response.ok) {
          throw new Error(response.statusText);
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    // Fetches the permission level as a string to display on the page.
    const fetchPermissionLevel = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/get_permission_level`, {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        });

        if (!response.ok) {
          throw new Error(response.statusText);
        }

        const data = await response.json();
        setPermissionLevel(data.permission_level);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchPermissionLevel();
  }, [token]);

  const handleLogOut = async () => {
    if (!token) {

      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/logout`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
        },
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const result = await response.json();


      // Clear token and redirect to login page
      localStorage.removeItem('auth_token');
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Handles the request to change password. Requires the user to be logged
  // and the three password fields to be filled.
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/change_password`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error_code === 'PASSWORD_FORMAT_ERROR') {
          setError('Invalid password format. Please include a capital letter.');
        } else {
          setError('Failed to change password.');
        }
        return;
      }

      alert('Password change successful.')

      // Close the modal and reset inputs
      setShowChangePasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Password change failed:', err);
      setError('Failed to change password. Please try again later.');
    }
  };


    // Fucntion for the deletion of an account. Requires a user to be logged in.
    const handleDeleteAccount = async () => {
      if (!token) {

        navigate('/login');
        return;
      }

      if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
          try {
            const delete_response = await fetch(`${apiBaseUrl}/api/delete_current_user`, {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + token
              }
            });

            if (!delete_response.ok) {
              throw new Error(delete_response.statusText);
            }

            const data = await delete_response.json();
          } catch (delete_err) {
            setError(delete_err.message);
          }
          navigate('/login');
      }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Error: Something went wrong...</div>;
  return (
    <div className="user-profile-container">
      <h1>Hello {user['fname']}!</h1>
      <div>{permissionLevel}</div>
      <div>
        <p><strong>Name:</strong> {user['fname']} {user['lname']}</p>
        <p><strong>Email:</strong> {user['email']}</p>
      </div>
      <div className="navLinks">
        <button className='button button-blue' onClick={handleLogOut}>Log Out</button>
        <button className='button button-blue' onClick={() => setShowChangePasswordModal(true)}>Change Password</button>
        <button className='button button-remove' onClick={handleDeleteAccount}>Delete Account</button>
        {/* Add more buttons for other actions like Delete Account here */}
      </div>

      {showChangePasswordModal && (
        <div className="modal-overlay" onClick={() => setShowChangePasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Change Password</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleChangePassword();
            }}>
              <div>
                <label className='modal-text'>Current Password:</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className='modal-text'>New Password:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className='modal-text'>Confirm Password:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <button type="submit" className='button button-blue'>Confirm</button>
                <button type="button" className='button button-dark' onClick={() => setShowChangePasswordModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
