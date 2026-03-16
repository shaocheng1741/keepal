
import React from 'react';
import { Bot, Settings, Shield, Heart, Zap, X } from 'lucide-react';
import { EmotionalState } from '../../types';

interface ChatHeaderProps {
  mood: string;
  emotionalState: EmotionalState;
  showConfig: boolean;
  setShowConfig: (show: boolean) => void;
  localSystemPrompt: string;
  setLocalSystemPrompt: (prompt: string) => void;
  handleSaveConfig: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  mood,
  emotionalState,
  showConfig,
  setShowConfig,
  localSystemPrompt,
  setLocalSystemPrompt,
  handleSaveConfig
}) => {
  return (
    <>
      <div className="p-4 border-b border-white/10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500
                ${mood === 'encouraging' ? 'bg-emerald-500/20 text-emerald-400' :
                    mood === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                    mood === 'sarcastic' ? 'bg-red-500/20 text-red-400' :
                    'bg-blue-500/20 text-blue-400'
                }`}>
                <Bot size={24} />
                </div>
                <div>
                <h3 className="font-bold text-white">Keepal</h3>
                <p className="text-xs text-white/50">AI 助手</p>
                </div>
            </div>
            <button onClick={() => setShowConfig(!showConfig)} className="p-2 text-white/40 hover:text-white transition-colors">
                <Settings size={18} />
            </button>
        </div>

        {/* Emotional Stats Bar */}
        <div className="flex justify-between items-center gap-2 bg-white/5 p-2 rounded-lg">
             <div className="flex-1 flex flex-col items-center gap-1">
                 <div className="flex items-center gap-1 text-[10px] text-blue-300 font-bold uppercase tracking-wider">
                     <Shield size={10} /> 信任
                 </div>
                 <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${emotionalState.trust}%` }} />
                 </div>
                 <span className="text-[10px] text-white/40">{emotionalState.trust}</span>
             </div>
             
             <div className="flex-1 flex flex-col items-center gap-1 border-l border-r border-white/5 px-2">
                 <div className="flex items-center gap-1 text-[10px] text-pink-300 font-bold uppercase tracking-wider">
                     <Heart size={10} /> 好感
                 </div>
                 <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full bg-pink-500 transition-all duration-500" style={{ width: `${emotionalState.affinity}%` }} />
                 </div>
                 <span className="text-[10px] text-white/40">{emotionalState.affinity}</span>
             </div>

             <div className="flex-1 flex flex-col items-center gap-1">
                 <div className="flex items-center gap-1 text-[10px] text-red-300 font-bold uppercase tracking-wider">
                     <Zap size={10} /> 毒舌
                 </div>
                 <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${emotionalState.sarcasm * 10}%` }} />
                 </div>
                 <span className="text-[10px] text-white/40">{emotionalState.sarcasm}</span>
             </div>
        </div>
      </div>

      {/* Config Area */}
      {showConfig && (
          <div className="p-4 bg-black/20 border-b border-white/10">
              <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-white/70 uppercase">系统提示词 (Prompt)</h4>
                  <button onClick={() => setShowConfig(false)}><X size={14} className="text-white/40" /></button>
              </div>
              <textarea 
                value={localSystemPrompt}
                onChange={(e) => setLocalSystemPrompt(e.target.value)}
                className="w-full h-32 bg-black/30 border border-white/10 rounded-lg p-2 text-xs text-white/80 focus:outline-none focus:border-indigo-500"
              />
              <button onClick={handleSaveConfig} className="mt-2 w-full py-1.5 bg-indigo-600 rounded text-xs text-white">
                  保存配置
              </button>
          </div>
      )}
    </>
  );
};

export default ChatHeader;
