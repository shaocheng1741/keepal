
import { useState, useEffect, useRef } from 'react';
import { TimerState, Task } from '../types';
import { DEFAULT_WORK_MINUTES } from '../constants';

export function useTimerSystem(
  onComplete: () => void
) {
  const [timerState, setTimerState] = useState<TimerState>(TimerState.Idle);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_WORK_MINUTES * 60);
  const [totalTime, setTotalTime] = useState(DEFAULT_WORK_MINUTES * 60);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [startTimeRef, setStartTimeRef] = useState<number | null>(null);
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Enable countdown for both Running and Break states
    if ((timerState === TimerState.Running || timerState === TimerState.Break) && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerState, timeLeft, onComplete]);

  const startTask = (task: Task) => {
    setActiveTaskId(task.id);
    const durationSeconds = task.estimatedMinutes * 60;
    setTotalTime(durationSeconds);
    setTimeLeft(durationSeconds);
    setTimerState(TimerState.Running);
    setStartTimeRef(Date.now());
  };

  const startBreak = (minutes: number) => {
    setActiveTaskId(null);
    const seconds = minutes * 60;
    setTotalTime(seconds);
    setTimeLeft(seconds);
    setTimerState(TimerState.Break); // Explicitly set to Break state
    setStartTimeRef(Date.now());
  };

  const reset = () => {
    setTimerState(TimerState.Idle);
    setActiveTaskId(null);
    setStartTimeRef(null);
  };

  return {
    timerState,
    setTimerState,
    timeLeft,
    setTimeLeft,
    totalTime,
    activeTaskId,
    startTimeRef,
    startTask,
    startBreak,
    reset
  };
}
