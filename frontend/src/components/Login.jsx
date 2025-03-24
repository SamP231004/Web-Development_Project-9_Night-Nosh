import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; // Use direct axios for login to avoid circular dependency

const Login = ({ setToken }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('Attempting login...');
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/${role}/login`, { 
                username, 
                password 
            });

            console.log('Login response:', response.data);

            if (!response.data.token) {
                throw new Error('No token received from server');
            }

            const token = response.data.token;
            console.log('Setting token:', token);

            // Store token in localStorage
            localStorage.setItem('token', token);
            
            // Update app state
            setToken(token);

            // Verify token was stored
            const storedToken = localStorage.getItem('token');
            console.log('Stored token:', storedToken);

            // Navigate to appropriate route
            navigate(`/${role}`);
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Login failed. Please try again.');
            // Clear any existing token on login failure
            localStorage.removeItem('token');
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Role:</label>
                    <select 
                        value={role} 
                        onChange={(e) => setRole(e.target.value)}
                        disabled={loading}
                    >
                        <option value="student">Student</option>
                        <option value="owner">Owner</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Username:</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                        disabled={loading}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        disabled={loading}
                        required
                    />
                </div>
                <button 
                    type="submit"
                    disabled={loading}
                    className={loading ? 'loading' : ''}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            {role === 'student' && (
                <p className="register-link">
                    Don't have an account? <Link to="/student/register">Register</Link>
                </p>
            )}
            {role === 'owner' && (
                <p className="register-link">
                    Don't have an account? <Link to="/owner/register">Register</Link>
                </p>
            )}
            <style jsx>{`
                .login-container {
                    max-width: 400px;
                    margin: 2rem auto;
                    padding: 2rem;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .form-group {
                    margin-bottom: 1rem;
                }

                label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: bold;
                }

                input, select {
                    width: 100%;
                    padding: 0.5rem;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    margin-top: 0.25rem;
                }

                button {
                    width: 100%;
                    padding: 0.75rem;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: background-color 0.2s;
                }

                button:disabled {
                    background-color: #ccc;
                    cursor: not-allowed;
                }

                button.loading {
                    position: relative;
                    color: transparent;
                }

                button.loading::after {
                    content: '';
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    width: 20px;
                    height: 20px;
                    margin: -10px 0 0 -10px;
                    border: 2px solid #fff;
                    border-top-color: transparent;
                    border-radius: 50%;
                    animation: button-loading-spinner 1s linear infinite;
                }

                @keyframes button-loading-spinner {
                    from {
                        transform: rotate(0turn);
                    }
                    to {
                        transform: rotate(1turn);
                    }
                }

                .error-message {
                    color: #dc3545;
                    margin-bottom: 1rem;
                    padding: 0.5rem;
                    border: 1px solid #dc3545;
                    border-radius: 4px;
                    background-color: #fff;
                }

                .register-link {
                    margin-top: 1rem;
                    text-align: center;
                }

                .register-link a {
                    color: #007bff;
                    text-decoration: none;
                }

                .register-link a:hover {
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
};

export default Login;