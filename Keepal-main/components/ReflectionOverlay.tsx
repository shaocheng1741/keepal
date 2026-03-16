
import React from 'react';
import { Lock, BrainCircuit } from 'lucide-react';

interface ReflectionOverlayProps {
  isReflecting: boolean;
  isFinished: boolean;
  remainingSeconds: number;
  onComplete: () => void;
}

const ReflectionOverlay: React.FC<ReflectionOverlayProps> = ({ 
  isReflecting, 
  isFinished, 
  remainingSeconds, 
  onComplete 
}) => {
  if (isReflecting) {
    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-1000">
            <Lock size={64} className="text-red-500 mb-6 animate-pulse" />
            <h2 className="text-4xl font-bold mb-4 tracking-tighter text-red-500">反省模式</h2>
            <p className="text-white/50 max-w-md mb-8 leading-relaxed">
                你的信任值已降为 0。AI 拒绝为你服务。<br/>
                请利用这段时间反思你的专注习惯。
            </p>
            <div className="text-6xl font-mono font-bold text-white mb-8">
                {Math.max(0, remainingSeconds)}s
            </div>
        </div>
    );
  }

  if (isFinished) {
    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-8 text-center">
            <BrainCircuit size={64} className="text-emerald-500 mb-6" />
            <h2 className="text-3xl font-bold mb-4">反省结束</h2>
            <button 
                onClick={onComplete} 
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-emerald-500/30"
            >
                我准备好了
            </button>
        </div>
    );
  }

  return null;
};

export default ReflectionOverlay;
