
import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { GameState, Question, Difficulty, DifficultyConfig } from './types';
import { audioManager } from './utils/audio';
import HangmanVisual from './components/HangmanVisual';
import NumberPad from './components/NumberPad';
import { Star, Heart, Trophy, RefreshCcw, Play, Zap, Smile, Flame, Volume2, VolumeX, Sparkles, Clock } from 'lucide-react';

const MAX_MISTAKES = 6;
const MILESTONE_STEP = 50;

const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultyConfig> = {
  EASY: { maxNumber: 5, timer: 15 },
  MEDIUM: { maxNumber: 8, timer: 10 },
  HARD: { maxNumber: 10, timer: 7 },
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('START');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(10);
  const [isMusicEnabled, setIsMusicEnabled] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const timerRef = useRef<number | null>(null);

  const toggleMusic = () => {
    const newState = !isMusicEnabled;
    setIsMusicEnabled(newState);
    audioManager.toggleBackgroundMusic(newState);
    audioManager.playClick();
  };

  const fireEnhancedConfetti = useCallback((intensity: 'normal' | 'mega') => {
    const count = intensity === 'mega' ? 150 : 80;
    const colors = ['#FF007A', '#7000FF', '#00D1FF', '#FFD600', '#00FF94'];
    
    const defaults = {
      origin: { y: 0.7 },
      spread: intensity === 'mega' ? 120 : 70,
      ticks: intensity === 'mega' ? 400 : 200,
      gravity: 1.2,
      scalar: intensity === 'mega' ? 1.4 : 1,
      shapes: ['circle', 'square'] as confetti.Shape[],
      colors: colors
    };

    if (intensity === 'mega') {
      // 1. Center Blast
      confetti({
        ...defaults,
        particleCount: count,
        shapes: ['circle', 'square', 'star'] as any,
      });

      // 2. Left Cannon
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: colors,
        shapes: ['star'] as any,
      });

      // 3. Right Cannon
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: colors,
        shapes: ['star'] as any,
      });
    } else {
      confetti({
        ...defaults,
        particleCount: count,
      });
    }
  }, []);

  const generateQuestion = useCallback((selectedDifficulty: Difficulty) => {
    const config = DIFFICULTY_SETTINGS[selectedDifficulty];
    const factor1 = Math.floor(Math.random() * config.maxNumber) + 1;
    const factor2 = Math.floor(Math.random() * config.maxNumber) + 1;
    const isBonus = factor1 >= 7 && factor2 >= 7;

    setCurrentQuestion({
      factor1,
      factor2,
      answer: factor1 * factor2,
      isBonus
    });
    setUserInput('');
    setTimeLeft(config.timer);
  }, []);

  const startGame = useCallback((selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setScore(0);
    setMistakes(0);
    setGameState('PLAYING');
    generateQuestion(selectedDifficulty);
    audioManager.playClick();
    if (!isMusicEnabled) {
      setIsMusicEnabled(true);
      audioManager.toggleBackgroundMusic(true);
    }
  }, [generateQuestion, isMusicEnabled]);

  const handleCorrect = useCallback(() => {
    audioManager.playSuccess();
    
    const nextScore = score + 10;
    const isMilestone = nextScore > 0 && nextScore % MILESTONE_STEP === 0;
    const wasBonus = currentQuestion?.isBonus;

    if (isMilestone) {
      fireEnhancedConfetti('mega');
      setShowMilestone(true);
      setTimeout(() => setShowMilestone(false), 2500);
    } else if (wasBonus) {
      fireEnhancedConfetti('normal');
    }

    setScore(nextScore);
    generateQuestion(difficulty);
  }, [generateQuestion, difficulty, score, currentQuestion, fireEnhancedConfetti]);

  const handleIncorrect = useCallback(() => {
    audioManager.playFail();
    setMistakes(prev => {
      const newMistakes = prev + 1;
      if (newMistakes >= MAX_MISTAKES) {
        setGameState('GAMEOVER');
      } else {
        generateQuestion(difficulty);
      }
      return newMistakes;
    });
  }, [generateQuestion, difficulty]);

  const checkAnswer = useCallback(() => {
    if (!currentQuestion) return;
    const isCorrect = parseInt(userInput) === currentQuestion.answer;
    if (isCorrect) {
      handleCorrect();
    } else {
      handleIncorrect();
    }
  }, [userInput, currentQuestion, handleCorrect, handleIncorrect]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      const config = DIFFICULTY_SETTINGS[difficulty];
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          const next = prev - 1;
          
          if (next <= 4 && next > 0) {
            audioManager.playCountdownBeep(next === 1);
          }

          if (prev <= 1) {
            handleIncorrect();
            return config.timer;
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) window.clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [gameState, currentQuestion, handleIncorrect, difficulty]);

  const handleNumberInput = (num: string) => {
    if (userInput.length < 3) {
      setUserInput(prev => prev + num);
    }
  };

  const getTimeBarColor = () => {
    const total = DIFFICULTY_SETTINGS[difficulty].timer;
    const percentage = (timeLeft / total) * 100;
    if (percentage < 30) return 'bg-rose-500 animate-pulse';
    if (percentage < 60) return 'bg-amber-400';
    return 'bg-emerald-400';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Milestone Text Overlay */}
      {showMilestone && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none animate-milestone">
          <div className="text-center">
            <h2 className="text-6xl md:text-8xl font-game text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-pink-500 to-purple-600 drop-shadow-lg">
              ¡SÚPER RACHA!
            </h2>
            <div className="flex justify-center gap-4 mt-4">
              <Star className="text-yellow-400 w-12 h-12 fill-current animate-spin" />
              <Star className="text-yellow-400 w-12 h-12 fill-current animate-spin" style={{animationDelay: '0.2s'}} />
              <Star className="text-yellow-400 w-12 h-12 fill-current animate-spin" style={{animationDelay: '0.4s'}} />
            </div>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="w-full max-w-md flex justify-between items-center mb-6 bg-white/80 backdrop-blur-sm p-4 rounded-3xl shadow-sm border border-white">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Trophy className="text-yellow-500 w-5 h-5" />
            <span className="font-game text-xl text-purple-700">{score}</span>
          </div>
          <button 
            onClick={toggleMusic}
            className={`p-2 rounded-full transition-all hover:scale-110 active:scale-95 ${isMusicEnabled ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}
          >
            {isMusicEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
        <div className="flex items-center gap-2">
          {Array.from({ length: MAX_MISTAKES }).map((_, i) => (
            <Heart 
              key={i} 
              className={`w-5 h-5 transition-all duration-300 ${i < MAX_MISTAKES - mistakes ? 'fill-rose-500 text-rose-500 scale-100' : 'text-gray-300 scale-75'}`} 
            />
          ))}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl overflow-hidden relative border-4 border-purple-50">
        
        {/* TOP EDGE TIMER BAR */}
        {gameState === 'PLAYING' && (
          <div className="absolute top-0 left-0 w-full h-3 bg-gray-100/50 z-20">
            <div 
              className={`h-full transition-all duration-1000 ease-linear ${getTimeBarColor()}`}
              style={{ width: `${(timeLeft / DIFFICULTY_SETTINGS[difficulty].timer) * 100}%` }}
            />
          </div>
        )}

        <div className="p-8 pt-10">
          {/* Bonus Indicator */}
          {gameState === 'PLAYING' && currentQuestion?.isBonus && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 animate-bounce z-10">
              <div className="bg-yellow-400 text-white px-4 py-1 rounded-full font-game text-sm flex items-center gap-1 shadow-md border-2 border-white">
                <Sparkles size={14} /> ¡BONUS DIFÍCIL!
              </div>
            </div>
          )}

          {gameState === 'START' && (
            <div className="text-center space-y-6 py-4">
              <div className="flex justify-center mb-2">
                <div className="bg-pink-100 p-4 rounded-full">
                  <Sparkles className="w-12 h-12 text-pink-500 animate-pulse" />
                </div>
              </div>
              <h1 className="text-4xl font-game text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-2">
                Multiplicaciones Mágicas
              </h1>
              <p className="text-gray-600 text-lg mb-4 font-medium">¡Elige tu nivel de aventura!</p>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => startGame('EASY')}
                  className="group flex items-center justify-between px-6 py-4 bg-green-50 rounded-2xl border-2 border-green-200 hover:border-green-400 hover:bg-green-100 transition-all text-left shadow-sm hover:shadow-md"
                >
                  <div>
                    <div className="font-game text-xl text-green-600 flex items-center gap-2">
                      <Smile className="w-6 h-6" /> FÁCIL
                    </div>
                    <div className="text-green-700/60 text-sm font-bold uppercase tracking-wider">Tablas 1-5 • 15 Seg</div>
                  </div>
                  <Play className="text-green-400 group-hover:scale-125 transition-transform fill-current" />
                </button>

                <button 
                  onClick={() => startGame('MEDIUM')}
                  className="group flex items-center justify-between px-6 py-4 bg-orange-50 rounded-2xl border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-100 transition-all text-left shadow-sm hover:shadow-md"
                >
                  <div>
                    <div className="font-game text-xl text-orange-600 flex items-center gap-2">
                      <Zap className="w-6 h-6" /> NORMAL
                    </div>
                    <div className="text-orange-700/60 text-sm font-bold uppercase tracking-wider">Tablas 1-8 • 10 Seg</div>
                  </div>
                  <Play className="text-orange-400 group-hover:scale-125 transition-transform fill-current" />
                </button>

                <button 
                  onClick={() => startGame('HARD')}
                  className="group flex items-center justify-between px-6 py-4 bg-red-50 rounded-2xl border-2 border-red-200 hover:border-red-400 hover:bg-red-100 transition-all text-left shadow-sm hover:shadow-md"
                >
                  <div>
                    <div className="font-game text-xl text-red-600 flex items-center gap-2">
                      <Flame className="w-6 h-6" /> DIFÍCIL
                    </div>
                    <div className="text-red-700/60 text-sm font-bold uppercase tracking-wider">Tablas 1-10 • 7 Seg</div>
                  </div>
                  <Play className="text-red-400 group-hover:scale-125 transition-transform fill-current" />
                </button>
              </div>
            </div>
          )}

          {gameState === 'PLAYING' && currentQuestion && (
            <div className="flex flex-col items-center">
              {/* Numeric Countdown Indicator */}
              <div className={`flex items-center gap-2 px-4 py-1 rounded-full font-game mb-4 transition-colors ${timeLeft < 4 ? 'bg-rose-100 text-rose-600 animate-bounce' : 'bg-gray-100 text-gray-500'}`}>
                <Clock size={18} />
                <span className="text-xl">{timeLeft}s</span>
              </div>

              <HangmanVisual mistakes={mistakes} />

              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-4 text-5xl md:text-6xl font-game text-purple-600 mb-4">
                  <span>{currentQuestion.factor1}</span>
                  <span className="text-pink-400">×</span>
                  <span>{currentQuestion.factor2}</span>
                  <span className="text-pink-400">=</span>
                  <div className="min-w-[80px] h-16 border-b-4 border-purple-200 flex items-center justify-center text-rose-500 drop-shadow-sm">
                    {userInput || <span className="text-gray-200">?</span>}
                  </div>
                </div>
              </div>

              <NumberPad 
                onNumberClick={handleNumberInput}
                onClear={() => setUserInput('')}
                onSubmit={checkAnswer}
              />
            </div>
          )}

          {gameState === 'GAMEOVER' && (
            <div className="text-center space-y-6 py-10">
              <div className="bg-red-50 p-6 rounded-full inline-block mb-4 shadow-inner">
                <RefreshCcw className="w-16 h-16 text-red-400 animate-spin-slow" />
              </div>
              <h2 className="text-4xl font-game text-red-600">¡Fin del juego!</h2>
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                <p className="text-gray-600 text-xl font-medium">Puntos logrados:</p>
                <p className="text-5xl font-game text-purple-600 mt-1">{score}</p>
              </div>
              <button 
                onClick={() => setGameState('START')}
                className="bg-purple-600 text-white font-game text-2xl px-10 py-4 rounded-full shadow-lg hover:bg-purple-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 mx-auto w-full"
              >
                <RefreshCcw /> VOLVER A EMPEZAR
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Stars */}
      <div className="fixed bottom-10 left-10 text-yellow-400 animate-bounce hidden md:block opacity-50">
        <Star size={48} fill="currentColor" />
      </div>
      <div className="fixed top-10 right-10 text-pink-400 animate-pulse hidden md:block opacity-50">
        <Heart size={48} fill="currentColor" />
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes milestone {
          0% { transform: scale(0.5); opacity: 0; }
          20% { transform: scale(1.1); opacity: 1; }
          80% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
        .animate-milestone {
          animation: milestone 2.5s ease-out forwards;
        }
        body {
          background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
};

export default App;
