import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import StockList from './components/StockList';
import ReservationForm from './components/ReservationForm';
import ReservationHistory from './components/ReservationHistory';
import OwnerStockManagement from './components/OwnerStockManagement';
import Login from './components/Login';
import PortalSelection from './components/PortalSelection';
import StudentRegister from './components/StudentRegister';
import OwnerRegister from './components/OwnerRegister';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const ProtectedRoute = ({ children }) => {
    if (!token) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Login setToken={setToken} />} />
          <Route path="/portal-selection" element={<PortalSelection />} />
          <Route path="/student/register" element={<StudentRegister />} />
          <Route path="/owner/register" element={<OwnerRegister />} />
          <Route
            path="/student/*"
            element={
              <ProtectedRoute>
                <div>
                  <nav>
                    <ul>
                      <li>
                        <Link to="/student/stock">Stock List</Link>
                      </li>
                      <li>
                        <Link to="/student/reserve">Make Reservation</Link>
                      </li>
                      <li>
                        <Link to="/student/history">Reservation History</Link>
                      </li>
                    </ul>
                  </nav>
                  <Routes>
                    <Route path="stock" element={<StockList />} />
                    <Route path="reserve" element={<ReservationForm />} />
                    <Route path="history" element={<ReservationHistory />} />
                  </Routes>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner"
            element={
              <ProtectedRoute>
                <OwnerStockManagement />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;