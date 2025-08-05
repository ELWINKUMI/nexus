'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tab,
  Tabs,
  Paper,
  LinearProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  MoreVert as MoreVertIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  PlayArrow as PlayArrowIcon,
  Visibility as VisibilityIcon,
  GetApp as DownloadIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AccessTime as AccessTimeIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  subjectColor: string;
  teacher: string;
  teacherAvatar?: string;
  dueDate: string;
  createdDate: string;
  maxPoints: number;
  status: 'not-started' | 'in-progress' | 'submitted' | 'graded' | 'overdue';
  submissionStatus?: 'draft' | 'submitted';
  score?: number;
  feedback?: string;
  attachments: { id: string; name: string; type: string; url: string }[];
  allowLateSubmission: boolean;
  submissionTypes: ('text' | 'file' | 'both')[];
  instructions: string;
  estimatedTime: string;
  category: 'homework' | 'project' | 'essay' | 'lab' | 'quiz';
}

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
      id={`assignment-tabpanel-${index}`}
      aria-labelledby={`assignment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function StudentAssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [viewDialog, setViewDialog] = useState(false);

  // Mock data - replace with actual API calls
  const mockAssignments: Assignment[] = [
    {
      id: '1',
      title: 'Essay on Climate Change',
      description: 'Write a comprehensive essay on the effects of climate change on local ecosystems.',
      subject: 'Environmental Science',
      subjectColor: '#4CAF50',
      teacher: 'Dr. Sarah Johnson',
      teacherAvatar: '/avatars/teacher1.jpg',
      dueDate: '2024-01-25T23:59:00Z',
      createdDate: '2024-01-10T09:00:00Z',
      maxPoints: 100,
      status: 'in-progress',
      submissionStatus: 'draft',
      attachments: [
        { id: '1', name: 'Assignment Guidelines.pdf', type: 'pdf', url: '/files/guidelines.pdf' },
        { id: '2', name: 'Research Sources.docx', type: 'docx', url: '/files/sources.docx' }
      ],
      allowLateSubmission: true,
      submissionTypes: ['text', 'file'],
      instructions: 'Please write a 1500-word essay analyzing the impact of climate change on local ecosystems. Include at least 5 scholarly sources and proper citations.',
      estimatedTime: '3-4 hours',
      category: 'essay'
    },
    {
      id: '2',
      title: 'Mathematics Problem Set 5',
      description: 'Complete all problems in Chapter 8: Calculus Applications',
      subject: 'Advanced Mathematics',
      subjectColor: '#2196F3',
      teacher: 'Prof. Michael Chen',
      teacherAvatar: '/avatars/teacher2.jpg',
      dueDate: '2024-01-20T17:00:00Z',
      createdDate: '2024-01-12T10:30:00Z',
      maxPoints: 50,
      status: 'not-started',
      attachments: [
        { id: '3', name: 'Problem Set 5.pdf', type: 'pdf', url: '/files/problemset5.pdf' }
      ],
      allowLateSubmission: false,
      submissionTypes: ['file'],
      instructions: 'Solve all 20 problems showing complete work. Submit as a single PDF file.',
      estimatedTime: '2-3 hours',
      category: 'homework'
    },
    {
      id: '3',
      title: 'Chemistry Lab Report',
      description: 'Analysis of Chemical Reactions in Organic Compounds',
      subject: 'Chemistry',
      subjectColor: '#FF9800',
      teacher: 'Dr. Emily Rodriguez',
      teacherAvatar: '/avatars/teacher3.jpg',
      dueDate: '2024-01-18T15:30:00Z',
      createdDate: '2024-01-08T14:00:00Z',
      maxPoints: 75,
      status: 'submitted',
      score: 68,
      feedback: 'Good analysis, but needs more detailed conclusion.',
      attachments: [
        { id: '4', name: 'Lab Instructions.pdf', type: 'pdf', url: '/files/labinstructions.pdf' },
        { id: '5', name: 'Data Template.xlsx', type: 'xlsx', url: '/files/datatemplate.xlsx' }
      ],
      allowLateSubmission: true,
      submissionTypes: ['text', 'file'],
      instructions: 'Complete the lab experiment and write a detailed report including methodology, results, and conclusion.',
      estimatedTime: '4-5 hours',
      category: 'lab'
    },
    {
      id: '4',
      title: 'History Research Project',
      description: 'Research project on World War II impact on society',
      subject: 'World History',
      subjectColor: '#9C27B0',
      teacher: 'Mr. David Wilson',
      teacherAvatar: '/avatars/teacher4.jpg',
      dueDate: '2024-01-15T23:59:00Z',
      createdDate: '2024-01-05T11:00:00Z',
      maxPoints: 150,
      status: 'overdue',
      attachments: [
        { id: '6', name: 'Research Guidelines.pdf', type: 'pdf', url: '/files/researchguidelines.pdf' }
      ],
      allowLateSubmission: true,
      submissionTypes: ['text', 'file'],
      instructions: 'Research and present the social, economic, and political impacts of WWII. Minimum 2000 words.',
      estimatedTime: '6-8 hours',
      category: 'project'
    }
  ];

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setIsLoading(true);
      // Replace with actual API call
      // const response = await fetch('/api/student/assignments');
      // const data = await response.json();
      // setAssignments(data.assignments);
      
      // Mock delay
      setTimeout(() => {
        setAssignments(mockAssignments);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading assignments:', error);
      setAssignments(mockAssignments);
      setIsLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, assignment: Assignment) => {
    setAnchorEl(event.currentTarget);
    setSelectedAssignment(assignment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAssignment(null);
  };

  const handleViewAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setViewDialog(true);
    handleMenuClose();
  };

  const handleStartAssignment = (assignmentId: string) => {
    router.push(`/student/assignments/work?id=${assignmentId}`);
    handleMenuClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-started': return 'default';
      case 'in-progress': return 'warning';
      case 'submitted': return 'info';
      case 'graded': return 'success';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not-started': return <ScheduleIcon />;
      case 'in-progress': return <PlayArrowIcon />;
      case 'submitted': return <CheckCircleIcon />;
      case 'graded': return <CheckCircleIcon />;
      case 'overdue': return <WarningIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysUntilDue = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filterAssignments = () => {
    switch (tabValue) {
      case 0: return assignments; // All
      case 1: return assignments.filter(a => a.status === 'not-started' || a.status === 'in-progress'); // Pending
      case 2: return assignments.filter(a => a.status === 'submitted' || a.status === 'graded'); // Completed
      case 3: return assignments.filter(a => a.status === 'overdue'); // Overdue
      default: return assignments;
    }
  };

  const renderAssignmentCard = (assignment: Assignment) => (
    <Card key={assignment.id} sx={{ mb: 2, position: 'relative' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip
                label={assignment.subject}
                size="small"
                sx={{
                  backgroundColor: assignment.subjectColor,
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
              <Chip
                icon={getStatusIcon(assignment.status)}
                label={assignment.status.replace('-', ' ').toUpperCase()}
                size="small"
                color={getStatusColor(assignment.status) as any}
                variant={assignment.status === 'overdue' ? 'filled' : 'outlined'}
              />
              {assignment.score && (
                <Chip
                  label={`${assignment.score}/${assignment.maxPoints}`}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              )}
            </Box>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
              {assignment.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {assignment.description}
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body2">{assignment.teacher}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon fontSize="small" color="action" />
                  <Typography
                    variant="body2"
                    color={isOverdue(assignment.dueDate) ? 'error' : 'text.secondary'}
                    sx={{ fontWeight: isOverdue(assignment.dueDate) ? 'bold' : 'normal' }}
                  >
                    Due: {formatDate(assignment.dueDate)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon fontSize="small" color="action" />
                  <Typography variant="body2">{assignment.estimatedTime}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachFileIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {assignment.attachments.length} file{assignment.attachments.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {!isOverdue(assignment.dueDate) && assignment.status !== 'submitted' && assignment.status !== 'graded' && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {getDaysUntilDue(assignment.dueDate)} days remaining
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.max(0, Math.min(100, ((7 - getDaysUntilDue(assignment.dueDate)) / 7) * 100))}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getDaysUntilDue(assignment.dueDate) <= 2 ? '#f44336' : getDaysUntilDue(assignment.dueDate) <= 5 ? '#ff9800' : '#4caf50'
                    }
                  }}
                />
              </Box>
            )}
          </Box>
          
          <IconButton onClick={(e) => handleMenuClick(e, assignment)}>
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {assignment.status === 'not-started' && (
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={() => handleStartAssignment(assignment.id)}
              size="small"
            >
              Start Assignment
            </Button>
          )}
          {assignment.status === 'in-progress' && (
            <Button
              variant="outlined"
              startIcon={<PlayArrowIcon />}
              onClick={() => handleStartAssignment(assignment.id)}
              size="small"
            >
              Continue Work
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<VisibilityIcon />}
            onClick={() => handleViewAssignment(assignment)}
            size="small"
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Assignments
        </Typography>
        <Box sx={{ mt: 4 }}>
          {[1, 2, 3].map((i) => (
            <Card key={i} sx={{ mb: 2, p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ height: 20, backgroundColor: 'grey.200', borderRadius: 1, mb: 1 }} />
                  <Box sx={{ height: 16, backgroundColor: 'grey.100', borderRadius: 1, width: '70%', mb: 1 }} />
                  <Box sx={{ height: 16, backgroundColor: 'grey.100', borderRadius: 1, width: '50%' }} />
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          My Assignments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your coursework and track your progress
        </Typography>
      </Box>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label={`All (${assignments.length})`} />
          <Tab label={`Pending (${assignments.filter(a => a.status === 'not-started' || a.status === 'in-progress').length})`} />
          <Tab label={`Completed (${assignments.filter(a => a.status === 'submitted' || a.status === 'graded').length})`} />
          <Tab label={`Overdue (${assignments.filter(a => a.status === 'overdue').length})`} />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        {assignments.map(assignment => renderAssignmentCard(assignment))}
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        {assignments.filter(a => a.status === 'not-started' || a.status === 'in-progress').map(assignment => renderAssignmentCard(assignment))}
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        {assignments.filter(a => a.status === 'submitted' || a.status === 'graded').map(assignment => renderAssignmentCard(assignment))}
      </TabPanel>
      <TabPanel value={tabValue} index={3}>
        {assignments.filter(a => a.status === 'overdue').map(assignment => renderAssignmentCard(assignment))}
      </TabPanel>

      {/* Assignment Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedAssignment && handleViewAssignment(selectedAssignment)}>
          <VisibilityIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        {selectedAssignment && (selectedAssignment.status === 'not-started' || selectedAssignment.status === 'in-progress') && (
          <MenuItem onClick={() => selectedAssignment && handleStartAssignment(selectedAssignment.id)}>
            <PlayArrowIcon sx={{ mr: 1 }} />
            {selectedAssignment.status === 'not-started' ? 'Start Assignment' : 'Continue Work'}
          </MenuItem>
        )}
        {selectedAssignment?.attachments.map(attachment => (
          <MenuItem key={attachment.id} onClick={() => window.open(attachment.url, '_blank')}>
            <DownloadIcon sx={{ mr: 1 }} />
            Download {attachment.name}
          </MenuItem>
        ))}
      </Menu>

      {/* Assignment Details Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedAssignment && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip
                  label={selectedAssignment.subject}
                  size="small"
                  sx={{
                    backgroundColor: selectedAssignment.subjectColor,
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
                <Chip
                  icon={getStatusIcon(selectedAssignment.status)}
                  label={selectedAssignment.status.replace('-', ' ').toUpperCase()}
                  size="small"
                  color={getStatusColor(selectedAssignment.status) as any}
                />
              </Box>
              <Typography variant="h5" component="h2">
                {selectedAssignment.title}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedAssignment.description}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>
                    Instructions
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedAssignment.instructions}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Teacher
                    </Typography>
                    <Typography variant="body1">{selectedAssignment.teacher}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Due Date
                    </Typography>
                    <Typography variant="body1" color={isOverdue(selectedAssignment.dueDate) ? 'error' : 'inherit'}>
                      {formatDate(selectedAssignment.dueDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Points
                    </Typography>
                    <Typography variant="body1">{selectedAssignment.maxPoints} points</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Estimated Time
                    </Typography>
                    <Typography variant="body1">{selectedAssignment.estimatedTime}</Typography>
                  </Grid>
                </Grid>

                {selectedAssignment.attachments.length > 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Attachments
                    </Typography>
                    <List dense>
                      {selectedAssignment.attachments.map(attachment => (
                        <ListItem
                          key={attachment.id}
                          secondaryAction={
                            <IconButton
                              edge="end"
                              onClick={() => window.open(attachment.url, '_blank')}
                            >
                              <DownloadIcon />
                            </IconButton>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar>
                              <AttachFileIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={attachment.name}
                            secondary={attachment.type.toUpperCase()}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {selectedAssignment.feedback && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Feedback
                    </Typography>
                    <Alert severity="info">
                      {selectedAssignment.feedback}
                    </Alert>
                  </Box>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialog(false)}>
                Close
              </Button>
              {(selectedAssignment.status === 'not-started' || selectedAssignment.status === 'in-progress') && (
                <Button
                  variant="contained"
                  onClick={() => {
                    setViewDialog(false);
                    handleStartAssignment(selectedAssignment.id);
                  }}
                >
                  {selectedAssignment.status === 'not-started' ? 'Start Assignment' : 'Continue Work'}
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}
