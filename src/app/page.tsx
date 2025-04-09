'use client';
import React, { useState, useEffect } from 'react';
import { Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box } from '@mui/material';

interface Counter {
  id: string;
  name: string;
}

interface Target {
  id: string;
  name: string;
  counters: { [key: string]: number };
}

interface AppData {
  targets: Target[];
  countersList: Counter[];
}

const saveData = (data: AppData) => {
  localStorage.setItem('multi-counter-data', JSON.stringify(data));
};

const loadData = (): AppData => {
  const stored = localStorage.getItem('multi-counter-data');
  if (!stored) return { targets: [], countersList: [] };
  try {
    const data = JSON.parse(stored);
    return {
      targets: Array.isArray(data.targets) ? data.targets : [],
      countersList: Array.isArray(data.countersList) ? data.countersList : []
    };
  } catch (e) {
    return { targets: [], countersList: [] };
  }
};

const generateId = () =>
  new Date().getTime().toString() + Math.random().toString(36).substring(2);

export default function Home() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [countersList, setCountersList] = useState<Counter[]>([]);
  const [targetModalOpen, setTargetModalOpen] = useState(false);
  const [counterModalOpen, setCounterModalOpen] = useState(false);
  const [newTargetName, setNewTargetName] = useState('');
  const [newCounterName, setNewCounterName] = useState('');

  useEffect(() => {
    const data = loadData();
    setTargets(data.targets);
    setCountersList(data.countersList);
  }, []);

  const handleTargetModalClose = () => {
    setTargetModalOpen(false);
  };

  const handleUpdateTargetName = (id: string, newName: string) => {
    const updatedTargets = targets.map(target =>
      target.id === id ? { ...target, name: newName } : target
    );
    setTargets(updatedTargets);
    saveData({ targets: updatedTargets, countersList });
  };

  const handleDeleteTarget = (id: string) => {
    const updatedTargets = targets.filter(target => target.id !== id);
    setTargets(updatedTargets);
    saveData({ targets: updatedTargets, countersList });
  };

  const handleAddTarget = () => {
    if (!newTargetName.trim()) return;
    const newTarget: Target = { id: generateId(), name: newTargetName, counters: {} };
    countersList.forEach(counter => {
      newTarget.counters[counter.id] = 0;
    });
    const updatedTargets = [...targets, newTarget];
    setTargets(updatedTargets);
    saveData({ targets: updatedTargets, countersList });
    setNewTargetName('');
  };

  const handleUpdateCounterName = (id: string, newName: string) => {
    const updatedCounters = countersList.map(counter =>
      counter.id === id ? { ...counter, name: newName } : counter
    );
    setCountersList(updatedCounters);
    saveData({ targets, countersList: updatedCounters });
  };

  const handleDeleteCounter = (id: string) => {
    const updatedCounters = countersList.filter(counter => counter.id !== id);
    const updatedTargets = targets.map(target => {
      const { [id]: _, ...newCounters } = target.counters;
      return { ...target, counters: newCounters };
    });
    setCountersList(updatedCounters);
    setTargets(updatedTargets);
    saveData({ targets: updatedTargets, countersList: updatedCounters });
  };

  const handleAddCounter = () => {
    if (!newCounterName.trim()) return;
    const newCounter: Counter = { id: generateId(), name: newCounterName };
    const updatedCounters = [...countersList, newCounter];
    const updatedTargets = targets.map(target => ({
      ...target,
      counters: { ...target.counters, [newCounter.id]: 0 }
    }));
    setCountersList(updatedCounters);
    setTargets(updatedTargets);
    saveData({ targets: updatedTargets, countersList: updatedCounters });
    setNewCounterName('');
  };

  const updateCounter = (targetId: string, counterId: string, delta: number) => {
    const updatedTargets = targets.map(target => {
      if (target.id === targetId) {
        const newValue = (target.counters[counterId] || 0) + delta;
        return { ...target, counters: { ...target.counters, [counterId]: newValue } };
      }
      return target;
    });
    setTargets(updatedTargets);
    saveData({ targets: updatedTargets, countersList });
  };

  const clearCounter = (targetId: string, counterId: string) => {
    const updatedTargets = targets.map(target => {
      if (target.id === targetId) {
        return { ...target, counters: { ...target.counters, [counterId]: 0 } };
      }
      return target;
    });
    setTargets(updatedTargets);
    saveData({ targets: updatedTargets, countersList });
  };

  const clearAllCounters = () => {
    const updatedTargets = targets.map(target => {
      const newCounters: { [key: string]: number } = {};
      Object.keys(target.counters).forEach(key => {
        newCounters[key] = 0;
      });
      return { ...target, counters: newCounters };
    });
    setTargets(updatedTargets);
    saveData({ targets: updatedTargets, countersList });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant='h4' component='h1' gutterBottom>
        マルチカウンター
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'flex-end' }}>
        <Button variant='contained' onClick={() => setTargetModalOpen(true)}>
          対象者管理
        </Button>
        <Button variant='contained' onClick={() => setCounterModalOpen(true)}>
          カウンター管理
        </Button>
      </Box>
      {targets.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant='outlined' onClick={clearAllCounters} sx={{ borderColor: 'red', color: 'red' }}>
            一括クリア
          </Button>
        </Box>
      )}
      {targets.length === 0 ? (
        <Typography variant='body1' color='textSecondary'>
          対象者が存在しません。対象者を作成してください。
        </Typography>
      ) : (
        <>
          {targets.map(target => (
            <Box key={target.id} sx={{ mb: 4, border: '1px solid #ccc', p: 2 }}>
              <Typography variant='h6'>対象者：{target.name}</Typography>
              {countersList.length > 0 ? (
                countersList.map(counter => (
                  <Box key={counter.id} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography sx={{ mr: 2 }}>
                      {counter.name}：{target.counters[counter.id] ?? 0}
                    </Typography>
                    <Button variant='outlined' onClick={() => updateCounter(target.id, counter.id, 1)}>
                      +
                    </Button>
                    <Button variant='outlined' sx={{ ml: 1 }} onClick={() => updateCounter(target.id, counter.id, -1)}>
                      -
                    </Button>
                    <Button
                      variant='outlined'
                      onClick={() => clearCounter(target.id, counter.id)}
                      sx={{ ml: 1, borderColor: 'red', color: 'red' }}
                    >
                      クリア
                    </Button>
                  </Box>
                ))
              ) : (
                <Typography variant='body1' color='textSecondary'>
                  カウンターが存在しません。カウンターを作成してください。
                </Typography>
              )}
            </Box>
          ))}
        </>
      )}
      <Dialog open={targetModalOpen} onClose={handleTargetModalClose} fullWidth maxWidth='sm'>
        <DialogTitle>対象者管理</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 3 }}>
            {targets.map(target => (
              <Box key={target.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TextField label='対象者名' value={target.name} onChange={(e) => handleUpdateTargetName(target.id, e.target.value)} fullWidth />
                <Button variant='outlined' color='error' onClick={() => handleDeleteTarget(target.id)}>
                  削除
                </Button>
              </Box>
            ))}
          </Box>
          <Box sx={{ mt: 3 }}>
            <TextField label='新規対象者名' value={newTargetName} onChange={(e) => setNewTargetName(e.target.value)} fullWidth />
            <Button variant='contained' onClick={handleAddTarget} sx={{ mt: 1 }}>
              追加
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTargetModalClose}>閉じる</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={counterModalOpen} onClose={() => setCounterModalOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle>カウンター管理</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 3 }}>
            {countersList.map(counter => (
              <Box key={counter.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TextField
                  label='カウンター名'
                  value={counter.name}
                  onChange={(e) => handleUpdateCounterName(counter.id, e.target.value)}
                  fullWidth
                />
                <Button variant='outlined' color='error' onClick={() => handleDeleteCounter(counter.id)}>
                  削除
                </Button>
              </Box>
            ))}
          </Box>
          <Box sx={{ mt: 3 }}>
            <TextField label='新規カウンター名' value={newCounterName} onChange={(e) => setNewCounterName(e.target.value)} fullWidth />
            <Button variant='contained' onClick={handleAddCounter} sx={{ mt: 1 }}>
              追加
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCounterModalOpen(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
