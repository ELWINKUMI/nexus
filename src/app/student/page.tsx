'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Chip,
  Paper,
  Grid,
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
  Grade as GradeIcon,
  Schedule as ScheduleIcon,
  PlayArrow as StartIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface DashboardData {
  student: {
    id: string;
    name: string;
    email: string;
    className: string;
  };
  subjects: Array<{
    id: string;
    name: string;
    teacher: string;
    color: string;
  }>;
  assignments: Array<{
    id: string;
    title: string;
    subject: string;
    dueDate: string;
    status: string;
  }>;
  quizzes: Array<{
    id: string;
    title: string;
    subject: string;
    timeLimit: number;
    questions: number;
  }>;
}

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
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
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/student/dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (!user || loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: '#f5f7fa'
      }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

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
              Student Portal
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
                Student
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', opacity: 0.7 }}>
                ID: {user?.id}
              </Typography>
<<<<<<< HEAD
=======
              {dashboardData?.student?.schoolName && (
                <Typography variant="caption" sx={{ display: 'block', opacity: 0.7 }}>
                  School: {dashboardData.student.schoolName}
                </Typography>
              )}
>>>>>>> 99ca4a1 (Initial commit)
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
            LEARNING CENTER
          </Typography>
          
          <List sx={{ p: 0 }}>
            {[
              { label: 'Dashboard', icon: <SchoolIcon />, active: true, path: '/student' },
              { label: 'My Subjects', icon: <SubjectIcon />, path: '/student/subjects' },
              { label: 'Assignments', icon: <AssignmentIcon />, path: '/student/assignments' },
              { label: 'Quizzes', icon: <QuizIcon />, path: '/student/quizzes' },
              { label: 'Grades', icon: <GradeIcon />, path: '/student/grades' },
              { label: 'Schedule', icon: <ScheduleIcon />, path: '/student/schedule' },
              { label: 'Resources', icon: <ResourceIcon />, path: '/student/resources' },
              { label: 'Announcements', icon: <AnnouncementIcon />, path: '/student/announcements' },
            ].map((item, index) => (
              <ListItem
                key={item.label}
                onClick={() => router.push(item.path)}
                sx={{
                  mx: 1,
                  mb: 1,
                  borderRadius: 2,
                  bgcolor: item.active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)'
                  },
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: item.active ? 'bold' : 'normal'
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
            Continue your learning journey and track your progress
          </Typography>
        </Box>

        {/* Content Area */}
        <Box sx={{ p: 4 }}>
          {/* Stats Cards Removed */}

          <Grid container spacing={3}>
            {/* My Subjects */}
            <Grid item xs={12} lg={8}>
              <Card sx={{ 
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                mb: 3
              }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                    My Subjects
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Track your progress across all subjects
                  </Typography>
                </Box>
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    {!dashboardData?.subjects || dashboardData.subjects.length === 0 ? (
                      <Grid item xs={12}>
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <SubjectIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
                          <Typography variant="body2" color="text.secondary">
                            No subjects assigned yet
                          </Typography>
                        </Box>
                      </Grid>
                    ) : (
                      dashboardData.subjects.map((subject) => (
                      <Grid item xs={12} sm={6} key={subject.id}>
                        <Card sx={{
                          p: 3,
                          border: '1px solid #e2e8f0',
                          borderRadius: 2,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                          }
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: `${subject.color}15`,
                              color: subject.color,
                              mr: 2
                            }}>
                              <SubjectIcon />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                {subject.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {subject.teacher}
                              </Typography>
                            </Box>
                          </Box>
                        </Card>
                      </Grid>
                    ))
                    )}
                  </Grid>
                </Box>
              </Card>

              {/* Pending Assignments */}
              <Card sx={{ 
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                    Pending Assignments
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Complete your assignments before the due date
                  </Typography>
                </Box>
                <Box sx={{ p: 3 }}>
                  {!dashboardData?.assignments || dashboardData.assignments.filter(a => a.status === 'pending').length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
                      <Typography variant="body2" color="text.secondary">
                        No pending assignments
                      </Typography>
                    </Box>
                  ) : (
                    <List sx={{ p: 0 }}>
                      {dashboardData.assignments.filter(a => a.status === 'pending').map((assignment) => (
                        <ListItem 
                          key={assignment.id}
                          sx={{ 
                            px: 0,
                            py: 2,
                            borderBottom: '1px solid #f1f5f9',
                            '&:last-child': { borderBottom: 'none' }
                          }}
                        >
                          <ListItemIcon>
                            <AssignmentIcon color="warning" />
                          </ListItemIcon>
                          <ListItemText
                            primary={assignment.title}
                            secondary={`${assignment.subject} • Due: ${new Date(assignment.dueDate).toLocaleDateString()}`}
                            primaryTypographyProps={{ fontWeight: 'bold' }}
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<StartIcon />}
                            sx={{
                              borderColor: '#f59e0b',
                              color: '#f59e0b',
                              '&:hover': {
                                bgcolor: '#fffbeb'
                              }
                            }}
                          >
                            Start
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </Card>
            </Grid>

            {/* Sidebar Content */}
            <Grid item xs={12} lg={4}>
              {/* Available Quizzes */}
              <Card sx={{ 
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                mb: 3
              }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                    Available Quizzes
                  </Typography>
                </Box>
                <Box sx={{ p: 3 }}>
                  {!dashboardData?.quizzes || dashboardData.quizzes.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <QuizIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
                      <Typography variant="body2" color="text.secondary">
                        No quizzes available
                      </Typography>
                    </Box>
                  ) : (
                    <List sx={{ p: 0 }}>
                      {dashboardData.quizzes.map((quiz) => (
                        <ListItem 
                          key={quiz.id}
                          sx={{ 
                            px: 0,
                            py: 2,
                            borderBottom: '1px solid #f1f5f9',
                            '&:last-child': { borderBottom: 'none' }
                          }}
                        >
                          <Paper sx={{ 
                            p: 2, 
                            width: '100%',
                            bgcolor: '#f8fafc',
                            border: '1px solid #e2e8f0'
                          }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                              {quiz.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {quiz.subject}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                              <Chip 
                                label={`${quiz.timeLimit} min`} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                              <Chip 
                                label={`${quiz.questions} questions`} 
                                size="small" 
                                color="secondary" 
                                variant="outlined"
                              />
                            </Box>
                            <Button
                              variant="contained"
                              fullWidth
                              startIcon={<StartIcon />}
                              sx={{
                                bgcolor: '#10b981',
                                '&:hover': {
                                  bgcolor: '#059669'
                                }
                              }}
                            >
                              Start Quiz
                            </Button>
                          </Paper>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </Card>

              {/* Recent Announcements */}
              <Card sx={{ 
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                    Recent Announcements
                  </Typography>
                </Box>
                <Box sx={{ p: 3 }}>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <AnnouncementIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
                    <Typography variant="body2" color="text.secondary">
                      No recent announcements
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
