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
  IconButton,
  Breadcrumbs,
  Link,
  Paper,
  Stack,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  LinearProgress,
  Alert,
  Tooltip,
  Badge,
  CardHeader,
  CardActions
} from '@mui/material';
import {
  Subject as SubjectIcon,
  Person as TeacherIcon,
  Class as ClassIcon,
  Search as SearchIcon,
  Quiz as QuizIcon,
  Announcement as AnnouncementIcon,
  Folder as ResourceIcon,
  Assignment as AssignmentIcon,
  Grade as GradeIcon,
  Schedule as ScheduleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Info as InfoIcon,
  Book as BookIcon,
  School as SchoolIcon,
  ArrowForward as ArrowForwardIcon,
  Dashboard as DashboardIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface Subject {
  id: string;
  name: string;
  description?: string;
  code?: string;
  teacher: {
    id: string;
    name: string;
    email: string;
  } | null;
  className: string;
}

export default function StudentSubjectsPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    filterSubjects();
  }, [searchQuery, subjects]);

  const loadSubjects = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/student/subjects', {
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/');
          return;
        }
        throw new Error(`Failed to load subjects: ${response.status}`);
      }

      const data = await response.json();
      console.log('Subjects data:', data);

      if (data.success) {
        setSubjects(data.subjects || []);
        setClassName(data.className || '');
      } else {
        setError(data.error || 'Failed to load subjects');
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
      setError('Failed to load subjects. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterSubjects = () => {
    if (!searchQuery.trim()) {
      setFilteredSubjects(subjects);
      return;
    }

    const filtered = subjects.filter(subject =>
      (subject.name && subject.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (subject.code && subject.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (subject.teacher?.name && subject.teacher.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (subject.description && subject.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    setFilteredSubjects(filtered);
  };

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setSubjectDialogOpen(true);
  };

  const getSubjectActions = (subjectId: string) => [
    {
      label: 'View Quizzes',
      icon: <QuizIcon />,
      action: () => router.push(`/student/quizzes?subject=${subjectId}`),
      color: 'primary' as const
    },
    {
      label: 'Announcements',
      icon: <AnnouncementIcon />,
      action: () => router.push(`/student/announcements?subject=${subjectId}`),
      color: 'info' as const
    },
    {
      label: 'Resources',
      icon: <ResourceIcon />,
      action: () => router.push(`/student/resources?subject=${subjectId}`),
      color: 'success' as const
    }
  ];

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ width: '100%', mb: 4 }}>
          <LinearProgress />
        </Box>
        <Typography variant="h6" align="center" color="text.secondary">
          Loading your subjects...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          href="/student/dashboard"
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <DashboardIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <SubjectIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          My Subjects
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
              My Subjects
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {className && `Class: ${className} • `}
              {filteredSubjects.length} subject{filteredSubjects.length !== 1 ? 's' : ''} available
            </Typography>
          </Box>
          <SchoolIcon sx={{ fontSize: 60, opacity: 0.3 }} />
        </Box>
      </Paper>

      {/* Search */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search subjects by name, code, or teacher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiInputBase-root': {
              bgcolor: 'background.paper',
              boxShadow: 1,
            }
          }}
        />
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Subjects Grid */}
      {filteredSubjects.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <SubjectIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchQuery ? 'No subjects found' : 'No subjects available'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery 
              ? 'Try adjusting your search terms.'
              : 'Contact your teacher or administrator if you believe this is an error.'
            }
          </Typography>
          {searchQuery && (
            <Button
              variant="outlined"
              onClick={() => setSearchQuery('')}
              sx={{ mt: 2 }}
            >
              Clear Search
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredSubjects.map((subject) => (
            <Grid item xs={12} md={6} lg={4} key={subject.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                  cursor: 'pointer'
                }}
                onClick={() => handleSubjectClick(subject)}
              >
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <SubjectIcon />
                    </Avatar>
                  }
                  title={
                    <Typography variant="h6" component="div" noWrap>
                      {subject.name}
                    </Typography>
                  }
                  subheader={
                    <Chip 
                      label={subject.code} 
                      size="small" 
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  }
                />
                
                <CardContent sx={{ flexGrow: 1, pt: 0 }}>
                  {subject.description && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {subject.description.length > 100 
                        ? `${subject.description.substring(0, 100)}...`
                        : subject.description
                      }
                    </Typography>
                  )}
                  
                  {subject.teacher && (
                    <Box display="flex" alignItems="center" mt={2}>
                      <TeacherIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {subject.teacher.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Teacher
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Stack direction="row" spacing={1} width="100%">
                    {getSubjectActions(subject.id).map((action, index) => (
                      <Button
                        key={index}
                        size="small"
                        variant="outlined"
                        color={action.color}
                        startIcon={action.icon}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.action();
                        }}
                        sx={{ flex: 1 }}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </Stack>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Subject Details Dialog */}
      <Dialog
        open={subjectDialogOpen}
        onClose={() => setSubjectDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedSubject && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <SubjectIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedSubject.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedSubject.code}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedSubject.description || 'No description available.'}
                  </Typography>
                </Grid>

                {selectedSubject.teacher && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Teacher Information
                    </Typography>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar>
                            <TeacherIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {selectedSubject.teacher.name}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} mt={1}>
                              <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {selectedSubject.teacher.email}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Grid container spacing={2}>
                    {getSubjectActions(selectedSubject.id).map((action, index) => (
                      <Grid item xs={12} sm={4} key={index}>
                        <Button
                          fullWidth
                          variant="outlined"
                          color={action.color}
                          startIcon={action.icon}
                          endIcon={<ArrowForwardIcon />}
                          onClick={action.action}
                          sx={{ py: 1.5 }}
                        >
                          {action.label}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={() => setSubjectDialogOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}