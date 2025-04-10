'use client';

import { PropsWithChildren, createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useTargetContext } from './Target';
import { Counter } from '../types/counter';

type CounterContextType = {
  counterList: Counter[];
  createCounter: (name: string) => void;
  retrieveCounter:(id: string) => Counter | undefined;
  updateCounter: (updated: Counter) => void;
  deleteCounter: (id: string) => void;
}

const CounterContext = createContext<CounterContextType | undefined>(undefined);

export const CounterProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [counterList, setCounterList] = useState<Counter[]>([]);
  const { targetList, retrieveTarget } = useTargetContext();

  useEffect(() => {
    const storedCounterList = localStorage.getItem('counter_list');
    if (storedCounterList) {
      const parsedCounterList: Counter[] = JSON.parse(storedCounterList);
      setCounterList(parsedCounterList);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('counter_list', JSON.stringify(counterList));
  }, [counterList]);

  useEffect(() => {
    // 対象者の追加・削除を同期
    counterList.forEach(counter => {
      const newCounter = {
        ...counter,
        counts: { ...counter.counts },
      };

      targetList.forEach(target => {
        if (!(target.id in counter.counts)) {
          newCounter.counts[target.id] = 0;
        }
      });

      for (const targetId in counter.counts) {
        if (!retrieveTarget(targetId)) {
          delete newCounter.counts[targetId];
        }
      }
      updateCounter(newCounter);
    });
  }, [targetList]);

  const createCounter = (name: string) => {
    if (!name.trim()) return;
    const newCounter: Counter = {
      id: uuidv4(),
      name: name,
      counts: {},
    };
    targetList.forEach(target => {
      newCounter.counts[target.id] = 0;
    });
    setCounterList(prev => [...prev, newCounter]);
  };

  const retrieveCounter = (id: string) => {
    return counterList.find(counter => counter.id === id);
  };

  const updateCounter = (updated: Counter) => {
    setCounterList(prev => prev.map(counter => (counter.id === updated.id ? updated : counter)));
  };

  const deleteCounter = (id: string) => {
    setCounterList(prev => prev.filter(counter => counter.id !== id));
  };

  return (
    <CounterContext.Provider value={{
      counterList,
      createCounter,
      retrieveCounter,
      updateCounter,
      deleteCounter,
    }}>
      {children}
    </CounterContext.Provider>
  );
};

export const useCounterContext = () => {
  const context = useContext(CounterContext);
  if (!context) {
    throw new Error('useCounter must be used within a CounterProvider');
  }
  return context;
};
