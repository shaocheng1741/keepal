
import React from 'react';
import { Task, PomodoroRecord } from '../types';
import Statistics from './Statistics';
import TaskMatrix from './TaskMatrix';
import TaskItem from './TaskItem';
import { LayoutGrid, List, Plus, SlidersHorizontal } from 'lucide-react';

interface DashboardProps {
  activeTab: 'tasks' | 'stats';
  tasks: Task[];
  records: PomodoroRecord[];
  taskViewMode: 'list' | 'matrix';
  setTaskViewMode: (mode: 'list' | 'matrix') => void;
  openTaskForm: () => void;
  sortPrimary: string;
  setSortPrimary: (val: any) => void;
  sortSecondary: string;
  setSortSecondary: (val: any) => void;
  sortedTasks: Task[];
  completedTasks: Task[];
  onStartTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onSplitTask: (task: Task, feedback?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  activeTab,
  tasks,
  records,
  taskViewMode,
  setTaskViewMode,
  openTaskForm,
  sortPrimary,
  setSortPrimary,
  sortSecondary,
  setSortSecondary,
  sortedTasks,
  completedTasks,
  onStartTask,
  onEditTask,
  onDeleteTask,
  onSplitTask
}) => {
  if (activeTab === 'stats') {
    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-6">
            <h2 className="text-3xl font-bold mb-8">数据统计</h2>
            <Statistics records={records} tasks={tasks} />
        </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-8">
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">待办事项</h1>
                <div className="flex gap-3">
                    <button onClick={() => setTaskViewMode(taskViewMode === 'list' ? 'matrix' : 'list')} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10" title="视图切换">
                        {taskViewMode === 'list' ? <LayoutGrid size={20} /> : <List size={20} />}
                    </button>
                    <button onClick={openTaskForm} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white">
                        <Plus size={20} /><span className="hidden sm:inline">新建</span>
                    </button>
                </div>
            </div>
            {taskViewMode === 'list' && (
                <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2 text-sm text-white/60 mr-2"><SlidersHorizontal size={14} /><span>排序:</span></div>
                    <select value={sortPrimary} onChange={(e) => setSortPrimary(e.target.value as any)} className="bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm">
                        <option value="none">默认</option>
                        <option value="smart">✨ 智能排序</option>
                        <option value="priority">优先级</option>
                        <option value="urgency">紧急度</option>
                    </select>
                    <div className="text-white/20">|</div>
                    <div className="flex gap-1 flex-wrap">
                        {[{ id: 'created', label: '创建时间' }, { id: 'duration', label: '时长' }, { id: 'deadline', label: '截止' }, { id: 'az', label: 'A-Z' }].map((opt) => (
                            <button key={opt.id} onClick={() => setSortSecondary(opt.id as any)} className={`px-3 py-1.5 rounded-lg text-sm ${sortSecondary === opt.id ? 'bg-indigo-500/20 text-indigo-300' : 'text-white/40'}`}>{opt.label}</button>
                        ))}
                    </div>
                </div>
            )}
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-20 md:pb-0">
            {taskViewMode === 'matrix' ? (
                <TaskMatrix tasks={tasks} onStart={onStartTask} onEdit={onEditTask} />
            ) : (
                <div className="space-y-3 max-w-4xl mx-auto">
                    {sortedTasks.map(task => (
                        <TaskItem key={task.id} task={task} onStart={onStartTask} onEdit={onEditTask} onDelete={onDeleteTask} onSplit={onSplitTask} isActive={false} />
                    ))}
                    {completedTasks.length > 0 && (
                        <div className="mt-12 opacity-50">
                            <h3 className="text-sm font-bold text-white/30 uppercase mb-4 tracking-wider">已完成</h3>
                            <div className="space-y-2">{completedTasks.map(task => <TaskItem key={task.id} task={task} onStart={() => {}} onEdit={() => {}} onDelete={onDeleteTask} onSplit={onSplitTask} isActive={false} />)}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};

export default Dashboard;
