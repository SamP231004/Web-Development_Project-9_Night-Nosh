import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ReservationSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    const refreshHistory = async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        navigate('/student/history', { replace: true });
    };
    refreshHistory();
}, [navigate]);

    const searchParams = new URLSearchParams(location.search);
    const sessionId = searchParams.get('session_id');

    return (
        <div>
            {loading ? (
                <div>
                    <h2>Payment Successful!</h2>
                    <p>Your reservation has been confirmed.</p>
                    {sessionId && <p>Session ID: {sessionId}</p>}
                    <p>Redirecting to reservation history...</p>
                </div>
            ) : null}
        </div>
    );
};

export default ReservationSuccess;