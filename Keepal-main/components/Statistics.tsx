import React, { useMemo } from 'react';
import { PomodoroRecord, Task } from '../types';
import GlassCard from './GlassCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface StatisticsProps {
  records: PomodoroRecord[];
  tasks: Task[];
}

const Statistics: React.FC<StatisticsProps> = ({ records, tasks }) => {
  // Calculate today's stats
  const todayStats = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    const todayRecords = records.filter(r => r.startTime >= startOfDay);
    const completedTasks = tasks.filter(t => t.completedAt && t.completedAt >= startOfDay).length;
    const totalDuration = todayRecords.reduce((acc, curr) => acc + curr.durationSeconds, 0);
    const interrupted = todayRecords.filter(r => !r.completed).length;

    return { completedTasks, totalDuration, interrupted };
  }, [records, tasks]);

  // Last 7 days data for Bar Chart
  const weeklyData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const end = start + 86400000;
      
      const dayRecords = records.filter(r => r.startTime >= start && r.startTime < end);
      const minutes = Math.round(dayRecords.reduce((acc, curr) => acc + curr.durationSeconds, 0) / 60);
      
      data.push({
        name: `${d.getMonth() + 1}/${d.getDate()}`,
        minutes: minutes
      });
    }
    return data;
  }, [records]);

  // Task Completion Rate
  const completionData = useMemo(() => {
    const completed = tasks.filter(t => t.completed).length;
    const active = tasks.filter(t => !t.completed).length;
    return [
      { name: '已完成', value: completed },
      { name: '待办', value: active },
    ];
  }, [tasks]);

  const COLORS = ['#10b981', '#6366f1'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="p-4 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{todayStats.completedTasks}</span>
          <span className="text-xs text-white/50 uppercase">今日任务</span>
        </GlassCard>
        <GlassCard className="p-4 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{Math.round(todayStats.totalDuration / 60)}</span>
          <span className="text-xs text-white/50 uppercase">专注分钟</span>
        </GlassCard>
        <GlassCard className="p-4 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-red-400">{todayStats.interrupted}</span>
          <span className="text-xs text-white/50 uppercase">中断次数</span>
        </GlassCard>
      </div>

      <GlassCard className="p-6 h-64">
        <h3 className="text-sm text-white/70 mb-4">过去7天专注时长 (分钟)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData}>
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
              itemStyle={{ color: '#fff' }}
              cursor={{fill: 'rgba(255,255,255,0.05)'}}
            />
            <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                {weeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="rgba(99, 102, 241, 0.8)" />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <GlassCard className="p-6 h-64 flex flex-col items-center">
            <h3 className="text-sm text-white/70 mb-2">任务完成情况</h3>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={completionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {completionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '12px', border: 'none' }} />
                </PieChart>
            </ResponsiveContainer>
         </GlassCard>
         <GlassCard className="p-6 flex flex-col justify-center gap-4">
             <h3 className="text-sm text-white/70">成就概览</h3>
             <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">🏆</div>
                 <div>
                     <div className="font-bold">连续专注 3 天</div>
                     <div className="text-xs text-white/50">保持良好的节奏！</div>
                 </div>
             </div>
             <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">⚡</div>
                 <div>
                     <div className="font-bold">累计 50+ 番茄钟</div>
                     <div className="text-xs text-white/50">专注大师之路</div>
                 </div>
             </div>
         </GlassCard>
      </div>
    </div>
  );
};

export default Statistics;