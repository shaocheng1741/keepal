
import React, { useState, useEffect } from 'react';
import { Task, TaskPriority, TaskUrgency } from '../types';
import GlassCard from './GlassCard';
import { Bell, Bookmark, AlertTriangle } from 'lucide-react';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
    title: string;
    estimatedMinutes: number;
    priority: TaskPriority;
    urgency: TaskUrgency;
    deadline?: number;
    reminderTime?: number;
  }) => void;
  editingTask: Task | null;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, onClose, onSave, editingTask }) => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(25);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.Low);
  const [urgency, setUrgency] = useState<TaskUrgency>(TaskUrgency.NotUrgent);
  const [deadline, setDeadline] = useState('');
  const [reminder, setReminder] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDuration(editingTask.estimatedMinutes);
      setPriority(editingTask.priority);
      setUrgency(editingTask.urgency);
      
      if (editingTask.deadline) {
        const date = new Date(editingTask.deadline);
        const offset = date.getTimezoneOffset() * 60000;
        setDeadline((new Date(date.getTime() - offset)).toISOString().slice(0, 16));
      } else {
        setDeadline('');
      }

      if (editingTask.reminderTime) {
        const date = new Date(editingTask.reminderTime);
        const offset = date.getTimezoneOffset() * 60000;
        setReminder((new Date(date.getTime() - offset)).toISOString().slice(0, 16));
      } else {
        setReminder('');
      }
    } else {
      setTitle('');
      setDuration(25);
      setPriority(TaskPriority.Low);
      setUrgency(TaskUrgency.NotUrgent);
      setDeadline('');
      setReminder('');
    }
  }, [editingTask, isOpen]);

  const handleSave = () => {
    if (!title.trim()) return;
    
    let deadlineTimestamp: number | undefined = undefined;
    if (deadline) deadlineTimestamp = new Date(deadline).getTime();
    
    let reminderTimestamp: number | undefined = undefined;
    if (reminder) reminderTimestamp = new Date(reminder).getTime();

    onSave({
      title,
      estimatedMinutes: duration,
      priority,
      urgency,
      deadline: deadlineTimestamp,
      reminderTime: reminderTimestamp
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <GlassCard className="w-full max-w-md p-6 bg-slate-900/90 border-slate-700 shadow-2xl">
        <h3 className="text-xl font-bold mb-6">{editingTask ? '编辑任务' : '添加新任务'}</h3>
        <input 
            autoFocus 
            type="text" 
            placeholder="任务名称..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-lg mb-6 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all placeholder:text-white/20" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
        />
        
        <div className="flex gap-4 mb-6">
            <div className="flex-1">
                <label className="text-xs text-white/50 mb-2 block uppercase tracking-wider">截止时间 (Dead Line)</label>
                <input 
                    type="datetime-local" 
                    value={deadline} 
                    onChange={(e) => setDeadline(e.target.value)} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 [color-scheme:dark]" 
                />
            </div>
            <div className="flex-1">
                <label className="text-xs text-indigo-300 mb-2 block uppercase tracking-wider flex items-center gap-1"><Bell size={10} /> 提醒时间 (通知)</label>
                <input 
                    type="datetime-local" 
                    value={reminder} 
                    onChange={(e) => setReminder(e.target.value)} 
                    className="w-full bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 [color-scheme:dark]" 
                />
            </div>
        </div>

        <div className="mb-6">
            <label className="text-xs text-white/50 mb-2 block uppercase tracking-wider">预计时长: {duration}m</label>
            <input 
                type="range" min="5" max="120" step="5" 
                value={duration} 
                onChange={e => setDuration(parseInt(e.target.value))} 
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer" 
            />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Priority */}
            <div className="flex flex-col gap-2">
                 <span className="text-xs text-white/50 uppercase tracking-wider flex items-center gap-1">
                    <Bookmark size={12} /> 重要程度
                 </span>
                 <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
                    <button 
                        onClick={() => setPriority(TaskPriority.High)}
                        className={`flex-1 py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-1 font-medium ${priority === TaskPriority.High ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'text-white/40 hover:bg-white/5'}`}
                    >
                        重要
                    </button>
                    <button 
                        onClick={() => setPriority(TaskPriority.Low)}
                        className={`flex-1 py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-1 font-medium ${priority === TaskPriority.Low ? 'bg-white/20 text-white' : 'text-white/40 hover:bg-white/5'}`}
                    >
                        普通
                    </button>
                 </div>
            </div>

            {/* Urgency */}
            <div className="flex flex-col gap-2">
                 <span className="text-xs text-white/50 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle size={12} /> 紧急程度
                 </span>
                 <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
                    <button 
                        onClick={() => setUrgency(TaskUrgency.Urgent)}
                        className={`flex-1 py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-1 font-medium ${urgency === TaskUrgency.Urgent ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'text-white/40 hover:bg-white/5'}`}
                    >
                        紧急
                    </button>
                    <button 
                        onClick={() => setUrgency(TaskUrgency.NotUrgent)}
                        className={`flex-1 py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-1 font-medium ${urgency === TaskUrgency.NotUrgent ? 'bg-white/20 text-white' : 'text-white/40 hover:bg-white/5'}`}
                    >
                        不急
                    </button>
                 </div>
            </div>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-3 rounded-xl hover:bg-white/10 text-white/60">取消</button>
          <button onClick={handleSave} className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg">{editingTask ? '保存' : '添加'}</button>
        </div>
      </GlassCard>
    </div>
  );
};

export default TaskFormModal;
