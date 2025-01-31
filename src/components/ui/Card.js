// src/components/ui/Card.js
import React from 'react';

const Card = ({ children, className }) => (
  <div className={`bg-white shadow-lg rounded-lg p-4 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div className="font-bold text-xl mb-2">{children}</div>
);

const CardContent = ({ children }) => (
  <div className="text-gray-700 text-base truncate">
    {children}
  </div>
);

const CardFooter = ({ children }) => (
  <div className="mt-4">{children}</div>
);

export { Card, CardHeader, CardContent, CardFooter };
