
import React from 'react';
import GlassCard from './GlassCard';
import Timer from './Timer';
import { TimerState, Subtask } from '../types';

interface FocusOverlayProps {
  isActive: boolean;
  timeLeft: number;
  totalTime: number;
  timerState: TimerState;
  activeTaskTitle: string;
  subtasks?: Subtask[];
  onStart: () => void;
  onPause: () => void;
  onFinishEarly: () => void;
  onGiveUp: () => void;
  onSkipBreak: () => void;
  onToggleSubtask: (id: string) => void;
}

const FocusOverlay: React.FC<FocusOverlayProps> = ({
  isActive,
  timeLeft,
  totalTime,
  timerState,
  activeTaskTitle,
  subtasks,
  onStart,
  onPause,
  onFinishEarly,
  onGiveUp,
  onSkipBreak,
  onToggleSubtask
}) => {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm transition-all duration-500">
        <div className="w-full max-w-lg">
        <GlassCard className="aspect-square flex flex-col items-center justify-center shadow-2xl border-white/20">
            <Timer 
                timeLeft={timeLeft} 
                totalTime={totalTime} 
                timerState={timerState} 
                taskTitle={activeTaskTitle} 
                subtasks={subtasks}
                onStart={onStart} 
                onPause={onPause} 
                onFinishEarly={onFinishEarly} 
                onGiveUp={onGiveUp}
                onSkipBreak={onSkipBreak}
                onToggleSubtask={onToggleSubtask}
            />
        </GlassCard>
        {!activeTaskTitle && timerState !== TimerState.Break && (
            <div className="text-center mt-6 text-white/50 animate-pulse">
                休息结束后自动返回主页...
            </div>
        )}
        </div>
    </div>
  );
};

export default FocusOverlay;
