
import React, { useState, useRef, useEffect } from 'react';
import { AIMessage, EmotionalState } from '../types';
import { Send, Loader2 } from 'lucide-react';
import ChatHeader from './chat/ChatHeader';
import TaskProposal from './chat/TaskProposal';
import SplitProposal from './chat/SplitProposal';

interface AIChatProps {
  messages: AIMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onAcceptTask: (taskData: any) => void;
  onRejectTask: (taskTitle: string) => void;
  onConfirmSplit: (steps: any[], taskId?: string) => void;
  mood: string;
  systemPrompt: string;
  onUpdateSystemPrompt: (prompt: string) => void;
  emotionalState: EmotionalState;
}

const AIChat: React.FC<AIChatProps> = ({ 
    messages, 
    onSendMessage, 
    isLoading, 
    onAcceptTask, 
    onRejectTask,
    onConfirmSplit,
    mood,
    systemPrompt,
    onUpdateSystemPrompt,
    emotionalState
}) => {
  const [input, setInput] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [localSystemPrompt, setLocalSystemPrompt] = useState(systemPrompt);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveConfig = () => {
      onUpdateSystemPrompt(localSystemPrompt);
      setShowConfig(false);
  };

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-md border-l border-white/10 w-full md:w-96 transition-all duration-300">
      
      <ChatHeader 
        mood={mood}
        emotionalState={emotionalState}
        showConfig={showConfig}
        setShowConfig={setShowConfig}
        localSystemPrompt={localSystemPrompt}
        setLocalSystemPrompt={setLocalSystemPrompt}
        handleSaveConfig={handleSaveConfig}
      />

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] space-y-2`}>
              {msg.content && (
                  <div className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600/80 text-white rounded-tr-none' 
                      : 'bg-white/10 text-white/90 rounded-tl-none border border-white/5'
                  }`}>
                    {msg.content}
                  </div>
              )}

              {/* Task Proposals */}
              {msg.dataType === 'task_proposal' && msg.data && Array.isArray(msg.data) && msg.data.length > 0 && (
                <TaskProposal 
                    tasks={msg.data}
                    onAccept={onAcceptTask}
                    onReject={onRejectTask}
                />
              )}

              {/* Task Splits */}
              {msg.dataType === 'task_split' && msg.data && Array.isArray(msg.data) && (
                  <SplitProposal 
                    steps={msg.data} 
                    onConfirm={(steps) => onConfirmSplit(steps, msg.relatedTaskId)} 
                  />
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none flex items-center gap-2 text-white/50 text-xs">
                <Loader2 size={14} className="animate-spin" />
                正在思考...
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-black/20">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="告诉 Keepal 你的计划..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all placeholder:text-white/20"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
