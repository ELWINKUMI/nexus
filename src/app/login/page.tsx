'use client';

import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Card,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  School,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    id: '',
    pin: '',
  });
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect based on user role
        switch (data.user.role) {
          case 'superAdmin':
            router.push('/super-admin');
            break;
          case 'schoolAdmin':
            router.push('/school-admin');
            break;
          case 'teacher':
            router.push('/teacher');
            break;
          case 'student':
            router.push('/student');
            break;
          default:
            router.push('/');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#2c3e50',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <Card
        sx={{
          width: '100%',
          maxWidth: 400,
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}
      >
        {/* Header */}
        <Box sx={{
          bgcolor: '#34495e',
          color: 'white',
          textAlign: 'center',
          py: 2,
          px: 3
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            Log in
          </Typography>
        </Box>

        {/* University Header */}
        <Box sx={{
          bgcolor: '#2980b9',
          color: 'white',
          textAlign: 'center',
          py: 3,
          px: 3,
          position: 'relative'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <School sx={{ fontSize: 32, mr: 1 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                NEXUS LMS
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                Learning Management System
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Form Content */}
        <Box sx={{ p: 4, bgcolor: '#34495e' }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                bgcolor: 'rgba(244, 67, 54, 0.1)',
                color: '#f44336',
                '& .MuiAlert-icon': {
                  color: '#f44336'
                }
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#bdc3c7', mb: 1, fontSize: '0.875rem' }}>
                Username
              </Typography>
              <TextField
                fullWidth
                name="id"
                value={formData.id}
                onChange={handleInputChange}
                required
                autoComplete="username"
                placeholder=""
                disabled={loading}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#2c3e50',
                    borderRadius: 1,
                    '& fieldset': {
                      borderColor: '#4a5f73',
                      borderWidth: 1
                    },
                    '&:hover fieldset': {
                      borderColor: '#5a6f83'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3498db',
                      borderWidth: 1
                    },
                    '& input': {
                      color: 'white',
                      padding: '12px 14px'
                    },
                    '& input::placeholder': {
                      color: '#7f8c8d',
                      opacity: 1
                    }
                  }
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: '#bdc3c7', mb: 1, fontSize: '0.875rem' }}>
                Password
              </Typography>
              <TextField
                fullWidth
                name="pin"
                type={showPin ? 'text' : 'password'}
                value={formData.pin}
                onChange={handleInputChange}
                required
                autoComplete="current-password"
                placeholder=""
                disabled={loading}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#2c3e50',
                    borderRadius: 1,
                    '& fieldset': {
                      borderColor: '#4a5f73',
                      borderWidth: 1
                    },
                    '&:hover fieldset': {
                      borderColor: '#5a6f83'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3498db',
                      borderWidth: 1
                    },
                    '& input': {
                      color: 'white',
                      padding: '12px 14px'
                    },
                    '& input::placeholder': {
                      color: '#7f8c8d',
                      opacity: 1
                    }
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPin(!showPin)}
                        edge="end"
                        disabled={loading}
                        sx={{ color: '#bdc3c7' }}
                      >
                        {showPin ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || !formData.id || !formData.pin}
              sx={{ 
                bgcolor: '#34495e',
                color: '#bdc3c7',
                height: 48,
                borderRadius: 1,
                textTransform: 'none',
                fontSize: '1rem',
                border: '1px solid #4a5f73',
                '&:hover': {
                  bgcolor: '#3d566e',
                  borderColor: '#5a6f83'
                },
                '&:disabled': {
                  bgcolor: '#2c3e50',
                  color: '#7f8c8d',
                  borderColor: '#4a5f73'
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: '#bdc3c7' }} />
              ) : (
                'Log in'
              )}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#bdc3c7',
                cursor: 'pointer',
                '&:hover': {
                  color: '#3498db'
                }
              }}
            >
              Forgot your password?
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
