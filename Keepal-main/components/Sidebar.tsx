
import React from 'react';
import { List, BarChart2, MessageSquare, Settings } from 'lucide-react';

interface SidebarProps {
  activeTab: 'tasks' | 'stats';
  setActiveTab: (tab: 'tasks' | 'stats') => void;
  showChat: boolean;
  toggleChat: () => void;
  onOpenSettings: () => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  showChat, 
  toggleChat, 
  onOpenSettings,
  className = ''
}) => {
  return (
    <nav className={`z-20 w-full md:w-20 h-16 md:h-screen backdrop-blur-xl bg-black/20 border-t md:border-r border-white/10 flex md:flex-col items-center justify-between py-4 shrink-0 ${className}`}>
      <div className="flex md:flex-col items-center gap-6 w-full md:mt-4 justify-around md:justify-start">
        <button 
          onClick={() => setActiveTab('tasks')} 
          className={`p-3 rounded-xl transition-all ${activeTab === 'tasks' ? 'bg-white/20 text-white shadow-glow' : 'text-white/40 hover:text-white'}`}
          title="任务列表"
        >
          <List size={24} />
        </button>
        <button 
          onClick={() => setActiveTab('stats')} 
          className={`p-3 rounded-xl transition-all ${activeTab === 'stats' ? 'bg-white/20 text-white shadow-glow' : 'text-white/40 hover:text-white'}`}
          title="数据统计"
        >
          <BarChart2 size={24} />
        </button>
        <button 
          onClick={toggleChat} 
          className={`p-3 rounded-xl transition-all ${showChat ? 'bg-indigo-500 text-white shadow-glow' : 'text-white/40 hover:text-white'}`}
          title="AI 助手"
        >
          <MessageSquare size={24} />
        </button>
      </div>
      <button 
        onClick={onOpenSettings} 
        className="hidden md:block p-3 rounded-xl text-white/40 hover:text-white"
        title="设置"
      >
        <Settings size={24} />
      </button>
    </nav>
  );
};

export default Sidebar;
