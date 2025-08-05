'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem('user');
    
    if (user) {
      const userData = JSON.parse(user);
      
      // Redirect based on user role
      switch (userData.role) {
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
          router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
      <Typography variant="h6" sx={{ color: 'white' }}>
        Loading NEXUS...
      </Typography>
    </Box>
  );
}
