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
  Button,
  CardActions,
} from '@mui/material';
import {
  School as SchoolIcon,
  AccountCircle,
  Logout as LogoutIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  Announcement as AnnouncementIcon,
  Folder as ResourceIcon,
  MenuBook as SubjectIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function StudentDashboard() {
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
    if (parsedUser.role !== 'student') {
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

  // Mock subjects data - this would come from API in real implementation
  const mockSubjects = [
    { id: '1', name: 'Mathematics', teacher: 'Mr. Johnson', color: '#1976d2' },
    { id: '2', name: 'English Language', teacher: 'Ms. Smith', color: '#9c27b0' },
    { id: '3', name: 'Science', teacher: 'Dr. Williams', color: '#4caf50' },
    { id: '4', name: 'History', teacher: 'Mrs. Brown', color: '#ff9800' },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <SchoolIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            NEXUS - Student Portal
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
                  Welcome back, {user.name}!
                </Typography>
                <Typography variant="body1">
                  Access your subjects, complete assignments, and track your learning progress.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Stats Cards */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <SubjectIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h4" color="primary">
                      {mockSubjects.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Subjects
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
                      Pending Assignments
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
                      Available Quizzes
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
                      New Announcements
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* My Subjects */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
              My Subjects
            </Typography>
            <Grid container spacing={2}>
              {mockSubjects.map((subject) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={subject.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          backgroundColor: subject.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                        }}
                      >
                        <SubjectIcon sx={{ color: 'white', fontSize: 30 }} />
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {subject.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Teacher: {subject.teacher}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" color="primary" disabled>
                        View Content
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Coming Soon Notice */}
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'background.default', mt: 3 }}>
              <Typography variant="h5" color="primary" gutterBottom>
                🎓 Student Features Coming Soon!
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                We&apos;re developing exciting features to enhance your learning experience:
              </Typography>
              <List sx={{ maxWidth: 600, mx: 'auto' }}>
                <ListItem>
                  <ListItemText
                    primary="Interactive Quizzes"
                    secondary="Take timed quizzes with visual progress indicators"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Assignment Submission"
                    secondary="Submit assignments and track your progress"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Resource Access"
                    secondary="Download and view learning materials shared by teachers"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Grade Tracking"
                    secondary="Monitor your academic performance and feedback"
                  />
                </ListItem>
              </List>
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Stay tuned for updates!
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
