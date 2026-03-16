
import { useState, useEffect } from 'react';
import { loadFromStorage, saveToStorage } from '../utils';

export function usePersistentState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => loadFromStorage(key, initialValue));

  useEffect(() => {
    saveToStorage(key, state);
  }, [key, state]);

  return [state, setState] as const;
}
