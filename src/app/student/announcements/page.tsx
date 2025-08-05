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
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Breadcrumbs,
  Link,
  Paper,
  Stack,
  Badge,
  Tooltip,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Announcement as AnnouncementIcon,
  Flag as PriorityIcon,
  Schedule as ScheduleIcon,
  Person as TeacherIcon,
  Subject as SubjectIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  MarkEmailRead as ReadIcon,
  MarkEmailUnread as UnreadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Star as StarIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Notifications as NotificationIcon,
  Class as ClassIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface Announcement {
  id: string;
  title: string;
  content: string;
  teacher: {
    name: string;
    avatar?: string;
  };
  subject?: string;
  className?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'published' | 'scheduled';
  createdAt: string;
  scheduledDate?: string;
  readAt?: string;
  isRead: boolean;
  tags: string[];
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

export default function StudentAnnouncementsPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [expandedAnnouncements, setExpandedAnnouncements] = useState<Set<string>>(new Set());
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  useEffect(() => {
    filterAndSearchAnnouncements();
  }, [announcements, filter, searchQuery, sortBy]);

  const loadAnnouncements = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/student/announcements', {
        credentials: 'include'
      });

      if (response.ok) {
        const announcementsData = await response.json();
        // Map the API response to our Announcement interface
        const mappedAnnouncements = announcementsData.map((announcement: any) => ({
          id: announcement.id,
          title: announcement.title,
          content: announcement.content,
          teacher: {
            name: announcement.teacher,
            avatar: undefined
          },
          subject: announcement.subject,
          className: 'Grade 10A', // This should come from student's class
          priority: announcement.priority,
          status: 'published',
          createdAt: announcement.createdAt,
          isRead: announcement.isRead,
          tags: announcement.tags,
          attachments: announcement.attachments
        }));
        setAnnouncements(mappedAnnouncements);
      } else if (response.status === 401) {
        router.push('/auth/login');
      } else {
        console.error('Failed to fetch announcements:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSearchAnnouncements = () => {
    let filtered = announcements;
    
    // Apply filters
    if (filter !== 'all') {
      if (filter === 'unread') {
        filtered = filtered.filter(a => !a.isRead);
      } else if (filter === 'read') {
        filtered = filtered.filter(a => a.isRead);
      } else {
        filtered = filtered.filter(a => a.priority === filter);
      }
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(announcement =>
        announcement.title.toLowerCase().includes(query) ||
        announcement.content.toLowerCase().includes(query) ||
        announcement.teacher.name.toLowerCase().includes(query) ||
        (announcement.subject && announcement.subject.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return 0;
    });

    setFilteredAnnouncements(filtered);
  };

  const toggleExpandAnnouncement = (id: string) => {
    setExpandedAnnouncements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const markAsRead = async (announcementId: string) => {
    try {
      // API call to mark as read
      setAnnouncements(prev => 
        prev.map(a => 
          a.id === announcementId 
            ? { ...a, isRead: true, readAt: new Date().toISOString() }
            : a
        )
      );
    } catch (error) {
      console.error('Error marking announcement as read:', error);
    }
  };

  const markAsUnread = async (announcementId: string) => {
    try {
      // API call to mark as unread
      setAnnouncements(prev => 
        prev.map(a => 
          a.id === announcementId 
            ? { ...a, isRead: false, readAt: undefined }
            : a
        )
      );
    } catch (error) {
      console.error('Error marking announcement as unread:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 3600);
    
    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${Math.round(diffHours)} hours ago`;
    } else if (diffHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getAnnouncementStats = () => {
    return {
      total: announcements.length,
      unread: announcements.filter(a => !a.isRead).length,
      read: announcements.filter(a => a.isRead).length,
      highPriority: announcements.filter(a => a.priority === 'high').length,
      mediumPriority: announcements.filter(a => a.priority === 'medium').length,
      lowPriority: announcements.filter(a => a.priority === 'low').length
    };
  };

  const stats = getAnnouncementStats();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link href="/student" underline="hover">Dashboard</Link>
        <Typography color="text.primary">Announcements</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight="bold">
          📢 Announcements
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Stay updated with the latest news from your teachers
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        sx={{ mb: 4, flexWrap: 'wrap' }}
      >
        <Card sx={{ textAlign: 'center', bgcolor: 'primary.main', color: 'white', flex: 1, minWidth: 150 }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
            <Typography variant="body2">Total</Typography>
          </CardContent>
        </Card>
        <Card sx={{ textAlign: 'center', bgcolor: 'warning.main', color: 'white', flex: 1, minWidth: 150 }}>
          <CardContent sx={{ py: 2 }}>
            <Badge badgeContent={stats.unread} color="error">
              <Typography variant="h4" fontWeight="bold">{stats.unread}</Typography>
            </Badge>
            <Typography variant="body2">Unread</Typography>
          </CardContent>
        </Card>
        <Card sx={{ textAlign: 'center', bgcolor: 'success.main', color: 'white', flex: 1, minWidth: 150 }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="h4" fontWeight="bold">{stats.read}</Typography>
            <Typography variant="body2">Read</Typography>
          </CardContent>
        </Card>
        <Card sx={{ textAlign: 'center', bgcolor: 'error.main', color: 'white', flex: 1, minWidth: 150 }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="h4" fontWeight="bold">{stats.highPriority}</Typography>
            <Typography variant="body2">High Priority</Typography>
          </CardContent>
        </Card>
        <Card sx={{ textAlign: 'center', bgcolor: 'warning.main', color: 'white', flex: 1, minWidth: 150 }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="h4" fontWeight="bold">{stats.mediumPriority}</Typography>
            <Typography variant="body2">Medium</Typography>
          </CardContent>
        </Card>
        <Card sx={{ textAlign: 'center', bgcolor: 'info.main', color: 'white', flex: 1, minWidth: 150 }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="h4" fontWeight="bold">{stats.lowPriority}</Typography>
            <Typography variant="body2">Low Priority</Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1 }}
            size="small"
          />
          
          <Button
            startIcon={<FilterIcon />}
            onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
            variant="outlined"
            size="small"
          >
            Filter: {filter === 'all' ? 'All' : filter.replace('-', ' ')}
          </Button>

          <Button
            startIcon={<SortIcon />}
            onClick={() => {
              const sortOptions = ['newest', 'oldest', 'priority', 'subject', 'teacher'];
              const currentIndex = sortOptions.indexOf(sortBy);
              const nextIndex = (currentIndex + 1) % sortOptions.length;
              setSortBy(sortOptions[nextIndex]);
            }}
            variant="outlined"
            size="small"
          >
            Sort: {sortBy}
          </Button>
        </Stack>

        <Menu
          anchorEl={filterMenuAnchor}
          open={Boolean(filterMenuAnchor)}
          onClose={() => setFilterMenuAnchor(null)}
        >
          {[
            { value: 'all', label: 'All Announcements' },
            { value: 'unread', label: 'Unread Only' },
            { value: 'read', label: 'Read Only' },
            { value: 'high-priority', label: 'High Priority' },
            { value: 'medium-priority', label: 'Medium Priority' },
            { value: 'low-priority', label: 'Low Priority' }
          ].map((option) => (
            <MenuItem
              key={option.value}
              onClick={() => {
                setFilter(option.value);
                setFilterMenuAnchor(null);
              }}
              selected={filter === option.value}
            >
              {option.label}
            </MenuItem>
          ))}
        </Menu>
      </Paper>

      {/* Announcements List */}
      <Stack spacing={2}>
        {filteredAnnouncements.map((announcement) => (
          <Card 
            key={announcement.id}
            sx={{ 
              transition: 'all 0.3s ease',
              border: announcement.isRead ? '1px solid rgba(0,0,0,0.12)' : '2px solid',
              borderColor: announcement.isRead ? 'rgba(0,0,0,0.12)' : 'primary.main',
              backgroundColor: announcement.isRead ? 'inherit' : 'primary.50',
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-2px)'
              }
            }}
          >
            <CardContent>
              {/* Header */}
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box flex={1}>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <Chip 
                      icon={<PriorityIcon />}
                      label={announcement.priority} 
                      color={getPriorityColor(announcement.priority) as any}
                      size="small"
                    />
                    {!announcement.isRead && (
                      <Chip label="New" color="primary" size="small" />
                    )}
                    {announcement.subject && (
                      <Chip label={announcement.subject} variant="outlined" size="small" />
                    )}
                  </Stack>
                  
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {announcement.title}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 24, height: 24 }} src={announcement.teacher.avatar}>
                        {announcement.teacher.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" color="text.secondary">
                        {announcement.teacher.name}
                      </Typography>
                    </Box>
                    
                    {announcement.className && (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <ClassIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {announcement.className}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <ScheduleIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(announcement.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Tooltip title={announcement.isRead ? 'Mark as unread' : 'Mark as read'}>
                    <IconButton
                      onClick={() => announcement.isRead ? markAsUnread(announcement.id) : markAsRead(announcement.id)}
                      color="primary"
                    >
                      {announcement.isRead ? <UnreadIcon /> : <ReadIcon />}
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title={expandedAnnouncements.has(announcement.id) ? 'Collapse' : 'Expand'}>
                    <IconButton
                      onClick={() => toggleExpandAnnouncement(announcement.id)}
                      color="primary"
                    >
                      {expandedAnnouncements.has(announcement.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>

              {/* Content Preview */}
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 2,
                  display: '-webkit-box',
                  WebkitLineClamp: expandedAnnouncements.has(announcement.id) ? 'none' : 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {announcement.content}
              </Typography>

              {/* Expanded Content */}
              <Collapse in={expandedAnnouncements.has(announcement.id)}>
                <Box>
                  {/* Tags */}
                  {announcement.tags.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Tags:
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {announcement.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Attachments */}
                  {announcement.attachments && announcement.attachments.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Attachments:
                      </Typography>
                      <Stack spacing={1}>
                        {announcement.attachments.map((attachment, index) => (
                          <Button
                            key={index}
                            variant="outlined"
                            size="small"
                            href={attachment.url}
                            target="_blank"
                            sx={{ justifyContent: 'flex-start' }}
                          >
                            {attachment.name}
                          </Button>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Read Status */}
                  {announcement.isRead && announcement.readAt && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        You read this on {new Date(announcement.readAt).toLocaleString()}
                      </Typography>
                    </Alert>
                  )}
                </Box>
              </Collapse>

              {/* Quick Actions */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                <Button
                  size="small"
                  onClick={() => toggleExpandAnnouncement(announcement.id)}
                  endIcon={expandedAnnouncements.has(announcement.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                >
                  {expandedAnnouncements.has(announcement.id) ? 'Show Less' : 'Show More'}
                </Button>
                
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setSelectedAnnouncement(announcement);
                    setAnnouncementDialogOpen(true);
                    if (!announcement.isRead) {
                      markAsRead(announcement.id);
                    }
                  }}
                >
                  View Details
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {filteredAnnouncements.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AnnouncementIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No announcements found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filter === 'all' 
              ? "You don&apos;t have any announcements yet."
              : `No ${filter.replace('-', ' ')} announcements at the moment.`
            }
          </Typography>
        </Paper>
      )}

      {/* Announcement Details Dialog */}
      <Dialog 
        open={announcementDialogOpen} 
        onClose={() => setAnnouncementDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedAnnouncement && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar src={selectedAnnouncement.teacher.avatar}>
                  {selectedAnnouncement.teacher.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedAnnouncement.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    By {selectedAnnouncement.teacher.name} • {formatDate(selectedAnnouncement.createdAt)}
                  </Typography>
                </Box>
                <Chip 
                  icon={<PriorityIcon />}
                  label={selectedAnnouncement.priority} 
                  color={getPriorityColor(selectedAnnouncement.priority) as any}
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph>
                {selectedAnnouncement.content}
              </Typography>
              
              {selectedAnnouncement.tags.length > 0 && (
                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tags:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {selectedAnnouncement.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </Box>
              )}

              {selectedAnnouncement.attachments && selectedAnnouncement.attachments.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Attachments:
                  </Typography>
                  <Stack spacing={1}>
                    {selectedAnnouncement.attachments.map((attachment, index) => (
                      <Button
                        key={index}
                        variant="outlined"
                        href={attachment.url}
                        target="_blank"
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        {attachment.name}
                      </Button>
                    ))}
                  </Stack>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAnnouncementDialogOpen(false)}>
                Close
              </Button>
              <Button 
                variant="contained"
                startIcon={<CheckIcon />}
                onClick={() => {
                  markAsRead(selectedAnnouncement.id);
                  setAnnouncementDialogOpen(false);
                }}
                disabled={selectedAnnouncement.isRead}
              >
                {selectedAnnouncement.isRead ? 'Already Read' : 'Mark as Read'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}
