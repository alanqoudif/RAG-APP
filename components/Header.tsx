
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="border-b border-gray-700 p-4 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="text-left">
            <h1 className="text-2xl font-bold text-blue-400">Student Guide Q&A</h1>
            <p className="text-sm text-gray-400">Your AI assistant for the Student Guide 2025.</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
