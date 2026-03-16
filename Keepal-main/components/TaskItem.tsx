
import React, { useState } from 'react';
import { Task, TaskPriority, TaskUrgency } from '../types';
import { Play, Check, Trash2, Clock, AlertCircle, Pencil, Calendar, ChevronDown, ChevronUp, Sparkles, CornerDownRight, X, Bell } from 'lucide-react';
import GlassCard from './GlassCard';
import { formatDeadline } from '../utils';

interface TaskItemProps {
  task: Task;
  onStart: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onSplit: (task: Task, feedback?: string) => void;
  isActive: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onStart, onEdit, onDelete, onSplit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [resplitFeedback, setResplitFeedback] = useState('');
  const [showResplitInput, setShowResplitInput] = useState(false);

  const handleResplit = () => {
    if (resplitFeedback.trim()) {
        onSplit(task, resplitFeedback);
        setShowResplitInput(false);
        setResplitFeedback('');
    }
  };

  return (
    <GlassCard className={`flex flex-col group transition-all duration-300 hover:bg-white/10 overflow-hidden`}>
      <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex-1 min-w-0 mr-4">
            <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-medium text-lg truncate ${task.completed ? 'line-through text-white/40' : 'text-white'}`}>
                {task.title}
            </h3>
            {task.priority === TaskPriority.High && (
                <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]" title="高优先级"></span>
            )}
            </div>
            <div className="flex items-center gap-3 text-xs text-white/50 flex-wrap">
            <span className="flex items-center gap-1">
                <Clock size={12} />
                {task.estimatedMinutes} 分钟
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                {task.tag || '无标签'}
            </span>
            {task.urgency === TaskUrgency.Urgent && (
                <span className="text-amber-400 flex items-center gap-1">
                    <AlertCircle size={12}/> 紧急
                </span>
            )}
            {task.deadline && (
                <span className="flex items-center gap-1 text-indigo-300" title="截止时间">
                    <Calendar size={12} />
                    {formatDeadline(task.deadline)}
                </span>
            )}
            {task.reminderTime && (
                <span className="flex items-center gap-1 text-emerald-300" title="提醒时间">
                    <Bell size={12} />
                    {formatDeadline(task.reminderTime)}
                </span>
            )}
             {task.subtasks && task.subtasks.length > 0 && (
                <span className="flex items-center gap-1 text-indigo-300/80 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                     {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} 子任务
                </span>
            )}
            </div>
        </div>

        <div className="flex items-center gap-3">
             <button
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                className="p-2 rounded-lg hover:bg-white/10 text-white/30 transition-colors"
             >
                 {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
             </button>

             <button
                onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                className="p-2 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors text-white/30"
                title="删除"
                >
                <Trash2 size={18} />
                </button>

                {!task.completed && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                        className="p-2 rounded-lg hover:bg-blue-500/20 hover:text-blue-400 transition-colors text-white/30"
                        title="编辑"
                    >
                        <Pencil size={18} />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); onStart(task); }}
                        className="p-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] transition-all active:scale-95 ml-2"
                        title="开始专注"
                    >
                        <Play size={24} fill="currentColor" />
                    </button>
                </>
                )}
                 {task.completed && (
                    <span className="text-emerald-400 flex items-center gap-1 text-sm font-medium px-3 py-1 bg-emerald-500/10 rounded-lg">
                        <Check size={16} /> 已完成
                    </span>
                    )}
        </div>
      </div>

      {isExpanded && !task.completed && (
          <div className="bg-black/20 border-t border-white/5 p-4 pl-8 animate-in slide-in-from-top-2 duration-200 cursor-default" onClick={e => e.stopPropagation()}>
              {(!task.subtasks || task.subtasks.length === 0) ? (
                  <div className="flex flex-col items-start gap-3">
                      <p className="text-sm text-white/40">该任务没有子步骤。</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onSplit(task); }}
                        className="flex items-center gap-2 text-xs px-3 py-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/30 transition-colors"
                      >
                          <Sparkles size={12} /> AI 自动拆分任务
                      </button>
                  </div>
              ) : (
                  <div className="space-y-3">
                      <div className="space-y-1">
                          {task.subtasks.map(step => (
                              <div key={step.id} className="flex items-center gap-3 text-sm text-white/70 py-1">
                                  <CornerDownRight size={14} className="text-white/20 shrink-0" />
                                  <div className={`w-4 h-4 rounded-full border border-white/20 flex items-center justify-center ${step.completed ? 'bg-indigo-500 border-indigo-500' : ''}`}>
                                      {step.completed && <Check size={10} className="text-white" />}
                                  </div>
                                  <span className={step.completed ? 'line-through text-white/30' : ''}>{step.title}</span>
                                  <span className="text-xs text-white/30 ml-auto">{step.estimatedMinutes}m</span>
                              </div>
                          ))}
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-white/5">
                          {!showResplitInput ? (
                             <button 
                                onClick={(e) => { e.stopPropagation(); setShowResplitInput(true); }}
                                className="flex items-center gap-2 text-xs text-white/40 hover:text-indigo-300 transition-colors"
                             >
                                <Sparkles size={12} /> AI 重新拆分 / 优化
                             </button>
                          ) : (
                              <div className="flex gap-2 items-center" onClick={e => e.stopPropagation()}>
                                  <input 
                                    type="text" 
                                    value={resplitFeedback}
                                    onChange={e => setResplitFeedback(e.target.value)}
                                    placeholder="输入优化建议 (例如: 更细致一点)..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                    onKeyDown={e => e.key === 'Enter' && handleResplit()}
                                    autoFocus
                                  />
                                  <button 
                                    onClick={handleResplit}
                                    className="px-3 py-1.5 bg-indigo-600 rounded-lg text-xs hover:bg-indigo-500"
                                  >
                                      确认
                                  </button>
                                  <button 
                                    onClick={() => setShowResplitInput(false)}
                                    className="px-2 py-1.5 hover:bg-white/10 rounded-lg text-white/40"
                                  >
                                      <X size={14} />
                                  </button>
                              </div>
                          )}
                      </div>
                  </div>
              )}
          </div>
      )}
    </GlassCard>
  );
};

export default TaskItem;
