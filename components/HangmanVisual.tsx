
import React from 'react';

interface HangmanVisualProps {
  mistakes: number;
}

const HangmanVisual: React.FC<HangmanVisualProps> = ({ mistakes }) => {
  // Elements to draw based on mistakes count (0-6)
  const elements = [
    // 0: The Base & Gallows
    <g key="gallows" stroke="#8b5cf6" strokeWidth="6" fill="none">
      <path d="M20 180 L180 180" strokeLinecap="round" />
      <path d="M50 180 L50 20" strokeLinecap="round" />
      <path d="M50 20 L130 20" strokeLinecap="round" />
      <path d="M130 20 L130 40" strokeLinecap="round" />
    </g>,
    // 1: Head
    <circle key="head" cx="130" cy="60" r="20" stroke="#f43f5e" strokeWidth="4" fill="#fff" />,
    // 2: Body
    <line key="body" x1="130" y1="80" x2="130" y2="130" stroke="#f43f5e" strokeWidth="4" />,
    // 3: Left Arm
    <line key="left-arm" x1="130" y1="95" x2="100" y2="115" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />,
    // 4: Right Arm
    <line key="right-arm" x1="130" y1="95" x2="160" y2="115" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />,
    // 5: Left Leg
    <line key="left-leg" x1="130" y1="130" x2="110" y2="165" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />,
    // 6: Right Leg
    <line key="right-leg" x1="130" y1="130" x2="150" y2="165" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />,
  ];

  return (
    <div className="flex justify-center items-center w-full h-48 mb-6">
      <svg width="200" height="200" viewBox="0 0 200 200">
        {elements.slice(0, 1)}
        {mistakes >= 1 && elements[1]}
        {mistakes >= 2 && elements[2]}
        {mistakes >= 3 && elements[3]}
        {mistakes >= 4 && elements[4]}
        {mistakes >= 5 && elements[5]}
        {mistakes >= 6 && elements[6]}
        
        {/* Sad face on last mistake */}
        {mistakes >= 6 && (
          <g>
            <circle cx="123" cy="55" r="2" fill="#000" />
            <circle cx="137" cy="55" r="2" fill="#000" />
            <path d="M125 70 Q130 65 135 70" stroke="#000" strokeWidth="1" fill="none" />
          </g>
        )}
      </svg>
    </div>
  );
};

export default HangmanVisual;
