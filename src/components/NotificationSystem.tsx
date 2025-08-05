'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Badge,
  IconButton,
  Popover,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Divider,
  Button,
  Chip,
  Avatar,
  Stack,
  Paper,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as ActiveIcon,
  Quiz as QuizIcon,
  Announcement as AnnouncementIcon,
  Grade as GradeIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  AccessTime as TimeIcon,
  CheckCircle as ReadIcon,
  Circle as UnreadIcon,
  Clear as ClearIcon,
  MarkEmailRead as MarkAllReadIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: 'quiz' | 'announcement' | 'grade' | 'assignment' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  sender?: {
    name: string;
    avatar?: string;
  };
  metadata?: {
    score?: number;
    dueDate?: string;
    subject?: string;
  };
}

interface NotificationSystemProps {
  userId?: string;
  onNotificationClick?: (notification: Notification) => void;
}

export default function NotificationSystem({ userId, onNotificationClick }: NotificationSystemProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);

  useEffect(() => {
    loadNotifications();
    
    // Set up real-time notifications
    if (realTimeEnabled) {
      const interval = setInterval(() => {
        checkForNewNotifications();
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [userId, realTimeEnabled]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'quiz',
          title: 'New Quiz Available',
          message: 'Physics Quiz - Motion and Forces is now available',
          timestamp: '2025-08-03T15:30:00Z',
          isRead: false,
          priority: 'medium',
          actionUrl: '/student/quizzes',
          sender: {
            name: 'Dr. Wilson',
            avatar: '/avatars/teacher3.jpg'
          },
          metadata: {
            subject: 'Physics'
          }
        },
        {
          id: '2',
          type: 'grade',
          title: 'Grade Posted',
          message: 'Your grade for Algebra Test has been posted',
          timestamp: '2025-08-03T14:20:00Z',
          isRead: false,
          priority: 'high',
          actionUrl: '/student/grades',
          sender: {
            name: 'Mr. Johnson',
            avatar: '/avatars/teacher1.jpg'
          },
          metadata: {
            score: 92,
            subject: 'Mathematics'
          }
        },
        {
          id: '3',
          type: 'announcement',
          title: 'Important: Schedule Change',
          message: 'Tomorrow\'s Chemistry class has been moved to 2:00 PM',
          timestamp: '2025-08-03T10:15:00Z',
          isRead: true,
          priority: 'high',
          actionUrl: '/student/announcements',
          sender: {
            name: 'Ms. Rodriguez',
            avatar: '/avatars/teacher5.jpg'
          },
          metadata: {
            subject: 'Chemistry'
          }
        },
        {
          id: '4',
          type: 'assignment',
          title: 'Assignment Due Soon',
          message: 'English Essay is due in 2 days',
          timestamp: '2025-08-03T09:00:00Z',
          isRead: false,
          priority: 'medium',
          actionUrl: '/student/assignments',
          sender: {
            name: 'Mrs. Thompson',
            avatar: '/avatars/teacher4.jpg'
          },
          metadata: {
            dueDate: '2025-08-05T23:59:00Z',
            subject: 'English'
          }
        },
        {
          id: '5',
          type: 'system',
          title: 'Welcome to NEXUS LMS',
          message: 'Complete your profile and explore the learning dashboard',
          timestamp: '2025-08-01T08:00:00Z',
          isRead: true,
          priority: 'low',
          actionUrl: '/student/profile'
        }
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewNotifications = async () => {
    try {
      // Mock checking for new notifications
      // In real implementation, this would poll the server
      console.log('Checking for new notifications...');
    } catch (error) {
      console.error('Error checking for new notifications:', error);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      // API call to mark as read
      // await fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      // API call to mark all as read
      // await fetch('/api/notifications/mark-all-read', { method: 'POST' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );
      
      // API call to delete notification
      // await fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (onNotificationClick) {
      onNotificationClick(notification);
    } else if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
    
    handleClose();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'quiz':
        return <QuizIcon color="primary" />;
      case 'announcement':
        return <AnnouncementIcon color="warning" />;
      case 'grade':
        return <GradeIcon color="success" />;
      case 'assignment':
        return <AssignmentIcon color="info" />;
      case 'system':
        return <SchoolIcon color="action" />;
      default:
        return <NotificationsIcon color="action" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton onClick={handleClick} color="inherit">
          <Badge badgeContent={unreadCount} color="error" max={99}>
            {unreadCount > 0 ? (
              <ActiveIcon sx={{ color: 'warning.main' }} />
            ) : (
              <NotificationsIcon />
            )}
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 400, maxHeight: 600 }
        }}
      >
        <Box>
          {/* Header */}
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="bold">
                Notifications
              </Typography>
              <Stack direction="row" spacing={1}>
                {unreadCount > 0 && (
                  <Tooltip title="Mark all as read">
                    <IconButton
                      size="small"
                      onClick={markAllAsRead}
                      sx={{ color: 'white' }}
                    >
                      <MarkAllReadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                <Chip
                  label={`${unreadCount} new`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Stack>
            </Stack>
          </Box>

          {/* Notifications List */}
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {loading ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <CircularProgress size={40} />
              </Box>
            ) : notifications.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No notifications yet
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {notifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItemButton
                      onClick={() => handleNotificationClick(notification)}
                      sx={{
                        bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                        '&:hover': {
                          bgcolor: 'action.selected'
                        }
                      }}
                    >
                      <ListItemIcon>
                        <Box sx={{ position: 'relative' }}>
                          {getNotificationIcon(notification.type)}
                          {!notification.isRead && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: -2,
                                right: -2,
                                width: 8,
                                height: 8,
                                bgcolor: 'error.main',
                                borderRadius: '50%'
                              }}
                            />
                          )}
                        </Box>
                      </ListItemIcon>

                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography
                              variant="subtitle2"
                              fontWeight={notification.isRead ? 'normal' : 'bold'}
                              sx={{ flex: 1 }}
                            >
                              {notification.title}
                            </Typography>
                            <Chip
                              label={notification.priority}
                              size="small"
                              color={getPriorityColor(notification.priority) as any}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                mb: 1
                              }}
                            >
                              {notification.message}
                            </Typography>
                            
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Box display="flex" alignItems="center" gap={1}>
                                {notification.sender && (
                                  <>
                                    <Avatar
                                      sx={{ width: 16, height: 16 }}
                                      src={notification.sender.avatar}
                                    >
                                      {notification.sender.name.charAt(0)}
                                    </Avatar>
                                    <Typography variant="caption" color="text.secondary">
                                      {notification.sender.name}
                                    </Typography>
                                  </>
                                )}
                                {notification.metadata?.subject && (
                                  <>
                                    <Typography variant="caption" color="text.secondary">
                                      •
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {notification.metadata.subject}
                                    </Typography>
                                  </>
                                )}
                              </Box>
                              
                              <Typography variant="caption" color="text.secondary">
                                {formatTimeAgo(notification.timestamp)}
                              </Typography>
                            </Stack>

                            {notification.metadata?.score && (
                              <Chip
                                label={`Score: ${notification.metadata.score}%`}
                                size="small"
                                color={notification.metadata.score >= 80 ? 'success' : 'warning'}
                                variant="outlined"
                                sx={{ mt: 1 }}
                              />
                            )}
                          </Box>
                        }
                      />

                      <Box sx={{ ml: 1 }}>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItemButton>
                    {index < notifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>

          {/* Footer */}
          {notifications.length > 0 && (
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={() => {
                  router.push('/student/notifications');
                  handleClose();
                }}
              >
                View All Notifications
              </Button>
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
}
