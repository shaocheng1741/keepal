
import React from 'react';
import { TimerState, Subtask } from '../types';
import { Play, Pause, X, CheckCircle, ListTodo, SkipForward } from 'lucide-react';
import { formatTime } from '../utils';

interface TimerProps {
  timeLeft: number;
  totalTime: number;
  timerState: TimerState;
  taskTitle: string;
  subtasks?: Subtask[];
  onStart: () => void;
  onPause: () => void;
  onFinishEarly: () => void;
  onGiveUp: () => void;
  onSkipBreak: () => void; // New prop
  onToggleSubtask: (subtaskId: string) => void;
}

const Timer: React.FC<TimerProps> = ({
  timeLeft,
  totalTime,
  timerState,
  taskTitle,
  subtasks,
  onStart,
  onPause,
  onFinishEarly,
  onGiveUp,
  onSkipBreak,
  onToggleSubtask
}) => {
  const percentage = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;
  const radius = 120;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Calculate subtask progress
  const completedSubtasks = subtasks ? subtasks.filter(s => s.completed).length : 0;
  const totalSubtasks = subtasks ? subtasks.length : 0;
  const progressPercent = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const isBreak = timerState === TimerState.Break;

  return (
    <div className="flex flex-col items-center justify-center p-8 relative w-full">
      {/* Circle Progress */}
      <div className="relative mb-6">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="rotate-[-90deg] transition-all duration-500"
        >
          <circle
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={stroke}
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={isBreak ? "#10b981" : "white"}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className={`text-6xl font-bold font-mono tracking-tighter drop-shadow-lg ${isBreak ? 'text-emerald-400' : 'text-white'}`}>
            {formatTime(timeLeft)}
          </div>
          <div className="text-white/60 mt-2 text-sm uppercase tracking-widest">
            {timerState === TimerState.Running ? '专注中' : 
             timerState === TimerState.Paused ? '已暂停' :
             timerState === TimerState.Break ? '休息中' : '准备开始'}
          </div>
        </div>
      </div>

      <div className="mb-4 text-xl font-medium text-white/90 text-center max-w-md truncate px-4">
        {taskTitle || "自由专注模式"}
      </div>

      {/* Subtasks View (Hide during break) */}
      {!isBreak && subtasks && subtasks.length > 0 && (
        <div className="w-full max-w-xs bg-white/5 rounded-xl p-3 mb-6 border border-white/5 max-h-32 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between text-xs text-white/50 mb-2 uppercase tracking-wider">
                <span className="flex items-center gap-1"><ListTodo size={12} /> 执行步骤</span>
                <span>{completedSubtasks}/{totalSubtasks}</span>
            </div>
            {/* Tiny Progress Bar */}
            <div className="w-full h-1 bg-white/10 rounded-full mb-3 overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
            </div>

            <div className="space-y-2">
                {subtasks.map((step) => (
                    <div 
                        key={step.id} 
                        className={`flex items-center gap-2 text-sm p-2 rounded-lg transition-colors cursor-pointer hover:bg-white/10 ${step.completed ? 'text-white/30 line-through' : 'text-white/90'}`}
                        onClick={() => onToggleSubtask(step.id)}
                    >
                         <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${step.completed ? 'bg-indigo-500 border-indigo-500' : 'border-white/30'}`}>
                             {step.completed && <CheckCircle size={10} className="text-white" />}
                         </div>
                         <span className="flex-1 truncate">{step.title}</span>
                         <span className="text-xs text-white/30">{step.estimatedMinutes}m</span>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-6 mt-auto">
        {isBreak ? (
          // Break Mode: Only Show Skip Button
          <button
             onClick={onSkipBreak}
             title="跳过休息"
             className="p-4 rounded-full bg-white text-emerald-600 hover:bg-emerald-50 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
           >
             <SkipForward size={32} fill="currentColor" />
           </button>
        ) : (
          // Focus Mode Controls
          <>
            {timerState === TimerState.Running ? (
              <button
                onClick={onPause}
                className="p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 transition-all active:scale-95"
              >
                <Pause size={32} />
              </button>
            ) : (
              <button
                onClick={onStart}
                className="p-4 rounded-full bg-white text-black hover:bg-gray-200 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                <Play size={32} fill="currentColor" />
              </button>
            )}

            {(timerState === TimerState.Running || timerState === TimerState.Paused) && (
              <>
                <button
                  onClick={onFinishEarly}
                  title="完成任务"
                  className="p-4 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-400 transition-all active:scale-95"
                >
                  <CheckCircle size={24} />
                </button>
                <button
                  onClick={onGiveUp}
                  title="放弃"
                  className="p-4 rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 transition-all active:scale-95"
                >
                  <X size={24} />
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Timer;
