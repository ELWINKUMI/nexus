'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
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
  Add as AddIcon,
  Class as ClassIcon,
  Subject as SubjectIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function TeacherDashboard() {
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

  // Mock data - this would come from API in real implementation
  const mockClasses = [
    { id: '1', name: 'Grade 8A', students: 25 },
    { id: '2', name: 'Grade 8B', students: 23 },
  ];

  const mockSubjects = [
    { id: '1', name: 'Mathematics', classes: 2 },
    { id: '2', name: 'Science', classes: 1 },
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      bgcolor: '#f5f7fa'
    }}>
      {/* Sidebar */}
      <Box sx={{
        width: 280,
        bgcolor: '#1e3a8a',
        color: 'white',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
        boxShadow: '4px 0 10px rgba(0,0,0,0.1)'
      }}>
        {/* Logo Section */}
        <Box sx={{ 
          p: 3, 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <SchoolIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              NEXUS LMS
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Teacher Portal
            </Typography>
          </Box>
        </Box>

        {/* User Info */}
        <Box sx={{ 
          p: 3, 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          bgcolor: 'rgba(255,255,255,0.05)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <AccountCircle sx={{ fontSize: 48 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {user?.name}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Teacher
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', opacity: 0.7 }}>
                ID: {user?.id}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Navigation */}
        <Box sx={{ p: 2 }}>
          <Typography variant="overline" sx={{ 
            color: 'rgba(255,255,255,0.6)', 
            fontSize: '0.75rem',
            fontWeight: 'bold',
            letterSpacing: 1,
            px: 2,
            py: 1,
            display: 'block'
          }}>
            TEACHING TOOLS
          </Typography>
          
          <List sx={{ p: 0 }}>
            {[
              { label: 'My Classes', icon: <ClassIcon />, color: '#3b82f6' },
              { label: 'Subjects', icon: <SubjectIcon />, color: '#8b5cf6' },
              { label: 'Assignments', icon: <AssignmentIcon />, color: '#10b981' },
              { label: 'Quizzes', icon: <QuizIcon />, color: '#f59e0b' },
              { label: 'Announcements', icon: <AnnouncementIcon />, color: '#ef4444' },
              { label: 'Resources', icon: <ResourceIcon />, color: '#6b7280' },
            ].map((item, index) => (
              <ListItem
                key={item.label}
                button
                sx={{
                  mx: 1,
                  mb: 1,
                  borderRadius: 2,
                  bgcolor: index === 0 ? 'rgba(255,255,255,0.15)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: index === 0 ? 'bold' : 'normal'
                  }}
                />
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 4, px: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        ml: '280px',
        minHeight: '100vh'
      }}>
        {/* Header */}
        <Box sx={{
          bgcolor: 'white',
          borderBottom: '1px solid #e2e8f0',
          px: 4,
          py: 3,
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 'bold',
            color: '#1e293b',
            mb: 1
          }}>
            Welcome back, {user?.name}!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your classes and create engaging learning experiences
          </Typography>
        </Box>

        {/* Content Area */}
        <Box sx={{ p: 4 }}>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              { 
                title: 'My Classes', 
                value: mockClasses.length, 
                icon: <ClassIcon />, 
                color: '#3b82f6',
                bgcolor: '#eff6ff'
              },
              { 
                title: 'Subjects', 
                value: mockSubjects.length, 
                icon: <SubjectIcon />, 
                color: '#8b5cf6',
                bgcolor: '#f3e8ff'
              },
              { 
                title: 'Students', 
                value: mockClasses.reduce((total, cls) => total + cls.students, 0), 
                icon: <StudentsIcon />, 
                color: '#10b981',
                bgcolor: '#ecfdf5'
              },
              { 
                title: 'Assignments', 
                value: 0, 
                icon: <AssignmentIcon />, 
                color: '#f59e0b',
                bgcolor: '#fffbeb'
              }
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} lg={3} key={stat.title}>
                <Card sx={{ 
                  p: 3,
                  height: '100%',
                  border: '1px solid #e2e8f0',
                  borderRadius: 3,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" sx={{ 
                        fontWeight: 'bold',
                        color: stat.color,
                        mb: 1
                      }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {stat.title}
                      </Typography>
                    </Box>
                    <Box sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: stat.bgcolor,
                      color: stat.color
                    }}>
                      {stat.icon}
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            {/* My Classes */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                height: '400px',
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                      My Classes
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      sx={{
                        borderColor: '#3b82f6',
                        color: '#3b82f6',
                        '&:hover': {
                          bgcolor: '#eff6ff'
                        }
                      }}
                    >
                      Add Class
                    </Button>
                  </Box>
                </Box>
                <Box sx={{ p: 3 }}>
                  {mockClasses.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <ClassIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
                      <Typography variant="body2" color="text.secondary">
                        No classes assigned yet
                      </Typography>
                    </Box>
                  ) : (
                    <List sx={{ p: 0 }}>
                      {mockClasses.map((cls) => (
                        <ListItem 
                          key={cls.id}
                          sx={{ 
                            px: 0,
                            py: 2,
                            borderBottom: '1px solid #f1f5f9',
                            '&:last-child': { borderBottom: 'none' }
                          }}
                        >
                          <ListItemIcon>
                            <ClassIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={cls.name}
                            secondary={`${cls.students} students`}
                            primaryTypographyProps={{ fontWeight: 'bold' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </Card>
            </Grid>

            {/* Teaching Subjects */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                height: '400px',
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                      Teaching Subjects
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      sx={{
                        borderColor: '#8b5cf6',
                        color: '#8b5cf6',
                        '&:hover': {
                          bgcolor: '#f3e8ff'
                        }
                      }}
                    >
                      Add Subject
                    </Button>
                  </Box>
                </Box>
                <Box sx={{ p: 3 }}>
                  {mockSubjects.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <SubjectIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
                      <Typography variant="body2" color="text.secondary">
                        No subjects assigned yet
                      </Typography>
                    </Box>
                  ) : (
                    <List sx={{ p: 0 }}>
                      {mockSubjects.map((subject) => (
                        <ListItem 
                          key={subject.id}
                          sx={{ 
                            px: 0,
                            py: 2,
                            borderBottom: '1px solid #f1f5f9',
                            '&:last-child': { borderBottom: 'none' }
                          }}
                        >
                          <ListItemIcon>
                            <SubjectIcon sx={{ color: '#8b5cf6' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={subject.name}
                            secondary={`${subject.classes} classes`}
                            primaryTypographyProps={{ fontWeight: 'bold' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </Card>
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12}>
              <Card sx={{ 
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                    Quick Actions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Common tasks to get you started
                  </Typography>
                </Box>
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    {[
                      { label: 'Create Assignment', icon: <AssignmentIcon />, color: '#10b981' },
                      { label: 'Create Quiz', icon: <QuizIcon />, color: '#f59e0b' },
                      { label: 'Post Announcement', icon: <AnnouncementIcon />, color: '#ef4444' },
                      { label: 'Upload Resource', icon: <ResourceIcon />, color: '#6b7280' },
                    ].map((action) => (
                      <Grid item xs={12} sm={6} md={3} key={action.label}>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={action.icon}
                          sx={{
                            py: 2,
                            borderColor: action.color,
                            color: action.color,
                            '&:hover': {
                              bgcolor: `${action.color}15`,
                              borderColor: action.color
                            }
                          }}
                        >
                          {action.label}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
