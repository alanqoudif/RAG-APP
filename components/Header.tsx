
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="border-b border-gray-700/50 p-4 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="text-right">
            <h1 className="text-2xl font-bold text-violet-400">دليل القبول ٢٠٢٥</h1>
            <p className="text-sm text-gray-400">مساعدك الذكي لكل استفسارات القبول</p>
        </div>
        <div className="w-12 h-12 bg-violet-500/20 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      </div>
    </header>
  );
};

export default Header;
