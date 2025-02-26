import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const StudentRegister = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/auth/student/register', { username, password });
            navigate('/');
        }
        catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div>
            <h2>Student Registration</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Register</button>
            </form>
            <p>Already have an account? <Link to="/">Login</Link></p>
        </div>
    );
};

export default StudentRegister;