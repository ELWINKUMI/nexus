'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Breadcrumbs,
  Link,
  Snackbar,
  CircularProgress,
  Avatar,
  Tooltip,
  Badge,
  Fab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Add as AddIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  Flag as PriorityIcon,
  Class as ClassIcon,
  Subject as SubjectIcon,
  Announcement as AnnouncementIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  Check as CheckIcon,
  AccessTime as AccessTimeIcon,
  Group as GroupIcon,
  Star as StarIcon,
  Drafts as DraftIcon,
  Public as PublicIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useRouter } from 'next/navigation';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  classId?: string;
  className?: string;
  subjectId?: string;
  subjectName?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduledDate?: Date | null;
  sentDate?: Date;
  status: 'draft' | 'scheduled' | 'sent';
  teacherId: string;
  readBy: string[];
  totalRecipients: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Class {
  id: string;
  name: string;
  studentCount: number;
}

interface Subject {
  _id: string;
  name: string;
  classCount: number;
}

export default function AnnouncementsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, announcement: null as Announcement | null });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    classId: '',
    subjectId: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    scheduledDate: null as Date | null,
    sendImmediately: true
  });

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchData();
    }
  }, [mounted]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [announcementsRes, classesRes, subjectsRes] = await Promise.all([
        fetch('/api/teacher/announcements', { credentials: 'include' }),
        fetch('/api/teacher/classes', { credentials: 'include' }),
        fetch('/api/teacher/subjects', { credentials: 'include' })
      ]);

      if (announcementsRes.ok) {
        const announcementsData = await announcementsRes.json();
        setAnnouncements(announcementsData);
      }

      if (classesRes.ok) {
        const classesData = await classesRes.json();
        setClasses(classesData);
      }

      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json();
        setSubjects(subjectsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setSnackbar({
        open: true,
        message: 'Error loading data. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setFormData({
      title: '',
      content: '',
      classId: '',
      subjectId: '',
      priority: 'normal',
      scheduledDate: null,
      sendImmediately: true
    });
    setEditingAnnouncement(null);
    setCreateDialogOpen(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      classId: announcement.classId || '',
      subjectId: announcement.subjectId || '',
      priority: announcement.priority,
      scheduledDate: announcement.scheduledDate || null,
      sendImmediately: !announcement.scheduledDate
    });
    setEditingAnnouncement(announcement);
    setCreateDialogOpen(true);
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    try {
      setIsSubmitting(true);

      const submitData = {
        ...formData,
        status: isDraft ? 'draft' : (formData.sendImmediately ? 'sent' : 'scheduled'),
        sentDate: formData.sendImmediately && !isDraft ? new Date() : undefined
      };

      console.log('Submitting announcement with data:', submitData);
      console.log('isDraft:', isDraft);
      console.log('sendImmediately:', formData.sendImmediately);
      console.log('Final status:', submitData.status);

      const url = editingAnnouncement 
        ? `/api/teacher/announcements/${editingAnnouncement._id}`
        : '/api/teacher/announcements';
      
      const method = editingAnnouncement ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: editingAnnouncement 
            ? 'Announcement updated successfully!' 
            : isDraft 
              ? 'Announcement saved as draft!' 
              : formData.sendImmediately 
                ? 'Announcement sent successfully!' 
                : 'Announcement scheduled successfully!',
          severity: 'success'
        });
        setCreateDialogOpen(false);
        fetchData();
      } else {
        const error = await response.json();
        setSnackbar({
          open: true,
          message: error.error || 'Failed to save announcement',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
      setSnackbar({
        open: true,
        message: 'Network error. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (announcementId: string) => {
    try {
      const response = await fetch(`/api/teacher/announcements/${announcementId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Announcement deleted successfully!',
          severity: 'success'
        });
        fetchData();
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to delete announcement',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      setSnackbar({
        open: true,
        message: 'Network error. Please try again.',
        severity: 'error'
      });
    } finally {
      setDeleteDialog({ open: false, announcement: null });
    }
  };

  const handleDeleteClick = (announcement: Announcement) => {
    setDeleteDialog({ open: true, announcement });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#dc2626';
      case 'high': return '#ea580c';
      case 'normal': return '#0891b2';
      case 'low': return '#059669';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return '#059669';
      case 'scheduled': return '#0891b2';
      case 'draft': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const formatDate = (date: Date | string) => {
    if (!mounted) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!mounted || isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link href="/teacher" underline="hover">Dashboard</Link>
          <Typography color="text.primary">Announcements</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
              <AnnouncementIcon sx={{ mr: 2, verticalAlign: 'middle', fontSize: 40 }} />
              Announcements
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Send important updates and notices to your students
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
            sx={{
              bgcolor: '#10b981',
              '&:hover': { bgcolor: '#059669' },
              borderRadius: 2,
              px: 3,
              py: 1.5
            }}
          >
            Create Announcement
          </Button>
        </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card sx={{ p: 2, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {announcements.filter(a => a.status === 'sent').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Sent
                </Typography>
              </Box>
              <PublicIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card sx={{ p: 2, background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {announcements.filter(a => a.status === 'scheduled').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Scheduled
                </Typography>
              </Box>
              <ScheduleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card sx={{ p: 2, background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {announcements.filter(a => a.status === 'draft').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Drafts
                </Typography>
              </Box>
              <DraftIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card sx={{ p: 2, background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {announcements.filter(a => a.priority === 'urgent' || a.priority === 'high').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  High Priority
                </Typography>
              </Box>
              <PriorityIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </Card>
        </Box>
      </Box>        {/* Announcements List */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <NotificationsIcon sx={{ mr: 1 }} />
              Recent Announcements
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {announcements.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <AnnouncementIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No announcements yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Create your first announcement to start communicating with your students.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateNew}
                  sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
                >
                  Create First Announcement
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {announcements.map((announcement) => (
                  <Box key={announcement._id} sx={{ width: '100%' }}>
                    <Card 
                      sx={{ 
                        border: (announcement.priority || 'normal') === 'urgent' ? '2px solid #dc2626' : '1px solid #e5e7eb',
                        borderLeft: `4px solid ${getPriorityColor(announcement.priority || 'normal')}`,
                        '&:hover': { boxShadow: 3 }
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {announcement.title}
                              </Typography>
                              <Chip
                                label={(announcement.priority || 'normal').toUpperCase()}
                                size="small"
                                sx={{
                                  bgcolor: getPriorityColor(announcement.priority || 'normal'),
                                  color: 'white',
                                  fontWeight: 'bold'
                                }}
                              />
                              <Chip
                                label={(announcement.status || 'draft').toUpperCase()}
                                size="small"
                                variant="outlined"
                                sx={{
                                  borderColor: getStatusColor(announcement.status || 'draft'),
                                  color: getStatusColor(announcement.status || 'draft')
                                }}
                              />
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {announcement.content.length > 150 
                                ? `${announcement.content.substring(0, 150)}...` 
                                : announcement.content}
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                              {announcement.className && (
                                <Chip
                                  icon={<ClassIcon />}
                                  label={announcement.className}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                              {announcement.subjectName && (
                                <Chip
                                  icon={<SubjectIcon />}
                                  label={announcement.subjectName}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                              <Chip
                                icon={<GroupIcon />}
                                label={`${announcement.readBy?.length || 0}/${announcement.totalRecipients || 0} read`}
                                size="small"
                                color={
                                  (announcement.readBy?.length || 0) === (announcement.totalRecipients || 0) 
                                    ? 'success' : 'default'
                                }
                              />
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right' }}>
                              {announcement.status === 'sent' && announcement.sentDate
                                ? `Sent: ${formatDate(announcement.sentDate)}`
                                : announcement.status === 'scheduled' && announcement.scheduledDate
                                ? `Scheduled: ${formatDate(announcement.scheduledDate)}`
                                : `Created: ${formatDate(announcement.createdAt)}`
                              }
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEdit(announcement)}
                                  sx={{ color: '#0891b2' }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteClick(announcement)}
                                  sx={{ color: '#dc2626' }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Announcement Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AnnouncementIcon sx={{ color: '#10b981' }} />
              <Typography variant="h6">
                {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
              </Typography>
            </Box>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Announcement Title *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter a clear and descriptive title"
                variant="outlined"
                required
              />
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
                  <FormControl fullWidth>
                    <InputLabel>Class (Optional)</InputLabel>
                    <Select
                      value={formData.classId}
                      onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                      label="Class (Optional)"
                    >
                      <MenuItem value="">
                        <em>All Classes</em>
                      </MenuItem>
                      {classes.map((cls) => (
                        <MenuItem key={cls.id} value={cls.id}>
                          {cls.name} ({cls.studentCount} students)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
                  <FormControl fullWidth>
                    <InputLabel>Subject (Optional)</InputLabel>
                    <Select
                      value={formData.subjectId}
                      onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                      label="Subject (Optional)"
                    >
                      <MenuItem value="">
                        <em>General Announcement</em>
                      </MenuItem>
                      {subjects.map((subject) => (
                        <MenuItem key={subject._id} value={subject._id}>
                          {subject.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={6}
                label="Announcement Content *"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your announcement message here..."
                variant="outlined"
                required
              />

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
                  <FormControl fullWidth>
                    <InputLabel>Priority Level</InputLabel>
                    <Select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      label="Priority Level"
                    >
                      <MenuItem value="low">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 12, height: 12, bgcolor: '#059669', borderRadius: '50%' }} />
                          Low Priority
                        </Box>
                      </MenuItem>
                      <MenuItem value="normal">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 12, height: 12, bgcolor: '#0891b2', borderRadius: '50%' }} />
                          Normal Priority
                        </Box>
                      </MenuItem>
                      <MenuItem value="high">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 12, height: 12, bgcolor: '#ea580c', borderRadius: '50%' }} />
                          High Priority
                        </Box>
                      </MenuItem>
                      <MenuItem value="urgent">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 12, height: 12, bgcolor: '#dc2626', borderRadius: '50%' }} />
                          Urgent
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.sendImmediately}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          sendImmediately: e.target.checked,
                          scheduledDate: e.target.checked ? null : formData.scheduledDate
                        })}
                      />
                    }
                    label="Send Immediately"
                  />
                </Box>
              </Box>

              {!formData.sendImmediately && (
                <DateTimePicker
                  label="Schedule Date & Time"
                  value={formData.scheduledDate}
                  onChange={(date) => setFormData({ ...formData, scheduledDate: date })}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      helperText: "Select when you want this announcement to be sent"
                    } 
                  }}
                  minDateTime={new Date()}
                />
              )}
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button
              onClick={() => setCreateDialogOpen(false)}
              startIcon={<CancelIcon />}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting || !formData.title || !formData.content}
              startIcon={isSubmitting ? <CircularProgress size={16} /> : <SaveIcon />}
              variant="outlined"
            >
              {isSubmitting ? 'Saving...' : 'Save as Draft'}
            </Button>
            <Button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting || !formData.title || !formData.content}
              startIcon={isSubmitting ? <CircularProgress size={16} /> : <SendIcon />}
              variant="contained"
              sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
            >
              {isSubmitting 
                ? 'Processing...' 
                : formData.sendImmediately 
                  ? 'Send Now' 
                  : 'Schedule Announcement'
              }
            </Button>
          </DialogActions>
        </Dialog>

        {/* Beautiful Deletion Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, announcement: null })}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              p: 1
            }
          }}
        >
          <DialogTitle 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              pb: 1
            }}
          >
            <Box
              sx={{
                backgroundColor: 'error.light',
                borderRadius: '50%',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <DeleteIcon sx={{ color: 'error.main', fontSize: '1.5rem' }} />
            </Box>
            <Typography component="span" variant="h6" sx={{ fontWeight: 600 }}>
              Delete Announcement
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 1 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to delete this announcement? This action cannot be undone.
            </Typography>
            
            {deleteDialog.announcement && (
              <Box
                sx={{
                  backgroundColor: 'grey.50',
                  borderRadius: 1,
                  p: 2,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  "{deleteDialog.announcement.title}"
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {deleteDialog.announcement.content?.substring(0, 100)}
                  {deleteDialog.announcement.content && deleteDialog.announcement.content.length > 100 ? '...' : ''}
                </Typography>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button
              onClick={() => setDeleteDialog({ open: false, announcement: null })}
              variant="outlined"
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteDialog.announcement && handleDelete(deleteDialog.announcement._id)}
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
            >
              Delete Announcement
            </Button>
          </DialogActions>
        </Dialog>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add announcement"
          onClick={handleCreateNew}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            bgcolor: '#10b981',
            '&:hover': { bgcolor: '#059669' }
          }}
        >
          <AddIcon />
        </Fab>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          message={snackbar.message}
        />
      </Box>
    </LocalizationProvider>
  );
}
