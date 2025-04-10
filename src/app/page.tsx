'use client';
import React, { useState } from 'react';
import {
    Box,
    Button,
    Card,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
} from '@mui/material';

import { useCounterContext } from '../contexts/Counter';
import { useTargetContext } from '../contexts/Target';

const Page = () => {
  const { targetList, createTarget, updateTarget, deleteTarget } = useTargetContext();
  const { counterList, createCounter, retrieveCounter, updateCounter, deleteCounter } = useCounterContext();
  const [targetModalOpen, setTargetModalOpen] = useState(false);
  const [counterModalOpen, setCounterModalOpen] = useState(false);
  const [newTargetName, setNewTargetName] = useState('');
  const [newCounterName, setNewCounterName] = useState('');

  const handleAddTarget = () => {
    createTarget(newTargetName);
    setNewTargetName('');
  };

  const handleAddCounter = () => {
    createCounter(newCounterName);
    setNewCounterName('');
  };

  const handleUpdateCounts = (counterId: string, targetId: string, delta: number) => {
    const prevCounter = retrieveCounter(counterId);
    if (prevCounter) {
      const prevValue = prevCounter.counts[targetId] ?? 0;

      const newCounter = {
        ...prevCounter,
        counts: {
          ...prevCounter.counts,
          [targetId]: prevValue + delta,
        }
      };
      updateCounter(newCounter);
    }
  };

  const handleClearCounts = (counterId: string, targetId: string) => {
    const prevCounter = retrieveCounter(counterId);
    if (prevCounter) {
      const newCounter = { ...prevCounter, counts: { ...prevCounter.counts, [targetId]: 0 } };
      updateCounter(newCounter);
    }
  };

  const handleClearAllCounts = () => {
    counterList.forEach(counter => {
      const prevCounter = retrieveCounter(counter.id);
      if (prevCounter) {
        const newCounts = { ...prevCounter.counts };
        targetList.forEach(target => {
          if (target.id in newCounts) {
            newCounts[target.id] = 0;
          }
        });
        updateCounter({ ...prevCounter, counts: newCounts });
      }
    });
  };

  return (
    <Container maxWidth="md">
      <Typography variant='h4' component='h1' sx={{ my: 2 }}>
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
      {targetList.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant='outlined' onClick={handleClearAllCounts} sx={{ borderColor: 'red', color: 'red' }}>
            一括クリア
          </Button>
        </Box>
      )}
      {targetList.length === 0 ? (
        <Typography variant='body1' color='textSecondary'>
          対象者が存在しません。対象者を作成してください。
        </Typography>
      ) : (
        <>
          {targetList.map(target => (
            <Card key={target.id} sx={{ mb: 2, p: 2 }}>
              <Typography variant='h6'>対象者：{target.name}</Typography>
              {counterList.length > 0 ? (
                counterList.map(counter => (
                  <Box key={counter.id} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography sx={{ mr: 2 }}>
                      {counter.name}：{(counter.counts[target.id] ?? 0)}
                    </Typography>
                    <Button variant='outlined' onClick={() => handleUpdateCounts(counter.id, target.id, 1)}>
                      +
                    </Button>
                    <Button variant='outlined' sx={{ ml: 1 }} onClick={() => handleUpdateCounts(counter.id, target.id, -1)}>
                      -
                    </Button>
                    <Button
                      variant='outlined'
                      onClick={() => handleClearCounts(counter.id, target.id)}
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
            </Card>
          ))}
        </>
      )}
      <Dialog open={targetModalOpen} onClose={() => setTargetModalOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle>対象者管理</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 3 }}>
            {targetList.map(target => (
              <Box key={target.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TextField
                  label='対象者名'
                  value={target.name}
                  onChange={(e) => updateTarget({ id: target.id, name: e.target.value})} fullWidth />
                <Button variant='outlined' color='error' onClick={() => deleteTarget(target.id)}>
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
          <Button onClick={() => setTargetModalOpen(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={counterModalOpen} onClose={() => setCounterModalOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle>カウンター管理</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 3 }}>
            {counterList.map(counter => (
              <Box key={counter.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TextField
                  label='カウンター名'
                  value={counter.name}
                  onChange={(e) => updateCounter({ id: counter.id, name: e.target.value, counts: counter.counts })}
                  fullWidth
                />
                <Button variant='outlined' color='error' onClick={() => deleteCounter(counter.id)}>
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
    </Container>
  );
};

export default Page;
