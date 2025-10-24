// src/pages/Home.jsx
import React from "react";
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-3xl font-bold">Welcome to TechSwap</h1>
      <Link 
        to="/events" 
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
      >
        Go to Sessions
      </Link>
    </div>
  );
};

export default Home;