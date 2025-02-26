import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ setToken }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`/auth/${role}/login`, { username, password });
            setToken(response.data.token);
            localStorage.setItem('token', response.data.token);
            navigate(`/${role}`);
        }
        catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="student">Student</option>
                    <option value="owner">Owner</option>
                </select>
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Login</button>
            </form>
            {role === 'student' && <p>Don't have an account? <Link to="/student/register">Register</Link></p>}
            {role === 'owner' && <p>Don't have an account? <Link to="/owner/register">Register</Link></p>}

        </div>
    );
};

export default Login;