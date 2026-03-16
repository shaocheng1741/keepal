
import { useMemo } from 'react';
import { Task, PomodoroRecord, TaskPriority, TaskUrgency } from '../types';
import { calculateTaskFrequency } from '../utils';

export function useTaskSorter(
  tasks: Task[], 
  records: PomodoroRecord[], 
  sortPrimary: string, 
  sortSecondary: string
) {
  const taskFrequencyMap = useMemo(() => calculateTaskFrequency(tasks, records), [tasks, records]);

  const sortedIncompleteTasks = useMemo(() => {
    let list = tasks.filter(t => !t.completed);
    
    const getSmartScore = (task: Task) => {
        let score = 0;
        if (task.priority === TaskPriority.High) score += 20;
        if (task.urgency === TaskUrgency.Urgent) score += 20;
        score += (taskFrequencyMap[task.title.trim()] || 0) * 2;
        const daysOld = (Date.now() - task.createdAt) / (1000 * 60 * 60 * 24);
        if (daysOld > 7) score -= 15;
        return score;
    };

    if (sortPrimary === 'smart') {
        list.sort((a, b) => getSmartScore(b) - getSmartScore(a));
    } else if (sortPrimary === 'priority') {
        list.sort((a, b) => (a.priority === b.priority ? 0 : a.priority === TaskPriority.High ? -1 : 1));
    } else if (sortPrimary === 'urgency') {
        list.sort((a, b) => (a.urgency === b.urgency ? 0 : a.urgency === TaskUrgency.Urgent ? -1 : 1));
    }

    if (sortPrimary !== 'smart') {
        list.sort((a, b) => {
             if (sortPrimary === 'priority' && a.priority !== b.priority) return 0;
             if (sortPrimary === 'urgency' && a.urgency !== b.urgency) return 0;
             if (sortSecondary === 'created') return b.createdAt - a.createdAt;
             if (sortSecondary === 'duration') return a.estimatedMinutes - b.estimatedMinutes;
             if (sortSecondary === 'az') return a.title.localeCompare(b.title);
             if (sortSecondary === 'deadline') return (a.deadline || Infinity) - (b.deadline || Infinity);
             return 0;
        });
    }
    return list;
  }, [tasks, sortPrimary, sortSecondary, taskFrequencyMap]);

  return { sortedIncompleteTasks, taskFrequencyMap };
}
