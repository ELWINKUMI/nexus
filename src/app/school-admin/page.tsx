'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  AppBar,
  Toolbar,
  Chip,
  Menu,
  MenuItem,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
  Checkbox,
  ListItemIcon,
} from '@mui/material';
import {
  Add as AddIcon,
  School as SchoolIcon,
  Class as ClassIcon,
  Subject as SubjectIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountCircle,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface ClassItem {
  id: string;
  name: string;
  schoolId: string;
  createdAt: string;
}

interface SubjectItem {
  id: string;
  name: string;
  description?: string;
  schoolId: string;
  createdAt: string;
}

interface TeacherItem {
  id: string;
  name: string;
  email: string;
  pin: string;
  subjectIds: string[];
  classIds: string[];
  schoolId: string;
  createdAt: string;
}

interface StudentItem {
  id: string;
  name: string;
  email: string;
  pin: string;
  classId: string;
  schoolId: string;
  createdAt: string;
}

export default function SchoolAdminDashboard() {
  const [isClient, setIsClient] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'class' | 'subject' | 'teacher' | 'student'>('class');
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteItem, setDeleteItem] = useState<{type: string, id: string, name: string} | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [user, setUser] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    subjectIds: [] as string[],
    classIds: [] as string[],
    classId: '',
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    // Mark as client-side mounted
    setIsClient(true);
    
    // Check authentication
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'schoolAdmin') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
    fetchClasses();
    fetchSubjects();
    fetchTeachers();
    fetchStudents();
  }, [router]);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/school-admin/classes');
      const data = await response.json();
      
      if (response.ok) {
        setClasses(data.classes);
      } else {
        setError(data.error || 'Failed to fetch classes');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/school-admin/subjects');
      const data = await response.json();
      
      if (response.ok) {
        setSubjects(data.subjects);
      } else {
        setError(data.error || 'Failed to fetch subjects');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/school-admin/teachers');
      const data = await response.json();
      
      if (response.ok) {
        setTeachers(data.teachers);
      } else {
        setError(data.error || 'Failed to fetch teachers');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/school-admin/students');
      const data = await response.json();
      
      if (response.ok) {
        setStudents(data.students);
      } else {
        setError(data.error || 'Failed to fetch students');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  // Helper function to show success message
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setOpenSuccessDialog(true);
  };

  // Helper function to show delete confirmation
  const showDeleteConfirmation = (type: string, id: string, name: string) => {
    setDeleteItem({ type, id, name });
    setOpenDeleteDialog(true);
  };

  // Handle confirmed deletion
  const handleConfirmDelete = async () => {
    if (!deleteItem) return;

    try {
      let endpoint = '';
      switch (deleteItem.type) {
        case 'class':
          endpoint = `/api/school-admin/classes/${deleteItem.id}`;
          break;
        case 'subject':
          endpoint = `/api/school-admin/subjects/${deleteItem.id}`;
          break;
        case 'teacher':
          endpoint = `/api/school-admin/teachers/${deleteItem.id}`;
          break;
        case 'student':
          endpoint = `/api/school-admin/students/${deleteItem.id}`;
          break;
      }

      const response = await fetch(endpoint, { method: 'DELETE' });
      
      if (response.ok) {
        // Refresh the appropriate data
        switch (deleteItem.type) {
          case 'class':
            fetchClasses();
            break;
          case 'subject':
            fetchSubjects();
            break;
          case 'teacher':
            fetchTeachers();
            break;
          case 'student':
            fetchStudents();
            break;
        }
        
        setOpenDeleteDialog(false);
        showSuccess(`${deleteItem.type.charAt(0).toUpperCase() + deleteItem.type.slice(1)} "${deleteItem.name}" has been deleted successfully.`);
      } else {
        const data = await response.json();
        setError(data.error || `Failed to delete ${deleteItem.type}`);
      }
    } catch (error) {
      setError('Network error occurred while deleting');
    }
    
    setDeleteItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let endpoint = '';
      let body: any = {};

      switch (dialogType) {
        case 'class':
          endpoint = '/api/school-admin/classes';
          body = { name: formData.name };
          break;
        case 'subject':
          endpoint = '/api/school-admin/subjects';
          body = { name: formData.name, description: formData.description };
          break;
        case 'teacher':
          endpoint = '/api/school-admin/teachers';
          body = {
            name: formData.name,
            email: formData.email,
            subjectIds: formData.subjectIds,
            classIds: formData.classIds
          };
          break;
        case 'student':
          endpoint = '/api/school-admin/students';
          body = {
            name: formData.name,
            email: formData.email,
            classId: formData.classId
          };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        const newUser = data.teacher || data.student;
        let message = '';
        
        if (dialogType === 'teacher' || dialogType === 'student') {
          message = `${dialogType.charAt(0).toUpperCase() + dialogType.slice(1)} "${formData.name}" created successfully!\n\nCredentials:\nID: ${newUser.id}\nPIN: ${newUser.pin}`;
        } else {
          message = `${dialogType.charAt(0).toUpperCase() + dialogType.slice(1)} "${formData.name}" created successfully!`;
        }
        
        resetForm();
        setOpenDialog(false);
        
        // Refresh appropriate data
        switch (dialogType) {
          case 'class':
            fetchClasses();
            break;
          case 'subject':
            fetchSubjects();
            break;
          case 'teacher':
            fetchTeachers();
            break;
          case 'student':
            fetchStudents();
            break;
        }
        
        showSuccess(message);
      } else {
        setError(data.error || 'Failed to create');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let endpoint = '';
      
      if (dialogType === 'class') {
        endpoint = `/api/school-admin/classes/${editingItem.id}`;
      } else if (dialogType === 'subject') {
        endpoint = `/api/school-admin/subjects/${editingItem.id}`;
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      const data = await response.json();

      if (response.ok) {
        setOpenEditDialog(false);
        setEditingItem(null);
        
        if (dialogType === 'class') {
          fetchClasses();
        } else {
          fetchSubjects();
        }
        
        showSuccess(`${dialogType.charAt(0).toUpperCase() + dialogType.slice(1)} "${editFormData.name}" updated successfully!`);
      } else {
        setError(data.error || 'Failed to update');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, type: 'class' | 'subject', name: string) => {
    showDeleteConfirmation(type, id, name);
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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      email: '',
      subjectIds: [],
      classIds: [],
      classId: '',
    });
  };

  const openCreateDialog = (type: 'class' | 'subject' | 'teacher' | 'student') => {
    setDialogType(type);
    setOpenDialog(true);
    resetForm();
    setError('');
    setSuccess('');
  };

  const openEditDialogHandler = (item: any, type: 'class' | 'subject') => {
    setEditingItem(item);
    setDialogType(type);
    setEditFormData({
      name: item.name,
      description: item.description || '',
    });
    setOpenEditDialog(true);
    setError('');
    setSuccess('');
  };

  const getSubjectNamesByIds = (subjectIds: string[]) => {
    if (!subjectIds || !Array.isArray(subjectIds) || subjectIds.length === 0) {
      return 'None assigned';
    }
    return subjects
      .filter(subject => subjectIds.includes(subject.id))
      .map(subject => subject.name)
      .join(', ') || 'None assigned';
  };

  const getClassNamesByIds = (classIds: string[]) => {
    if (!classIds || !Array.isArray(classIds) || classIds.length === 0) {
      return 'None assigned';
    }
    return classes
      .filter(cls => classIds.includes(cls.id))
      .map(cls => cls.name)
      .join(', ') || 'None assigned';
  };

  const getClassNameById = (classId: string) => {
    if (!classId) {
      return 'No class assigned';
    }
    const cls = classes.find(c => c.id === classId);
    return cls ? cls.name : 'Unknown Class';
  };

  if (!isClient || !user) {
    return null; // Loading or redirecting
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
              School Management
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
                School Administrator
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
            MANAGEMENT
          </Typography>
          
          <List sx={{ p: 0 }}>
            {[
              { label: 'Classes', icon: <ClassIcon />, index: 0 },
              { label: 'Subjects', icon: <SubjectIcon />, index: 1 },
              { label: 'Teachers', icon: <PersonIcon />, index: 2 },
              { label: 'Students', icon: <GroupsIcon />, index: 3 },
            ].map((item) => (
              <ListItem
                key={item.label}
                onClick={() => setTabValue(item.index)}
                sx={{
                  mx: 1,
                  mb: 1,
                  borderRadius: 2,
                  cursor: 'pointer',
                  bgcolor: tabValue === item.index ? 'rgba(255,255,255,0.15)' : 'transparent',
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
                    fontWeight: tabValue === item.index ? 'bold' : 'normal'
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
            {user?.schoolName || 'Dashboard'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back! Here&apos;s what&apos;s happening at your school today.
          </Typography>
        </Box>

        {/* Content Area */}
        <Box sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {/* Stats Cards */}
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 3,
            mb: 4
          }}>
            {[
              { 
                title: 'Classes', 
                value: classes.length, 
                icon: <ClassIcon />, 
                color: '#3b82f6',
                bgcolor: '#eff6ff'
              },
              { 
                title: 'Subjects', 
                value: subjects.length, 
                icon: <SubjectIcon />, 
                color: '#8b5cf6',
                bgcolor: '#f3e8ff'
              },
              { 
                title: 'Teachers', 
                value: teachers.length, 
                icon: <PersonIcon />, 
                color: '#10b981',
                bgcolor: '#ecfdf5'
              },
              { 
                title: 'Students', 
                value: students.length, 
                icon: <GroupsIcon />, 
                color: '#f59e0b',
                bgcolor: '#fffbeb'
              }
            ].map((stat, index) => (
              <Card key={stat.title} sx={{ 
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
            ))}
          </Box>

          {/* Management Content */}
          <Card sx={{ 
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            {/* Classes Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ p: 0 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 4,
                  pb: 3,
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 1 }}>
                      Classes Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create and manage classes for your school
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => openCreateDialog('class')}
                    sx={{
                      bgcolor: '#1e3a8a',
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      '&:hover': {
                        bgcolor: '#1e40af'
                      }
                    }}
                  >
                    Add New Class
                  </Button>
                </Box>

                {classes.length === 0 ? (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    color: 'text.secondary'
                  }}>
                    <ClassIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      No classes created yet
                    </Typography>
                    <Typography variant="body2">
                      Create your first class to get started with organizing your school
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 3
                  }}>
                    {classes.map((classItem) => (
                      <Card key={classItem.id} sx={{
                          p: 3,
                          border: '1px solid #e2e8f0',
                          borderRadius: 2,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                          }
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                              {classItem.name}
                            </Typography>
                            <Box>
                              <IconButton 
                                size="small"
                                onClick={() => openEditDialogHandler(classItem, 'class')}
                                sx={{ mr: 1 }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small"
                                onClick={() => handleDelete(classItem.id, 'class', classItem.name)}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Created: {new Date(classItem.createdAt).toLocaleDateString()}
                          </Typography>
                        </Card>
                    ))}
                  </Box>
                )}
              </Box>
            </TabPanel>

            {/* Subjects Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ p: 0 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 4,
                  pb: 3,
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 1 }}>
                      Subjects Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create and manage subjects for your school curriculum
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => openCreateDialog('subject')}
                    sx={{
                      bgcolor: '#8b5cf6',
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      '&:hover': {
                        bgcolor: '#7c3aed'
                      }
                    }}
                  >
                    Add New Subject
                  </Button>
                </Box>

                {subjects.length === 0 ? (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    color: 'text.secondary'
                  }}>
                    <SubjectIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      No subjects created yet
                    </Typography>
                    <Typography variant="body2">
                      Create your first subject to start building your curriculum
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 3
                  }}>
                    {subjects.map((subject) => (
                      <Card key={subject.id} sx={{
                          p: 3,
                          border: '1px solid #e2e8f0',
                          borderRadius: 2,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                          }
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                              {subject.name}
                            </Typography>
                            <Box>
                              <IconButton 
                                size="small"
                                onClick={() => openEditDialogHandler(subject, 'subject')}
                                sx={{ mr: 1 }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small"
                                onClick={() => handleDelete(subject.id, 'subject', subject.name)}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {subject.description || 'No description provided'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Created: {new Date(subject.createdAt).toLocaleDateString()}
                          </Typography>
                        </Card>
                    ))}
                  </Box>
                )}
              </Box>
            </TabPanel>

            {/* Teachers Tab */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ p: 0 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 4,
                  pb: 3,
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 1 }}>
                      Teachers Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage your school's teaching staff and their assignments
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => openCreateDialog('teacher')}
                    sx={{
                      bgcolor: '#10b981',
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      '&:hover': {
                        bgcolor: '#059669'
                      }
                    }}
                  >
                    Add New Teacher
                  </Button>
                </Box>

                {teachers.length === 0 ? (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    color: 'text.secondary'
                  }}>
                    <PersonIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      No teachers added yet
                    </Typography>
                    <Typography variant="body2">
                      Add your first teacher to start building your faculty
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 3
                  }}>
                    {teachers.map((teacher) => (
                      <Card key={teacher.id} sx={{
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
                            <AccountCircle sx={{ fontSize: 40, mr: 2, color: '#10b981' }} />
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                {teacher.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {teacher.email}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              ID: {teacher.id} | PIN: {teacher.pin || '****'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Subjects: {getSubjectNamesByIds(teacher.subjectIds || [])}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Classes: {getClassNamesByIds(teacher.classIds || [])}
                            </Typography>
                          </Box>
                        </Card>
                    ))}
                  </Box>
                )}
              </Box>
            </TabPanel>

            {/* Students Tab */}
            <TabPanel value={tabValue} index={3}>
              <Box sx={{ p: 0 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 4,
                  pb: 3,
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 1 }}>
                      Students Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage student enrollment and class assignments
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => openCreateDialog('student')}
                    sx={{
                      bgcolor: '#f59e0b',
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      '&:hover': {
                        bgcolor: '#d97706'
                      }
                    }}
                  >
                    Add New Student
                  </Button>
                </Box>

                {students.length === 0 ? (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    color: 'text.secondary'
                  }}>
                    <GroupsIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      No students enrolled yet
                    </Typography>
                    <Typography variant="body2">
                      Add your first student to start managing enrollments
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 3
                  }}>
                    {students.map((student) => (
                      <Card key={student.id} sx={{
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
                            <AccountCircle sx={{ fontSize: 40, mr: 2, color: '#f59e0b' }} />
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                {student.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {student.email}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              ID: {student.id} | PIN: {student.pin || '****'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Class: {getClassNameById(student.classId)}
                            </Typography>
                          </Box>
                        </Card>
                    ))}
                  </Box>
                )}
              </Box>
            </TabPanel>
          </Card>
        </Box>
      </Box>

      {/* Create Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 25px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #e2e8f0',
          pb: 2,
          mb: 0,
          fontWeight: 'bold', 
          color: '#1e293b'
        }}>
          Create New {dialogType.charAt(0).toUpperCase() + dialogType.slice(1)}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 'normal' }}>
            Fill in the details below to add a new {dialogType}
          </Typography>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              fullWidth
              label={`${dialogType.charAt(0).toUpperCase() + dialogType.slice(1)} Name`}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              margin="normal"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />

            {(dialogType === 'teacher' || dialogType === 'student') && (
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                margin="normal"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            )}

            {dialogType === 'subject' && (
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                margin="normal"
                multiline
                rows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            )}

            {dialogType === 'teacher' && (
              <>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Assign Subjects (Optional)</InputLabel>
                  <Select
                    multiple
                    value={formData.subjectIds}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      subjectIds: typeof e.target.value === 'string' 
                        ? e.target.value.split(',') 
                        : e.target.value 
                    }))}
                    renderValue={(selected) => 
                      subjects
                        .filter(subject => selected.includes(subject.id))
                        .map(subject => subject.name)
                        .join(', ')
                    }
                    sx={{
                      borderRadius: 2
                    }}
                  >
                    {subjects.map((subject) => (
                      <SelectMenuItem key={subject.id} value={subject.id}>
                        <Checkbox checked={formData.subjectIds.includes(subject.id)} />
                        <ListItemText primary={subject.name} />
                      </SelectMenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Assign Classes (Optional)</InputLabel>
                  <Select
                    multiple
                    value={formData.classIds}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      classIds: typeof e.target.value === 'string' 
                        ? e.target.value.split(',') 
                        : e.target.value 
                    }))}
                    renderValue={(selected) => 
                      classes
                        .filter(cls => selected.includes(cls.id))
                        .map(cls => cls.name)
                        .join(', ')
                    }
                    sx={{
                      borderRadius: 2
                    }}
                  >
                    {classes.map((cls) => (
                      <SelectMenuItem key={cls.id} value={cls.id}>
                        <Checkbox checked={formData.classIds.includes(cls.id)} />
                        <ListItemText primary={cls.name} />
                      </SelectMenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {dialogType === 'student' && (
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Assign Class</InputLabel>
                <Select
                  value={formData.classId}
                  onChange={(e) => setFormData(prev => ({ ...prev, classId: e.target.value }))}
                  sx={{
                    borderRadius: 2
                  }}
                >
                  {classes.map((cls) => (
                    <SelectMenuItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectMenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            borderTop: '1px solid #e2e8f0',
            p: 3,
            gap: 2
          }}>
            <Button 
              onClick={() => setOpenDialog(false)}
              sx={{
                textTransform: 'none',
                fontWeight: 'bold',
                px: 3,
                py: 1.5,
                borderRadius: 2
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              sx={{
                textTransform: 'none',
                fontWeight: 'bold',
                px: 3,
                py: 1.5,
                borderRadius: 2,
                bgcolor: '#1e3a8a',
                '&:hover': {
                  bgcolor: '#1e40af'
                }
              }}
            >
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={openEditDialog} 
        onClose={() => setOpenEditDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 25px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #e2e8f0',
          pb: 2,
          mb: 0,
          fontWeight: 'bold', 
          color: '#1e293b'
        }}>
          Edit {dialogType.charAt(0).toUpperCase() + dialogType.slice(1)}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 'normal' }}>
            Update the details below
          </Typography>
        </DialogTitle>
        <form onSubmit={handleEdit}>
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              fullWidth
              label={`${dialogType.charAt(0).toUpperCase() + dialogType.slice(1)} Name`}
              value={editFormData.name}
              onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
              margin="normal"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />

            {dialogType === 'subject' && (
              <TextField
                fullWidth
                label="Description"
                value={editFormData.description}
                onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                margin="normal"
                multiline
                rows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            )}
          </DialogContent>
          <DialogActions sx={{ 
            borderTop: '1px solid #e2e8f0',
            p: 3,
            gap: 2
          }}>
            <Button 
              onClick={() => setOpenEditDialog(false)}
              sx={{
                textTransform: 'none',
                fontWeight: 'bold',
                px: 3,
                py: 1.5,
                borderRadius: 2
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              sx={{
                textTransform: 'none',
                fontWeight: 'bold',
                px: 3,
                py: 1.5,
                borderRadius: 2,
                bgcolor: '#1e3a8a',
                '&:hover': {
                  bgcolor: '#1e40af'
                }
              }}
            >
              {loading ? 'Updating...' : 'Update'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Success Dialog */}
      <Dialog 
        open={openSuccessDialog} 
        onClose={() => setOpenSuccessDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            textAlign: 'center',
            py: 2
          }
        }}
      >
        <DialogContent sx={{ pt: 4, pb: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}
            >
              <Typography variant="h3" sx={{ color: 'white' }}>✓</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 1 }}>
              Success!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {successMessage}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            onClick={() => setOpenSuccessDialog(false)}
            variant="contained"
            sx={{
              textTransform: 'none',
              fontWeight: 'bold',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              bgcolor: '#10b981',
              '&:hover': {
                bgcolor: '#059669'
              }
            }}
          >
            Great!
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            textAlign: 'center',
            py: 2
          }
        }}
      >
        <DialogContent sx={{ pt: 4, pb: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}
            >
              <DeleteIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 1 }}>
              Confirm Deletion
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              Are you sure you want to delete this {deleteItem?.type}?
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ef4444' }}>
              "{deleteItem?.name}"
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              This action cannot be undone.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            variant="outlined"
            sx={{
              textTransform: 'none',
              fontWeight: 'bold',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              borderColor: '#d1d5db',
              color: '#6b7280',
              '&:hover': {
                borderColor: '#9ca3af',
                bgcolor: '#f9fafb'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            sx={{
              textTransform: 'none',
              fontWeight: 'bold',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              bgcolor: '#ef4444',
              '&:hover': {
                bgcolor: '#dc2626'
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
