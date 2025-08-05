'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Avatar,
  Paper,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  LinearProgress,
  Badge,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Quiz as QuizIcon,
  Announcement as AnnouncementIcon,
  Folder as ResourceIcon,
  Grade as GradeIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Star as StarIcon,
  TrendingUp as ProgressIcon,
  AccessTime as TimeIcon,
  CheckCircle as CompletedIcon,
  Warning as PendingIcon,
  PlayCircle as PlayIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  BarChart as ChartIcon,
  Book as BookIcon,
  Message as MessageIcon,
  Help as HelpIcon,
  Settings as SettingsIcon,
  AccountCircle as ProfileIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Subject as SubjectIcon,
  MenuBook as MenuBookIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import NotificationSystem from '@/components/NotificationSystem';

interface DashboardStats {
  totalQuizzes: number;
  completedQuizzes: number;
  averageScore: number;
  totalAnnouncements: number;
  unreadAnnouncements: number;
  totalResources: number;
  recentDownloads: number;
  currentGrade: string;
  attendancePercentage: number;
  pendingAssignments: number;
  upcomingDeadlines: number;
}

interface RecentActivity {
  id: string;
  type: 'quiz' | 'announcement' | 'resource' | 'grade' | 'assignment';
  title: string;
  description: string;
  timestamp: string;
  status?: 'completed' | 'pending' | 'new';
  score?: number;
  icon: React.ReactNode;
  action: string;
  actionUrl: string;
}

interface UpcomingItem {
  id: string;
  type: 'quiz' | 'assignment' | 'announcement' | 'event';
  title: string;
  subject: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  completed?: boolean;
  description?: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  url: string;
  badge?: number;
}

