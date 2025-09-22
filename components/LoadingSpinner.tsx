

import React from 'react';

const LoadingSpinner: React.FC<{ size?: number }> = ({ size = 8 }) => {
  return (
    <div className={`w-${size} h-${size} border-4 border-t-orange-500 border-gray-600 rounded-full animate-spin`}></div>
  );
};

export default LoadingSpinner;