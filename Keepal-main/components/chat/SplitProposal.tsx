
import React, { useState } from 'react';
import GlassCard from '../GlassCard';
import { Edit2, Trash2, Plus, Check } from 'lucide-react';

interface SplitProposalProps {
  steps: any[];
  onConfirm: (steps: any[]) => void;
}

const SplitProposal: React.FC<SplitProposalProps> = ({ steps: initialSteps, onConfirm }) => {
    const [steps, setSteps] = useState(initialSteps);

    const updateStep = (index: number, field: string, value: any) => {
        const newSteps = [...steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setSteps(newSteps);
    };

    const removeStep = (index: number) => {
        setSteps(steps.filter((_, i) => i !== index));
    };

    const addStep = () => {
        setSteps([...steps, { title: "新步骤", estimatedMinutes: 10 }]);
    };

    return (
        <GlassCard className="p-4 bg-white/5 border-indigo-500/30 mt-2">
            <h4 className="text-sm font-bold text-indigo-300 mb-3 flex items-center gap-2">
                <Edit2 size={12} /> 任务拆分建议
            </h4>
            <div className="space-y-2 mb-3">
                {steps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                        <span className="text-white/30 text-xs w-4">{idx + 1}.</span>
                        <input 
                            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white flex-1 min-w-0"
                            value={step.title}
                            onChange={(e) => updateStep(idx, 'title', e.target.value)}
                        />
                        <input 
                            type="number"
                            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white w-16 text-center"
                            value={step.estimatedMinutes}
                            onChange={(e) => updateStep(idx, 'estimatedMinutes', parseInt(e.target.value) || 0)}
                        />
                        <span className="text-xs text-white/50">min</span>
                        <button onClick={() => removeStep(idx)} className="text-red-400 hover:text-red-300 p-1">
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <button onClick={addStep} className="flex-1 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs text-white/70 flex items-center justify-center gap-1">
                    <Plus size={12} /> 添加步骤
                </button>
                <button onClick={() => onConfirm(steps)} className="flex-1 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-xs text-white flex items-center justify-center gap-1">
                    <Check size={12} /> 确认拆分
                </button>
            </div>
        </GlassCard>
    );
};

export default SplitProposal;
