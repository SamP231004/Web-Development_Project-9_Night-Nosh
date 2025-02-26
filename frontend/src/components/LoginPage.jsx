import React from 'react';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  return (
    <div>
      <h2>Welcome to Night Nosh</h2>
      <Link to="/portal-selection">Login</Link>
    </div>
  );
};

export default LoginPage;