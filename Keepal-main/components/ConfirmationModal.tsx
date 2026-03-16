
import React from 'react';
import GlassCard from './GlassCard';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  isDangerous = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <GlassCard className="w-full max-w-sm p-8 bg-slate-900/90 border-white/10">
        <h3 className="text-xl font-bold mb-4 text-center">
            {title}
        </h3>
        <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-3 rounded-xl hover:bg-white/10">{cancelText}</button>
            <button 
                onClick={onConfirm} 
                className={`flex-1 py-3 rounded-xl text-white ${isDangerous ? 'bg-red-600 hover:bg-red-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}
            >
                {confirmText}
            </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default ConfirmationModal;
