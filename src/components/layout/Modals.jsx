import React from 'react';

const Modals = ({ onClose, children, title }) => {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50">
        {/* Center Container */}
        <div className="relative flex items-center justify-center min-h-screen">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h1>{title}</h1>
              <button onClick={onClose}>X</button>
            </div>

            {/* Content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modals;
