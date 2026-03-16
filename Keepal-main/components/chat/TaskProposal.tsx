
import React from 'react';
import GlassCard from '../GlassCard';
import { Calendar, Bell, X, Plus, Tag } from 'lucide-react';
import { formatDeadline } from '../../utils';

interface TaskProposalProps {
  tasks: any[];
  onAccept: (task: any) => void;
  onReject: (title: string) => void;
}

const TaskProposal: React.FC<TaskProposalProps> = ({ tasks, onAccept, onReject }) => {
  return (
    <div className="space-y-2 mt-2">
        {tasks.map((task: any, idx: number) => {
            const hasDeadline = task.deadline && !isNaN(Date.parse(task.deadline));
            const hasReminder = task.reminderTime && !isNaN(Date.parse(task.reminderTime));
            return (
                <GlassCard key={idx} className="p-3 bg-white/5 border-indigo-500/30">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col">
                            <span className="font-medium text-sm text-white/90">{task.title}</span>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                    task.urgency === 'Urgent' ? 'border-amber-500 text-amber-400' : 'border-white/10 text-white/30'
                                }`}>{task.urgency === 'Urgent' ? '紧急' : '不急'}</span>
                                {task.tag && (
                                    <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/50">
                                        <Tag size={8} /> {task.tag}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-white/50 flex-wrap gap-y-2">
                        <div className="w-full flex items-center gap-3">
                            <span>⏱️ {task.estimatedMinutes}m</span>
                            <span>{task.priority === 'High' ? '🔥 重要' : '☕ 普通'}</span>
                        </div>

                        <div className="w-full flex flex-col gap-1">
                            {hasDeadline && (
                            <span className="flex items-center gap-1 text-indigo-300">
                                <Calendar size={10} />
                                <span className="truncate">截止: {formatDeadline(Date.parse(task.deadline))}</span>
                            </span>
                            )}
                            {hasReminder && (
                            <span className="flex items-center gap-1 text-emerald-300" title="提醒时间">
                                <Bell size={10} />
                                <span className="truncate">提醒: {formatDeadline(Date.parse(task.reminderTime))}</span>
                            </span>
                            )}
                        </div>

                        <div className="flex gap-2 ml-auto mt-1 w-full justify-end">
                            <button 
                                onClick={() => onReject(task.title)}
                                className="flex-1 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded transition-colors flex items-center justify-center gap-1"
                                title="忽略"
                            >
                                <X size={12} /> 忽略
                            </button>
                            <button 
                                onClick={() => onAccept(task)}
                                className="flex-1 py-1.5 bg-indigo-500/20 hover:bg-indigo-500 text-indigo-200 hover:text-white rounded transition-colors flex items-center justify-center gap-1 font-medium"
                                title="添加"
                            >
                                <Plus size={12} /> 添加
                            </button>
                        </div>
                    </div>
                </GlassCard>
            );
        })}
    </div>
  );
};

export default TaskProposal;
