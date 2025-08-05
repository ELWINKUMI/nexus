'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
} from '@mui/material';
import { Timer as TimerIcon } from '@mui/icons-material';

interface QuizTimerProps {
  totalTime: number; // in seconds
  onTimeUp: () => void;
  isActive: boolean;
}

export default function QuizTimer({ totalTime, onTimeUp, isActive }: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState(totalTime);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          onTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeUp]);

  // Calculate progress percentage (0-100)
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Determine color based on time remaining
  const getTimerColor = () => {
    const percentageLeft = (timeLeft / totalTime) * 100;
    
    if (percentageLeft > 50) return 'success';
    if (percentageLeft > 25) return 'warning';
    return 'error';
  };

  // Get progress bar color
  const getProgressColor = () => {
    const percentageLeft = (timeLeft / totalTime) * 100;
    
    if (percentageLeft > 50) return '#4caf50'; // Green
    if (percentageLeft > 25) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  return (
    <Box 
      sx={{ 
        position: 'fixed',
        top: 20,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 2,
        p: 2,
        boxShadow: 3,
        minWidth: 200,
        zIndex: 1000,
      }}
    >
      <Box display="flex" alignItems="center" mb={1}>
        <TimerIcon 
          color={getTimerColor()}
          sx={{ mr: 1 }} 
        />
        <Typography 
          variant="h6" 
          color={getTimerColor()}
          fontWeight="bold"
        >
          {formatTime(timeLeft)}
        </Typography>
      </Box>
      
      {/* Progress Bar */}
      <Box sx={{ width: '100%' }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(0,0,0,0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: getProgressColor(),
              borderRadius: 4,
            },
          }}
        />
      </Box>
      
      <Typography 
        variant="caption" 
        color="text.secondary"
        display="block"
        textAlign="center"
        mt={0.5}
      >
        Time Remaining
      </Typography>
    </Box>
  );
}
