
import React from 'react';
import { Task, TaskPriority, TaskUrgency } from '../types';
import GlassCard from './GlassCard';
import { Play, Pencil, Clock } from 'lucide-react';

interface TaskMatrixProps {
  tasks: Task[];
  onStart: (task: Task) => void;
  onEdit: (task: Task) => void;
}

const Quadrant: React.FC<{
  title: string;
  tasks: Task[];
  colorClass: string;
  icon?: React.ReactNode;
  onStart: (task: Task) => void;
  onEdit: (task: Task) => void;
}> = ({ title, tasks, colorClass, onStart, onEdit }) => (
  <div className={`relative flex flex-col h-full rounded-2xl border backdrop-blur-sm transition-all duration-300 overflow-hidden ${colorClass}`}>
    <div className="p-3 border-b border-white/5 flex justify-between items-center bg-black/10">
      <h3 className="font-bold text-sm text-white/90">{title}</h3>
      <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/60">{tasks.length}</span>
    </div>
    <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
      {tasks.length === 0 && (
          <div className="h-full flex items-center justify-center text-white/20 text-xs italic">
              空空如也
          </div>
      )}
      {tasks.map(task => (
        <div 
            key={task.id}
            onClick={() => onEdit(task)}
            className="group relative bg-white/10 hover:bg-white/20 border border-white/5 hover:border-white/20 p-3 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-lg flex flex-col gap-2"
        >
            <div className="flex justify-between items-start">
                <span className="text-sm font-medium line-clamp-2 text-white/90 leading-tight">{task.title}</span>
            </div>
            
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                 <div className="flex items-center gap-1 text-[10px] text-white/50">
                    <Clock size={10} />
                    <span>{task.estimatedMinutes}m</span>
                 </div>
                 <button 
                    onClick={(e) => { e.stopPropagation(); onStart(task); }}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/30 text-white/70 hover:text-white transition-colors"
                 >
                    <Play size={12} fill="currentColor" />
                 </button>
            </div>
        </div>
      ))}
    </div>
  </div>
);

const TaskMatrix: React.FC<TaskMatrixProps> = ({ tasks, onStart, onEdit }) => {
  const incompleteTasks = tasks.filter(t => !t.completed);

  const q1 = incompleteTasks.filter(t => t.priority === TaskPriority.High && t.urgency === TaskUrgency.Urgent);
  const q2 = incompleteTasks.filter(t => t.priority === TaskPriority.High && t.urgency === TaskUrgency.NotUrgent);
  const q3 = incompleteTasks.filter(t => t.priority === TaskPriority.Low && t.urgency === TaskUrgency.Urgent);
  const q4 = incompleteTasks.filter(t => t.priority === TaskPriority.Low && t.urgency === TaskUrgency.NotUrgent);

  return (
    <div className="h-full w-full relative p-1 flex flex-col">
      {/* Axis Labels Background */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-10">
          <div className="w-[1px] h-full bg-white absolute left-1/2"></div>
          <div className="h-[1px] w-full bg-white absolute top-1/2"></div>
      </div>

      <div className="grid grid-cols-2 grid-rows-2 gap-2 md:gap-4 h-full">
        {/* Q1: Important & Urgent (Red) */}
        <Quadrant 
            title="重要且紧急" 
            tasks={q1} 
            colorClass="bg-red-500/10 border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.05)_inset]"
            onStart={onStart}
            onEdit={onEdit}
        />

        {/* Q2: Important & Not Urgent (Green) */}
        <Quadrant 
            title="重要不紧急" 
            tasks={q2} 
            colorClass="bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)_inset]"
            onStart={onStart}
            onEdit={onEdit}
        />

        {/* Q3: Urgent & Not Important (Yellow/Amber) */}
        <Quadrant 
            title="紧急不重要" 
            tasks={q3} 
            colorClass="bg-amber-500/10 border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.05)_inset]"
            onStart={onStart}
            onEdit={onEdit}
        />

        {/* Q4: Not Urgent & Not Important (Gray/Slate) */}
        <Quadrant 
            title="不重要不紧急" 
            tasks={q4} 
            colorClass="bg-slate-500/10 border-slate-500/20 shadow-[0_0_30px_rgba(100,116,139,0.05)_inset]"
            onStart={onStart}
            onEdit={onEdit}
        />
      </div>
      
      {/* Central Badge */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center shadow-xl z-10 pointer-events-none">
          <div className="w-2 h-2 bg-white rounded-full"></div>
      </div>
    </div>
  );
};

export default TaskMatrix;
