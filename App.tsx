import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  AppState, Task, TimerState, TaskPriority, TaskUrgency, PomodoroRecord, AIMessage, EmotionalState 
} from './types';
import { MOOD_THEMES, DEFAULT_SYSTEM_PROMPT, DEFAULT_BREAK_MINUTES } from './constants';
import { 
  playNotificationSound, callAI, parseAIResponse, requestNotificationPermission, sendBrowserNotification 
} from './utils';

// Hooks
import { usePersistentState } from './hooks/usePersistentState';
import { useTimerSystem } from './hooks/useTimerSystem';
import { useTaskSorter } from './hooks/useTaskSorter';
import { useIsMobile } from './hooks/useIsMobile';

// Components
import MoodGlowBackground from './components/MoodGlowBackground';
import AIChat from './components/AIChat';
import Sidebar from './components/Sidebar';
import TaskFormModal from './components/TaskFormModal';
import SettingsModal from './components/SettingsModal';
import ConfirmationModal from './components/ConfirmationModal';
import ReflectionOverlay from './components/ReflectionOverlay';
import FocusOverlay from './components/FocusOverlay';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const isMobile = useIsMobile();

  // --- Core State (Persisted) ---
  const [tasks, setTasks] = usePersistentState<Task[]>('tasks', []);
  const [records, setRecords] = usePersistentState<PomodoroRecord[]>('records', []);
  const [emotionalState, setEmotionalState] = usePersistentState<EmotionalState>('emotional_state', { trust: 80, sarcasm: 3, affinity: 50 });
  const [messages, setMessages] = usePersistentState<AIMessage[]>('ai_history', [{ id: 'init', role: 'assistant', content: '我是Keepal。告诉我你的计划，或者粘贴一段聊天记录，我帮你整理待办。', timestamp: Date.now() }]);
  const [systemPrompt, setSystemPrompt] = usePersistentState('system_prompt', DEFAULT_SYSTEM_PROMPT);
  const [breakDuration, setBreakDuration] = usePersistentState('settings_breakDuration', DEFAULT_BREAK_MINUTES);
  const [reflectionEndTime, setReflectionEndTime] = usePersistentState<number | null>('reflection_end_time', null);

  // --- UI State (Ephemeral) ---
  const [mood, setMood] = useState<AppState['mood']>('neutral');
  // Initialize chat visibility based on screen size (hidden on mobile start, visible on desktop)
  const [showChat, setShowChat] = useState(() => window.innerWidth >= 768);
  const [appMode, setAppMode] = useState<'dashboard' | 'focus'>('dashboard');
  const [dashboardTab, setDashboardTab] = useState<'tasks' | 'stats'>('tasks');
  const [taskViewMode, setTaskViewMode] = useState<'list' | 'matrix'>('list');
  const [sortPrimary, setSortPrimary] = useState('none');
  const [sortSecondary, setSortSecondary] = useState('created');
  
  // Modals & Popups
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showGiveUpConfirm, setShowGiveUpConfirm] = useState(false);
  const [showSkipBreakConfirm, setShowSkipBreakConfirm] = useState(false); // New State
  const [aiLoading, setAiLoading] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [now, setNow] = useState(Date.now());

  // --- Custom Hooks & Circular Dependency Fix ---
  // We use a ref to hold the timer completion logic to avoid circular dependency with useTimerSystem
  const handleTimerCompleteRef = useRef<() => void>(() => {});
  
  // Stable callback passed to hook
  const onTimerCompleteWrapper = useCallback(() => {
    handleTimerCompleteRef.current();
  }, []);

  const timer = useTimerSystem(onTimerCompleteWrapper);

  const handleTimerComplete = useCallback(() => {
    playNotificationSound();
    
    // 1. If we are in Break mode or no active task (Free Focus completed?), return to dashboard
    if (timer.timerState === TimerState.Break || !timer.activeTaskId) {
       timer.reset(); 
       setAppMode('dashboard'); 
       setMood('neutral');
       return;
    }

    // 2. If we just finished a Task
    // Update Emotions: Trust+, Affinity+, Sarcasm-
    setEmotionalState(prev => ({ trust: Math.min(100, prev.trust + 5), affinity: Math.min(100, prev.affinity + 2), sarcasm: Math.max(0, prev.sarcasm - 1) }));
    
    if (timer.activeTaskId) {
       // Save Record
       if (timer.startTimeRef) {
          setRecords(prev => [{ id: Date.now().toString(), taskId: timer.activeTaskId, startTime: timer.startTimeRef!, endTime: Date.now(), durationSeconds: timer.totalTime, completed: true }, ...prev]);
       }
       // Complete Task
       setTasks(prev => prev.map(t => t.id === timer.activeTaskId ? { ...t, completed: true, completedAt: Date.now() } : t));
       setMood('encouraging');
       
       // Start Break automatically if duration > 0
       if (breakDuration > 0) {
           timer.startBreak(breakDuration);
           // NOTE: appMode stays 'focus' to show break timer
       } else { 
           timer.reset(); 
           setAppMode('dashboard'); 
       }
    }
  }, [breakDuration, timer, setEmotionalState, setRecords, setTasks]);

  // Update the Ref whenever the handler logic (dependencies) changes
  useEffect(() => {
    handleTimerCompleteRef.current = handleTimerComplete;
  }, [handleTimerComplete]);

  const { sortedIncompleteTasks } = useTaskSorter(tasks, records, sortPrimary, sortSecondary);

  // --- Global Ticks ---
  useEffect(() => {
    const interval = setInterval(() => {
        setNow(Date.now());
        tasks.forEach(t => {
            if (t.reminderTime && !t.completed && Math.abs(Date.now() - t.reminderTime) < 1500) {
                sendBrowserNotification(`提醒: ${t.title}`);
            }
        });
    }, 1000);
    return () => clearInterval(interval);
  }, [tasks]);

  // Sync isMobile state with showChat slightly to prevent getting stuck
  useEffect(() => {
    if (isMobile) {
        // Optional: you might want to enforce closing chat when resizing to mobile, 
        // but leaving it as-is respects user's current view.
    } else {
        // When resizing to desktop, usually we want chat visible
        setShowChat(true);
    }
  }, [isMobile]);

  // --- Handlers ---
  const handleStartTask = (task: Task) => {
    timer.startTask(task);
    setAppMode('focus');
  };

  const handleGiveUp = () => {
    setEmotionalState(prev => ({ trust: Math.max(0, prev.trust - 20), affinity: Math.max(0, prev.affinity - 5), sarcasm: Math.min(10, prev.sarcasm + 2) }));
    if (timer.activeTaskId && timer.startTimeRef) {
        setRecords(prev => [{ id: Date.now().toString(), taskId: timer.activeTaskId, startTime: timer.startTimeRef!, endTime: Date.now(), durationSeconds: Math.floor((Date.now() - timer.startTimeRef!)/1000), completed: false }, ...prev]);
    }
    timer.reset(); setAppMode('dashboard'); setMood('sarcastic'); setShowGiveUpConfirm(false);
  };

  const handleSkipBreak = () => {
      timer.reset();
      setAppMode('dashboard');
      setMood('neutral');
      setShowSkipBreakConfirm(false);
  };

  const handleSendMessage = async (text: string, context?: { relatedTaskId?: string }) => {
      setMessages(p => [...p, { id: Date.now().toString(), role: 'user', content: text, timestamp: Date.now() }]);
      setAiLoading(true);
      const ctxPrompt = `${systemPrompt}\n[CURRENT TIME]: ${new Date().toLocaleString()}\n[STATS]: Trust:${emotionalState.trust}, Tasks:${tasks.filter(t=>t.completed).length}`;
      try {
          const raw = await callAI([...messages, { role: 'user', content: text }], ctxPrompt);
          const { text: aiText, data, type, emotion } = parseAIResponse(raw);
          setMood(emotion as AppState['mood']);
          setMessages(p => [...p, { id: Date.now().toString(), role: 'assistant', content: aiText, data, dataType: type, timestamp: Date.now(), relatedTaskId: context?.relatedTaskId }]);
      } catch (e) { setMessages(p => [...p, { id: Date.now().toString(), role: 'assistant', content: 'AI Error', timestamp: Date.now() }]); }
      setAiLoading(false);
  };

  const handleAcceptAITask = (data: any) => {
      // 1. Create the task
      setEmotionalState(p => ({...p, trust: Math.min(100, p.trust + 2)}));
      setTasks(p => [{ 
          id: Date.now().toString(), 
          title: data.title, 
          estimatedMinutes: data.estimatedMinutes || 25, 
          priority: data.priority || TaskPriority.Low, 
          urgency: data.urgency || TaskUrgency.NotUrgent, 
          tag: data.tag || 'AI', 
          deadline: data.deadline ? Date.parse(data.deadline) : undefined, 
          reminderTime: data.reminderTime ? Date.parse(data.reminderTime) : undefined,
          completed: false, 
          createdAt: Date.now() 
      }, ...p]);
      
      if(data.reminderTime && notificationPermission === 'default') {
          requestNotificationPermission().then(setNotificationPermission);
      }

      // 2. Remove the accepted task from the AI message proposal list to prevent duplicates
      setMessages(prev => prev.map(msg => {
        if (msg.dataType === 'task_proposal' && Array.isArray(msg.data)) {
            return {
                ...msg,
                data: msg.data.filter((t: any) => t.title !== data.title)
            };
        }
        return msg;
      }));
      
      // On mobile, switch back to dashboard to see the new task
      if (isMobile) setShowChat(false);
  };

  const handleTaskSave = (data: any) => {
      if (editingTaskId) setTasks(prev => prev.map(t => t.id === editingTaskId ? { ...t, ...data } : t));
      else setTasks(prev => [{ id: Date.now().toString(), ...data, tag: '一般', completed: false, createdAt: Date.now() }, ...prev]);
      setShowTaskForm(false);
  };

  const handleSplitConfirm = (steps: any[], taskId?: string) => {
     if(taskId) {
        setTasks(p => p.map(t => t.id === taskId ? { ...t, subtasks: steps.map((s,i) => ({id: Date.now()+""+i, title: s.title, estimatedMinutes: s.estimatedMinutes, completed: false})) } : t));
     } else {
        handleTaskSave({ title: "AI Split Task Group", estimatedMinutes: steps.reduce((a:any,b:any)=>a+b.estimatedMinutes,0), priority: 'High', urgency: 'Urgent' });
     }
     setMessages(p => p.map(m => m.dataType === 'task_split' && m.relatedTaskId === taskId ? { ...m, data: null } : m));
     // On mobile, switch back to dashboard after split confirmation
     if (isMobile) setShowChat(false);
  };

  const handleSidebarTabChange = (tab: 'tasks' | 'stats') => {
      setDashboardTab(tab);
      // On mobile, if switching tabs, we ensure we are looking at the dashboard, not chat
      if (isMobile) setShowChat(false);
  };

  const handleToggleChat = () => {
      setShowChat(prev => !prev);
  };

  // View Logic
  const shouldShowDashboard = !isMobile || !showChat;
  const shouldShowChat = showChat;

  return (
    <div className="min-h-screen text-white overflow-hidden relative font-sans">
      <MoodGlowBackground mood={mood} />
      
      <ReflectionOverlay 
        isReflecting={reflectionEndTime !== null && now < reflectionEndTime} 
        isFinished={!reflectionEndTime ? false : now >= reflectionEndTime}
        remainingSeconds={reflectionEndTime ? Math.ceil((reflectionEndTime - now) / 1000) : 0}
        onComplete={() => { setReflectionEndTime(null); setEmotionalState(p => ({ ...p, trust: 10 })); }}
      />

      <FocusOverlay 
        isActive={appMode === 'focus'} timeLeft={timer.timeLeft} totalTime={timer.totalTime} timerState={timer.timerState} 
        // Use explicit string for Break title if no task is active
        activeTaskTitle={timer.activeTaskId ? (tasks.find(t => t.id === timer.activeTaskId)?.title || '') : '休息一下'}
        subtasks={tasks.find(t => t.id === timer.activeTaskId)?.subtasks}
        onStart={() => timer.setTimerState(TimerState.Running)} onPause={() => timer.setTimerState(TimerState.Paused)}
        onFinishEarly={() => { setShowFinishConfirm(true); timer.setTimerState(TimerState.Paused); }}
        onGiveUp={() => { setShowGiveUpConfirm(true); timer.setTimerState(TimerState.Paused); }}
        onSkipBreak={() => { setShowSkipBreakConfirm(true); /* timer.setTimerState(TimerState.Paused); breaks don't pause */ }}
        onToggleSubtask={(sid) => setTasks(p => p.map(t => t.id === timer.activeTaskId ? {...t, subtasks: t.subtasks?.map(s => s.id === sid ? {...s, completed: !s.completed} : s)} : t))}
      />

      <div className={`flex flex-col md:flex-row h-screen transition-opacity duration-500 ${appMode === 'focus' ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'}`}>
        <Sidebar 
            activeTab={dashboardTab} 
            setActiveTab={handleSidebarTabChange} 
            showChat={showChat} 
            toggleChat={handleToggleChat} 
            onOpenSettings={() => setShowSettings(true)} 
        />
        
        <main className="flex-1 z-10 flex flex-row overflow-hidden bg-black/10 relative">
            {shouldShowDashboard && (
                <div className={`flex-1 flex flex-col h-full transition-all duration-300 w-full`}>
                    <Dashboard 
                        activeTab={dashboardTab} tasks={tasks} records={records} sortedTasks={sortedIncompleteTasks} completedTasks={tasks.filter(t => t.completed)}
                        taskViewMode={taskViewMode} setTaskViewMode={setTaskViewMode} sortPrimary={sortPrimary} setSortPrimary={setSortPrimary} sortSecondary={sortSecondary} setSortSecondary={setSortSecondary}
                        openTaskForm={() => { setEditingTaskId(null); setShowTaskForm(true); }}
                        onStartTask={handleStartTask} onEditTask={(t) => { setEditingTaskId(t.id); setShowTaskForm(true); }} onDeleteTask={(id) => setTaskToDelete(id)}
                        onSplitTask={(t, fb) => handleSendMessage(fb ? `Resplit task "${t.title}" per "${fb}"` : `Split task "${t.title}"`, { relatedTaskId: t.id })}
                    />
                </div>
            )}
            
            {shouldShowChat && (
                <div className={`${isMobile ? 'w-full absolute inset-0 z-20 bg-black/80 backdrop-blur-xl' : 'h-full border-l border-white/10'}`}>
                    <AIChat 
                        messages={messages} onSendMessage={handleSendMessage} isLoading={aiLoading} mood={mood} systemPrompt={systemPrompt} emotionalState={emotionalState}
                        onAcceptTask={handleAcceptAITask} onRejectTask={(t) => setMessages(p => p.map(m => m.data ? {...m, data: m.data.filter((d:any)=>d.title!==t)} : m))}
                        onConfirmSplit={handleSplitConfirm} onUpdateSystemPrompt={setSystemPrompt}
                    />
                </div>
            )}
        </main>
      </div>

      <TaskFormModal isOpen={showTaskForm} onClose={() => setShowTaskForm(false)} onSave={handleTaskSave} editingTask={editingTaskId ? tasks.find(t => t.id === editingTaskId) || null : null} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} breakDuration={breakDuration} setBreakDuration={setBreakDuration} notificationPermission={notificationPermission} onRequestPermission={() => requestNotificationPermission().then(setNotificationPermission)} />
      <ConfirmationModal isOpen={!!taskToDelete} title="确认删除?" onCancel={() => setTaskToDelete(null)} onConfirm={() => { if(taskToDelete) { setTasks(p => p.filter(t => t.id !== taskToDelete)); setTaskToDelete(null); } }} isDangerous />
      <ConfirmationModal isOpen={showFinishConfirm} title="提前完成?" confirmText="完成" onCancel={() => { setShowFinishConfirm(false); timer.setTimerState(TimerState.Running); }} onConfirm={() => { setShowFinishConfirm(false); handleTimerComplete(); }} />
      <ConfirmationModal isOpen={showGiveUpConfirm} title="放弃专注?" confirmText="放弃" onCancel={() => { setShowGiveUpConfirm(false); timer.setTimerState(TimerState.Running); }} onConfirm={handleGiveUp} isDangerous />
      {/* Skip Break Confirmation */}
      <ConfirmationModal isOpen={showSkipBreakConfirm} title="跳过休息?" confirmText="开始工作" onCancel={() => setShowSkipBreakConfirm(false)} onConfirm={handleSkipBreak} />
    </div>
  );
};

export default App;