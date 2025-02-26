import React from 'react';
import { Link } from 'react-router-dom';

const PortalSelection = () => {
  return (
    <div>
      <h2>Select Portal</h2>
      <div>
        <Link to="/student">Student Portal</Link>
        <Link to="/owner">Owner Portal</Link>
      </div>
    </div>
  );
};

export default PortalSelection;