'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
} from '@mui/material';
import {
  School as SchoolIcon,
  AccountCircle,
  Logout as LogoutIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  Announcement as AnnouncementIcon,
  Folder as ResourceIcon,
  People as StudentsIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function TeacherDashboard() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'teacher') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('user');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('user');
      router.push('/login');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <SchoolIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            NEXUS - Teacher Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ mr: 2, textAlign: 'right' }}>
              <Typography variant="body2">
                {user.name}
              </Typography>
              <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>
                ID: {user.id}
              </Typography>
            </Box>
            <IconButton
              color="inherit"
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Welcome Card */}
          <Grid item xs={12}>
            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="h4" gutterBottom>
                  Welcome, {user.name}!
                </Typography>
                <Typography variant="body1">
                  Manage your classes, create engaging content, and track student progress.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Stats Cards */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <StudentsIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h4" color="primary">
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Students
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <AssignmentIcon color="secondary" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h4" color="secondary">
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Assignments
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <QuizIcon sx={{ fontSize: 40, mr: 2, color: 'success.main' }} />
                  <Box>
                    <Typography variant="h4" sx={{ color: 'success.main' }}>
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quizzes
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <AnnouncementIcon sx={{ fontSize: 40, mr: 2, color: 'warning.main' }} />
                  <Box>
                    <Typography variant="h4" sx={{ color: 'warning.main' }}>
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Announcements
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<AssignmentIcon />}
                      sx={{ p: 2, justifyContent: 'flex-start' }}
                      disabled
                    >
                      Create Assignment
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<QuizIcon />}
                      sx={{ p: 2, justifyContent: 'flex-start' }}
                      disabled
                    >
                      Create Quiz
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<AnnouncementIcon />}
                      sx={{ p: 2, justifyContent: 'flex-start' }}
                      disabled
                    >
                      Make Announcement
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ResourceIcon />}
                      sx={{ p: 2, justifyContent: 'flex-start' }}
                      disabled
                    >
                      Upload Resource
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Coming Soon Notice */}
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'background.default' }}>
              <Typography variant="h5" color="primary" gutterBottom>
                🚧 Teacher Features Coming Soon!
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                We&apos;re working hard to bring you comprehensive teacher tools including:
              </Typography>
              <List sx={{ maxWidth: 600, mx: 'auto' }}>
                <ListItem>
                  <ListItemText
                    primary="Student Management"
                    secondary="View and manage students assigned to your classes"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Content Creation"
                    secondary="Create assignments, quizzes with timers, and announcements"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Resource Sharing"
                    secondary="Upload and share learning materials with students"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Grade Management"
                    secondary="Grade assignments and provide feedback to students"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
