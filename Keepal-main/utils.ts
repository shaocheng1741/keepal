
import { Task, PomodoroRecord } from "./types";
import { DEEPSEEK_API_KEY, DEEPSEEK_API_URL } from "./constants";

export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const formatDeadline = (timestamp?: number): string => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  
  const options: Intl.DateTimeFormatOptions = { 
    month: 'numeric', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  };
  
  if (date.getFullYear() !== now.getFullYear()) {
    options.year = 'numeric';
  }
  
  return date.toLocaleString('zh-CN', options);
};

export const calculateTaskFrequency = (tasks: Task[], records: PomodoroRecord[]): Record<string, number> => {
    const freq: Record<string, number> = {};
    records.forEach(r => {
        if (!r.completed || !r.taskId) return;
        const task = tasks.find(t => t.id === r.taskId);
        if (task) {
            const key = task.title.trim();
            freq[key] = (freq[key] || 0) + 1;
        }
    });
    return freq;
};

export const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

// --- Notification Utils ---

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notification');
    return 'denied';
  }
  
  const permission = await Notification.requestPermission();
  return permission;
};

export const sendBrowserNotification = (title: string, body?: string) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body: body,
      icon: 'https://lucide.dev/logo.svg', // Simple placeholder icon
      silent: false
    });
    playNotificationSound(); // Also play sound for double alert
  }
};

export const loadFromStorage = <T,>(key: string, initialValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.error("Error loading from local storage", error);
    return initialValue;
  }
};

export const saveToStorage = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error saving to local storage", error);
  }
};

// --- AI Utils (Switched to DeepSeek) ---

export const callAI = async (messages: { role: string; content: string }[], systemPrompt: string) => {
  try {
    // Construct the messages array for DeepSeek (OpenAI compatible)
    // DeepSeek expects the system prompt to be the first message with role 'system'
    const payloadMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
    ];

    const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
            model: "deepseek-chat", // V3
            messages: payloadMessages,
            temperature: 1.3, // Slightly creative to handle the "sarcastic/emotional" persona well
            stream: false
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`DeepSeek API Error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';

  } catch (error) {
    console.error("AI Call Failed", error);
    // Fallback Mock Response for Progressive Enhancement
    return JSON.stringify({
      emotion: 'warning',
      text_response: "⚠️ AI 连接失败 (DeepSeek API Error)。\n不过别担心，我还能陪你聊聊，或者你可以手动添加任务。\n(正在使用离线模拟回复)",
      action_type: "none"
    });
  }
};

export const parseAIResponse = (rawContent: string): { 
  text: string, 
  data: any, 
  type: 'task_proposal' | 'task_split' | null,
  emotion: string 
} => {
  let text = rawContent;
  let data = null;
  let type: any = null;
  let emotion = 'neutral';

  const jsonMatch = rawContent.match(/```json\n([\s\S]*?)\n```/) || rawContent.match(/{[\s\S]*}/);

  if (jsonMatch) {
    try {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      
      if (parsed.text_response) text = parsed.text_response;
      if (parsed.emotion) emotion = parsed.emotion;
      
      if (parsed.action_type && parsed.action_type !== 'none') {
        type = parsed.action_type;
        data = parsed.data;
      }
    } catch (e) {
      console.warn("Failed to parse AI JSON", e);
    }
  }

  return { text, data, type, emotion };
};
