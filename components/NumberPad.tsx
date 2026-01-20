
import React from 'react';
import { audioManager } from '../utils/audio';

interface NumberPadProps {
  onNumberClick: (num: string) => void;
  onClear: () => void;
  onSubmit: () => void;
}

const NumberPad: React.FC<NumberPadProps> = ({ onNumberClick, onClear, onSubmit }) => {
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'];

  const handleClick = (val: string) => {
    if (val === 'C') {
      audioManager.playClear();
      onClear();
    } else if (val === '✓') {
      audioManager.playSubmit();
      onSubmit();
    } else {
      audioManager.playClick();
      onNumberClick(val);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
      {numbers.map((val) => (
        <button
          key={val}
          onClick={() => handleClick(val)}
          className={`
            h-16 w-16 md:h-20 md:w-20 rounded-2xl font-game text-2xl shadow-lg 
            transform transition-all duration-75 
            active:scale-90 active:shadow-inner
            ${
              val === 'C' 
                ? 'bg-orange-400 text-white hover:bg-orange-500 active:bg-orange-600' 
                : val === '✓' 
                  ? 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700 animate-pulse-slow' 
                  : 'bg-white text-purple-600 hover:bg-purple-50 active:bg-purple-100'
            }
          `}
        >
          {val}
        </button>
      ))}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NumberPad;
