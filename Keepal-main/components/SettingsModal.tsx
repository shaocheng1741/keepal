
import React from 'react';
import GlassCard from './GlassCard';
import { XCircle, Settings, Bell } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  breakDuration: number;
  setBreakDuration: (val: number) => void;
  notificationPermission: NotificationPermission;
  onRequestPermission: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  breakDuration,
  setBreakDuration,
  notificationPermission,
  onRequestPermission
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <GlassCard className="w-full max-w-sm p-6 bg-slate-900/90 border-slate-700 relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/40"><XCircle size={24} /></button>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Settings size={24} />设置</h3>
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-center mb-2"><label>休息时长</label><span className="text-indigo-400 font-bold">{breakDuration}m</span></div>
                    <input type="range" min="0" max="10" step="1" value={breakDuration} onChange={(e) => setBreakDuration(parseInt(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                </div>
                
                <div className="pt-4 border-t border-white/10">
                    <label className="text-xs uppercase text-white/50 mb-2 block">系统权限</label>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm"><Bell size={16} /> 桌面通知</span>
                        {notificationPermission === 'granted' ? (
                            <span className="text-emerald-400 text-xs bg-emerald-500/10 px-2 py-1 rounded">已开启</span>
                        ) : (
                            <button 
                                onClick={onRequestPermission}
                                className="text-xs bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded transition-colors"
                            >
                                开启通知
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </GlassCard>
    </div>
  );
};

export default SettingsModal;
