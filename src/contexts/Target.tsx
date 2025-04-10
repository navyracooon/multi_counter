'use client';

import { PropsWithChildren, createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Target } from '../types/target';

type TargetContextType = {
  targetList: Target[];
  createTarget: (name: string) => void;
  retrieveTarget:(id: string) => Target | undefined;
  updateTarget: (updated: Target) => void;
  deleteTarget: (id: string) => void;
}

const TargetContext = createContext<TargetContextType | undefined>(undefined);

export const TargetProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [targetList, setTargetList] = useState<Target[]>([]);

  useEffect(() => {
    const storedTargetList = localStorage.getItem('target_list');
    if (storedTargetList) {
      const parsedTargetList: Target[] = JSON.parse(storedTargetList);
      setTargetList(parsedTargetList);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('target_list', JSON.stringify(targetList));
  }, [targetList]);

  const createTarget = (name: string) => {
    if (!name.trim()) return;
    const newTarget: Target = {
      id: uuidv4(),
      name: name,
    };
    setTargetList(prev => [...prev, newTarget]);
  };

  const retrieveTarget = (id: string) => {
    return targetList.find(target => target.id === id);
  };

  const updateTarget = (updated: Target) => {
    setTargetList(prev => prev.map(target => (target.id === updated.id ? updated : target)));
  };

  const deleteTarget = (id: string) => {
    setTargetList(prev => prev.filter(target => target.id !== id));
  };

  return (
    <TargetContext.Provider value={{
      targetList,
      createTarget,
      retrieveTarget,
      updateTarget,
      deleteTarget,
    }}>
      {children}
    </TargetContext.Provider>
  );
};

export const useTargetContext = () => {
  const context = useContext(TargetContext);
  if (!context) {
    throw new Error('useTarget must be used within a TargetProvider');
  }
  return context;
};