export default function EnhancedStudentDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [upcomingItems, setUpcomingItems] = useState<UpcomingItem[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    loadDashboardData();
    
    // Initialize current time on client side to avoid hydration issues
    setCurrentTime(new Date());
    
    // Check if this is first visit
    const hasVisited = localStorage.getItem(`student-${parsedUser.id}-visited`);
    if (!hasVisited) {
      setShowWelcomeDialog(true);
      localStorage.setItem(`student-${parsedUser.id}-visited`, 'true');
    }
    
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, [router]);

  const loadDashboardData = async () => {
    try {
      // Load real dashboard data from API
      const response = await fetch('/api/student/dashboard', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to load dashboard data');
      }

      const dashboardData = await response.json();
      
      // Set user data
      setUser({
        id: dashboardData.student.id,
        name: dashboardData.student.name,
        email: dashboardData.student.email,
        role: 'student',
        className: dashboardData.student.className
      });

      // No stats - removed completely
      setStats({
        totalQuizzes: 0,
        completedQuizzes: 0,
        averageScore: 0,
        totalAnnouncements: 0,
        unreadAnnouncements: 0,
        totalResources: 0,
        recentDownloads: 0,
        currentGrade: '',
        attendancePercentage: 0,
        pendingAssignments: 0,
        upcomingDeadlines: 0
      });

      const mockRecentActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'quiz',
          title: 'Recent Quiz Activity',
          description: 'Check your quiz results',
          timestamp: '2025-08-03T14:30:00Z',
          status: 'completed',
          icon: <QuizIcon color="primary" />,
          action: 'View Quizzes',
          actionUrl: '/student/quizzes'
        },
        {
          id: '2',
          type: 'announcement',
          title: 'Stay Updated',
          description: 'Check for new announcements',
          timestamp: '2025-08-03T11:15:00Z',
          status: 'new',
          icon: <AnnouncementIcon color="warning" />,
          action: 'View Announcements',
          actionUrl: '/student/announcements'
        },
        {
          id: '3',
          type: 'resource',
          title: 'Learning Resources',
          description: 'Access your study materials',
          timestamp: '2025-08-03T09:45:00Z',
          status: 'new',
          icon: <ResourceIcon color="success" />,
          action: 'Browse Resources',
          actionUrl: '/student/resources'
        }
      ];
      
      const mockUpcomingItems: UpcomingItem[] = [
        {
          id: '1',
          type: 'quiz',
          title: 'Upcoming Quiz',
          subject: 'General',
          dueDate: '2025-08-05T14:00:00Z',
          priority: 'high',
          description: 'Check your quiz schedule'
        },
        {
          id: '2',
          type: 'assignment',
          title: 'Assignment Due',
          subject: 'General',
          dueDate: '2025-08-07T23:59:00Z',
          priority: 'medium',
          description: 'Check your assignments'
        }
      ];

      const mockQuickActions: QuickAction[] = [
        {
          id: 'quizzes',
          title: 'Take Quiz',
          description: 'Start available quizzes',
          icon: <QuizIcon />,
          color: '#1976d2',
          url: '/student/quizzes',
          badge: 0
        },
        {
          id: 'resources',
          title: 'Study Materials',
          description: 'Access learning resources',
          icon: <ResourceIcon />,
          color: '#388e3c',
          url: '/student/resources',
          badge: 0
        },
        {
          id: 'announcements',
          title: 'Announcements',
          description: 'Check latest updates',
          icon: <AnnouncementIcon />,
          color: '#f57c00',
          url: '/student/announcements',
          badge: 0
        },
        {
          id: 'grades',
          title: 'My Grades',
          description: 'View academic progress',
          icon: <GradeIcon />,
          color: '#7b1fa2',
          url: '/student/grades'
        },
        {
          id: 'schedule',
          title: 'Class Schedule',
          description: 'View timetable',
          icon: <ScheduleIcon />,
          color: '#0288d1',
          url: '/student/schedule'
        },
        {
          id: 'assignments',
          title: 'Assignments',
          description: 'View assignments',
          icon: <AssignmentIcon />,
          color: '#43e97b',
          url: '/student/assignments',
          badge: 0
        }
      ];

      setRecentActivity(mockRecentActivity);
      setUpcomingItems(mockUpcomingItems);
      setQuickActions(mockQuickActions);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setIsLoading(false);
      // Fallback to basic setup
      setUser({ id: 'student', name: 'Student', email: '', role: 'student' });
      setStats({
        totalQuizzes: 0,
        completedQuizzes: 0,
        averageScore: 0,
        totalAnnouncements: 0,
        unreadAnnouncements: 0,
        totalResources: 0,
        recentDownloads: 0,
        currentGrade: '',
        attendancePercentage: 0,
        pendingAssignments: 0,
        upcomingDeadlines: 0
      });
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (date.getTime() - now.getTime()) / (1000 * 3600);
    
    if (diffHours < 24 && diffHours > 0) {
      return `${Math.round(diffHours)} hours`;
    } else if (diffHours < 48 && diffHours > 0) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        weekday: 'short'
      });
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 3600);
    
    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${Math.round(diffHours)}h ago`;
    } else {
      return `${Math.round(diffHours / 24)}d ago`;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getGreeting = () => {
    if (!currentTime) return 'Hello'; // Fallback during initial render
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (isLoading || !stats || !user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      {/* Enhanced Sidebar */}
      <Box sx={{
        width: sidebarCollapsed ? 80 : 280,
        bgcolor: '#1e3a8a',
        color: 'white',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
        transition: 'width 0.3s ease',
        zIndex: 1200
      }}>
        {/* Logo */}
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {!sidebarCollapsed ? (
            <Stack direction="row" alignItems="center" gap={2}>
              <SchoolIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">NEXUS LMS</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>Student Portal</Typography>
              </Box>
            </Stack>
          ) : (
            <Box textAlign="center">
              <SchoolIcon sx={{ fontSize: 40 }} />
            </Box>
          )}
        </Box>

        {/* User Info */}
        {!sidebarCollapsed && (
          <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)', bgcolor: 'rgba(255,255,255,0.05)' }}>
            <Stack direction="row" alignItems="center" gap={2}>
              <Avatar sx={{ width: 48, height: 48, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">{user.name}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>Student ID: {user.id}</Typography>
                <Typography variant="caption" sx={{ display: 'block', opacity: 0.7 }}>
                  Class: Grade 10A
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}

        {/* Navigation */}
        <Box sx={{ p: 2 }}>
          <List sx={{ p: 0 }}>
            {[
              { label: 'Dashboard', icon: <DashboardIcon />, path: '/student', active: true },
              { label: 'My Subjects', icon: <SubjectIcon />, path: '/student/subjects' },
              { label: 'Quizzes', icon: <QuizIcon />, path: '/student/quizzes', badge: 4 },
              { label: 'Resources', icon: <ResourceIcon />, path: '/student/resources', badge: 6 },
              { label: 'Announcements', icon: <AnnouncementIcon />, path: '/student/announcements', badge: stats.unreadAnnouncements },
              { label: 'Assignments', icon: <AssignmentIcon />, path: '/student/assignments', badge: stats.pendingAssignments },
              { label: 'Grades', icon: <GradeIcon />, path: '/student/grades' },
              { label: 'Schedule', icon: <ScheduleIcon />, path: '/student/schedule' }
            ].map((item) => (
              <ListItemButton
                key={item.label}
                onClick={() => router.push(item.path)}
                sx={{
                  mx: 1,
                  mb: 1,
                  borderRadius: 2,
                  bgcolor: item.active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                  transition: 'all 0.2s ease',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: sidebarCollapsed ? 0 : 40 }}>
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                </ListItemIcon>
                {!sidebarCollapsed && (
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.95rem',
                      fontWeight: item.active ? 'bold' : 'normal'
                    }}
                  />
                )}
              </ListItemButton>
            ))}
          </List>

          {/* Settings & Logout */}
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />
            <Stack spacing={1}>
              <Button
                startIcon={<SettingsIcon />}
                onClick={() => router.push('/student/settings')}
                sx={{ color: 'white', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}
              >
                {!sidebarCollapsed && 'Settings'}
              </Button>
              <Button
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{ color: 'white', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}
              >
                {!sidebarCollapsed && 'Logout'}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        ml: sidebarCollapsed ? '80px' : '280px',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Header */}
        <Paper sx={{
          p: 3,
          bgcolor: 'white',
          borderRadius: 0,
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {getGreeting()}, {user.name}! 👋
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {currentTime ? currentTime.toLocaleDateString([], { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : 'Loading...'} • {currentTime ? formatTime(currentTime) : ''}
              </Typography>
            </Box>
            
            <Stack direction="row" alignItems="center" spacing={2}>
              <NotificationSystem userId={user.id} />
              <Tooltip title="Help & Support">
                <IconButton onClick={() => router.push('/student/help')}>
                  <HelpIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Profile">
                <IconButton onClick={() => router.push('/student/profile')}>
                  <ProfileIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Paper>

        {/* Dashboard Content */}
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Quick Actions */}
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {quickActions.map((action) => (
              <Grid item xs={6} sm={4} md={2} key={action.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    }
                  }}
                  onClick={() => router.push(action.url)}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Badge badgeContent={action.badge} color="error">
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        bgcolor: `${action.color}15`,
                        color: action.color,
                        mb: 2,
                        display: 'inline-flex'
                      }}>
                        {action.icon}
                      </Box>
                    </Badge>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      {action.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {action.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            {/* Recent Activity */}
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Recent Activity
                  </Typography>
                  
                  <List>
                    {recentActivity.map((activity, index) => (
                      <React.Fragment key={activity.id}>
                        <ListItemButton
                          onClick={() => router.push(activity.actionUrl)}
                          sx={{ borderRadius: 2, mb: 1 }}
                        >
                          <ListItemIcon>
                            <Avatar sx={{ bgcolor: 'transparent' }}>
                              {activity.icon}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Stack direction="row" alignItems="center" gap={1}>
                                <Typography variant="subtitle1" fontWeight="medium">
                                  {activity.title}
                                </Typography>
                                {activity.status === 'new' && (
                                  <Chip label="New" size="small" color="error" />
                                )}
                                {activity.score && (
                                  <Chip 
                                    label={`${activity.score}%`} 
                                    size="small" 
                                    color={activity.score >= 80 ? 'success' : activity.score >= 60 ? 'warning' : 'error'}
                                  />
                                )}
                              </Stack>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {activity.description}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {getTimeAgo(activity.timestamp)}
                                </Typography>
                              </Box>
                            }
                          />
                          <Button size="small" variant="outlined">
                            {activity.action}
                          </Button>
                        </ListItemButton>
                        {index < recentActivity.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Upcoming Items */}
            <Grid item xs={12} lg={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Upcoming Deadlines
                  </Typography>
                  
                  <List>
                    {upcomingItems.slice(0, 5).map((item, index) => (
                      <React.Fragment key={item.id}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            {item.type === 'quiz' ? <QuizIcon color="primary" /> :
                             item.type === 'assignment' ? <AssignmentIcon color="info" /> :
                             item.type === 'event' ? <CalendarIcon color="warning" /> :
                             <AnnouncementIcon color="warning" />}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle2" fontWeight="medium">
                                  {item.title}
                                </Typography>
                                <Chip 
                                  label={item.priority} 
                                  size="small" 
                                  color={getPriorityColor(item.priority) as any}
                                  variant="outlined"
                                />
                              </Stack>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {item.subject}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Due in {formatDate(item.dueDate)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < Math.min(upcomingItems.length - 1, 4) && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                  
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<CalendarIcon />}
                    sx={{ mt: 2 }}
                    onClick={() => router.push('/student/schedule')}
                  >
                    View Full Schedule
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Welcome Dialog */}
      <Dialog open={showWelcomeDialog} onClose={() => setShowWelcomeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              <SchoolIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Welcome to NEXUS LMS!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your learning journey starts here
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Hello {user.name}! We&apos;re excited to have you in the NEXUS Learning Management System. 
            Here&apos;s what you can do:
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon><QuizIcon color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Take Interactive Quizzes" 
                secondary="Test your knowledge with timed quizzes and instant feedback"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><ResourceIcon color="success" /></ListItemIcon>
              <ListItemText 
                primary="Access Study Materials" 
                secondary="Download resources, documents, and learning materials"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><AnnouncementIcon color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Stay Updated" 
                secondary="Receive real-time notifications and announcements"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><GradeIcon color="info" /></ListItemIcon>
              <ListItemText 
                primary="Track Your Progress" 
                secondary="Monitor grades, attendance, and academic performance"
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWelcomeDialog(false)} variant="contained" size="large">
            Get Started
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="help"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => router.push('/student/help')}
      >
        <HelpIcon />
      </Fab>
    </Box>
  );
}
