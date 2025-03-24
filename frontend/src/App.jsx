import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import StockList from './components/StockList';
import ReservationForm from './components/ReservationForm';
import ReservationHistory from './components/ReservationHistory';
import OwnerStockManagement from './components/OwnerStockManagement';
import Login from './components/Login';
import StudentRegister from './components/StudentRegister';
import OwnerRegister from './components/OwnerRegister';
import ReservationSuccess from './components/ReservationSuccess';

function App() {
    const [token, setToken] = useState(() => {
        // Initialize token from localStorage
        const savedToken = localStorage.getItem('token');
        if (!savedToken) return null;
        try {
            // Verify token format
            const parts = savedToken.split('.');
            if (parts.length !== 3) {
                localStorage.removeItem('token');
                return null;
            }
            return savedToken;
        } catch (err) {
            localStorage.removeItem('token');
            return null;
        }
    });

    // Update token in localStorage whenever it changes
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    const ProtectedRoute = ({ children }) => {
        if (!token) {
            return <Navigate to="/" replace />;
        }
        return children;
    };

    const StudentRoutes = () => (
        <div>
            <nav className="student-nav">
                <ul>
                    <li><Link to="/student/stock">Stock List</Link></li>
                    <li><Link to="/student/reserve">Make Reservation</Link></li>
                    <li><Link to="/student/history">Reservation History</Link></li>
                </ul>
                <button onClick={() => setToken(null)}>Logout</button>
            </nav>
            <Routes>
                <Route path="stock" element={<StockList />} />
                <Route path="reserve" element={<ReservationForm />} />
                <Route path="history" element={<ReservationHistory />} />
            </Routes>
            <style jsx>{`
                .student-nav {
                    background-color: #f8f9fa;
                    padding: 1rem;
                    margin-bottom: 2rem;
                    border-bottom: 1px solid #dee2e6;
                }

                .student-nav ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    gap: 2rem;
                }

                .student-nav li {
                    margin: 0;
                }

                .student-nav a {
                    text-decoration: none;
                    color: #007bff;
                    font-weight: 500;
                }

                .student-nav a:hover {
                    color: #0056b3;
                }

                .student-nav button {
                    float: right;
                    padding: 0.5rem 1rem;
                    background-color: #dc3545;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }

                .student-nav button:hover {
                    background-color: #c82333;
                }
            `}</style>
        </div>
    );

    return (
        <Router>
            <div>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={
                        token ? (
                            <Navigate to="/student/stock" replace />
                        ) : (
                            <Login setToken={setToken} />
                        )
                    } />
                    <Route path="/student/register" element={<StudentRegister />} />
                    <Route path="/owner/register" element={<OwnerRegister />} />
                    <Route path="/reservation-success" element={<ReservationSuccess />} />

                    {/* Protected Student Routes */}
                    <Route path="/student/*" element={
                        <ProtectedRoute>
                            <StudentRoutes />
                        </ProtectedRoute>
                    } />

                    {/* Protected Owner Routes */}
                    <Route path="/owner" element={
                        <ProtectedRoute>
                            <OwnerStockManagement />
                        </ProtectedRoute>
                    } />

                    {/* Catch-all route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;