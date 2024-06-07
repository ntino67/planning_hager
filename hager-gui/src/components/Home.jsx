// src/components/Home.jsx
import React from 'react';
import EmployeeGrid from './EmployeeGrid';

const Home = () => {
  return (
    <div className="home">
      <h1>Employee Management</h1>
      <EmployeeGrid />
    </div>
  );
};

export default Home;
