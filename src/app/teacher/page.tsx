'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Box,
  Typography,
  Card,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
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
  Dashboard as DashboardIcon,
  Book as BookIcon,
  Person as PersonIcon,
  Groups as GroupsIcon,
  PlayArrow as PlayArrowIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Send as SendIcon,
  Grade as GradeIcon,
  DateRange as DateRangeIcon,
  AccessTime as AccessTimeIcon,
  FileUpload as FileUploadIcon,
  TextFields as TextFieldsIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import CircularProgress from '@mui/material/CircularProgress';

interface DashboardData {
  teacher: {
    id: string;
    name: string;
    email: string;
  };
  stats: {
    classes: number;
    subjects: number;
    students: number;
    assignments: number;
    quizzes: number;
  };
  performance: {
    assignmentCompletionRate: number;
    averageGrade: number;
    letterGrade: string;
    attendanceRate: number;
    averageQuizScore: number;
    activeProjects: number;
  };
  activity: {
    recentAssignments: number;
    recentQuizzes: number;
    totalSubmissions: number;
  };
  classes: Array<{
    id: string;
    name: string;
    students: number;
    grade?: string;
    averageGrade?: number;
  }>;
  subjects: Array<{
    id: string;
    name: string;
    classes: number;
  }>;
  recentAssignments: Array<{
    id: string;
    title: string;
    subject: string;
    dueDate: string;
    status: string;
    submissionRate?: number;
  }>;
}

export default function TeacherDashboard() {
  const [user, setUser] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [classesWithStudents, setClassesWithStudents] = useState<any[]>([]);
  const [subjectsData, setSubjectsData] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [assignmentTab, setAssignmentTab] = useState(0); // 0: View Assignments, 1: Create Assignment
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0: Dashboard, 1: Classes, 2: Subjects, 3: Assignments, 4: Quizzes, 5: Announcements, 6: Resources
  
  // Assignment creation dialog states
  const [assignmentDialog, setAssignmentDialog] = useState({
    open: false,
    type: 'success', // 'success' or 'error'
    message: ''
  });

  // Assignment editing dialog states
  const [editAssignmentDialog, setEditAssignmentDialog] = useState({
    open: false,
    assignment: null as any
  });

  // Submission viewing dialog states
  const [submissionDialog, setSubmissionDialog] = useState({
    open: false,
    submission: null as any,
    assignment: null as any
  });

  // Grading dialog states
  const [gradingDialog, setGradingDialog] = useState({
    open: false,
    submission: null as any,
    assignment: null as any,
    score: '',
    feedback: '',
    loading: false
  });

  // Helper function to safely format dates (prevents hydration mismatch)
  const formatDate = (dateString: string | Date) => {
    if (!mounted) return ''; // Return empty string during SSR to prevent hydration mismatch
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  // Helper function to safely format date and time
  const formatDateTime = (dateString: string | Date) => {
    if (!mounted) return ''; // Return empty string during SSR to prevent hydration mismatch
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  // Helper function to safely compare dates
  const isDateInFuture = (dateString: string | Date) => {
    if (!mounted) return false; // Return false during SSR to prevent hydration issues
    try {
      return new Date(dateString) > new Date();
    } catch {
      return false;
    }
  };

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
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
    fetchDashboardData();
  }, [router, mounted]);

  // Fetch subjects data when assignment tab is set to creation mode
  useEffect(() => {
    if (activeTab === 3 && assignmentTab === 1) {
      fetchSubjectsData();
    }
  }, [activeTab, assignmentTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teacher/dashboard/stats', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
        console.log('Dashboard data loaded:', data);
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassesWithStudents = async () => {
    try {
      const response = await fetch('/api/teacher/classes', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setClassesWithStudents(data);
      } else {
        console.error('Failed to fetch classes data');
      }
    } catch (error) {
      console.error('Error fetching classes data:', error);
    }
  };

  const fetchSubjectsData = async () => {
    try {
      const response = await fetch('/api/teacher/subjects', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setSubjectsData(data);
      } else {
        console.error('Failed to fetch subjects data');
      }
    } catch (error) {
      console.error('Error fetching subjects data:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      console.log('Fetching assignments...');
      const response = await fetch('/api/teacher/assignments', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Assignments fetched - Raw API response:', data);
        console.log('Number of assignments:', data.length);
        console.log('Assignment titles:', data.map(a => a.title));
        setAssignments(data);
        console.log('Assignments state updated');
      } else {
        console.error('Failed to fetch assignments data - Status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching assignments data:', error);
    }
  };

  // Assignment Creation Form Component
  const AssignmentCreationForm = ({ subjectsData, classesData, onBack, onSubmit, setAssignmentDialog }: any) => {
    console.log('Assignment Form - Subjects Data:', subjectsData);
    console.log('Assignment Form - Classes Data:', classesData);

    const [formData, setFormData] = useState({
      title: '',
      description: '',
      subject: '',
      class: '',
      dueDate: '',
      dueTime: '',
      totalMarks: 100,
      submissionType: 'both', // 'text', 'file', 'both'
      allowResubmission: false,
      maxSubmissions: 1,
      instructions: '',
      attachments: []
    });

    const [loading, setLoading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      setUploadedFiles(prev => [...prev, ...files]);
    };

    const removeFile = (index: number) => {
      setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      try {
        let attachmentData = [];
        
        // Upload files first if there are any
        if (uploadedFiles.length > 0) {
          const fileFormData = new FormData();
          uploadedFiles.forEach(file => {
            fileFormData.append('files', file);
          });

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            credentials: 'include',
            body: fileFormData
          });

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            attachmentData = uploadResult.files.map((file: any) => ({
              name: file.originalName,
              fileName: file.fileName,
              size: file.size,
              type: file.type,
              uploadedAt: file.uploadedAt
            }));
          } else {
            throw new Error('Failed to upload files');
          }
        }

        const response = await fetch('/api/teacher/assignments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            ...formData,
            dueDate: new Date(`${formData.dueDate}T${formData.dueTime}`).toISOString(),
            attachments: attachmentData
          })
        });

        if (response.ok) {
          const result = await response.json();
          setFormData({
            title: '',
            description: '',
            subject: '',
            class: '',
            dueDate: '',
            dueTime: '',
            totalMarks: 100,
            submissionType: 'both',
            allowResubmission: false,
            maxSubmissions: 1,
            instructions: '',
            attachments: []
          });
          setUploadedFiles([]);
          
          // Show success dialog
          setAssignmentDialog({
            open: true,
            type: 'success',
            message: `Assignment "${formData.title}" has been created successfully! Students will now be able to view and submit this assignment.`
          });
          
          // Refresh assignments list
          fetchAssignments();
          
          onSubmit?.();
          onBack();
        } else {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          
          // Show error dialog
          setAssignmentDialog({
            open: true,
            type: 'error',
            message: `Failed to create assignment: ${errorData.error || 'Unknown error occurred. Please try again.'}`
          });
        }
      } catch (error) {
        console.error('Error creating assignment:', error);
        
        // Show error dialog
        setAssignmentDialog({
          open: true,
          type: 'error',
          message: 'Network error occurred while creating assignment. Please check your connection and try again.'
        });
      } finally {
        setLoading(false);
      }
    };

    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={onBack}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Create New Assignment
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            {/* SECTION 1: Basic Assignment Information */}
            <Grid size={{ xs: 12 }}>
              <Card sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentIcon color="primary" />
                  Basic Assignment Information
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Assignment Title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      variant="outlined"
                      placeholder="Enter a clear and descriptive title for the assignment"
                      sx={{ '& .MuiInputBase-root': { fontSize: '1.1rem' } }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Total Marks"
                      type="number"
                      value={formData.totalMarks}
                      onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) || 0 })}
                      required
                      variant="outlined"
                      inputProps={{ min: 1, max: 1000 }}
                      helperText="Enter the maximum points for this assignment"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Submission Type</InputLabel>
                      <Select
                        value={formData.submissionType}
                        label="Submission Type"
                        onChange={(e) => setFormData({ ...formData, submissionType: e.target.value })}
                      >
                        <MenuItem value="text">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextFieldsIcon />
                            Text Only
                          </Box>
                        </MenuItem>
                        <MenuItem value="file">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FileUploadIcon />
                            File Upload Only
                          </Box>
                        </MenuItem>
                        <MenuItem value="both">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextFieldsIcon />
                            <FileUploadIcon />
                            Text and File Upload
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid xs={12}>
                    <TextField
                      fullWidth
                      label="Assignment Description"
                      multiline
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      variant="outlined"
                      placeholder="Provide detailed instructions, learning objectives, and expectations for this assignment..."
                    />
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* SECTION 2: Assignment Target & Schedule */}
            <Grid xs={12}>
              <Card sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupsIcon color="primary" />
                  Assignment Target & Schedule
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel sx={{ fontSize: '1.1rem' }}>Subject</InputLabel>
                      <Select
                        value={formData.subject}
                        label="Subject"
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        sx={{ '& .MuiSelect-select': { minHeight: '56px', display: 'flex', alignItems: 'center' } }}
                      >
                        {subjectsData?.map((subject: any) => (
                          <MenuItem key={subject._id} value={subject.name} sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <BookIcon color="primary" />
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                  {subject.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {subject.classes?.length || 0} classes assigned
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel sx={{ fontSize: '1.1rem' }}>Class</InputLabel>
                      <Select
                        value={formData.class}
                        label="Class"
                        onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                        sx={{ '& .MuiSelect-select': { minHeight: '56px', display: 'flex', alignItems: 'center' } }}
                      >
                        {classesData?.map((classItem: any) => (
                          <MenuItem key={classItem._id} value={classItem.name} sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <ClassIcon color="secondary" />
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                  {classItem.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Grade {classItem.grade || 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Due Date"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      required
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                      InputProps={{
                        startAdornment: <DateRangeIcon color="action" sx={{ mr: 1 }} />
                      }}
                    />
                  </Grid>

                  <Grid xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Due Time"
                      type="time"
                      value={formData.dueTime}
                      onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                      required
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                      InputProps={{
                        startAdornment: <AccessTimeIcon color="action" sx={{ mr: 1 }} />
                      }}
                    />
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* SECTION 3: Submission Settings */}
            <Grid xs={12}>
              <Card sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SendIcon color="primary" />
                  Submission Settings
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.allowResubmission}
                          onChange={(e) => setFormData({ ...formData, allowResubmission: e.target.checked })}
                          color="primary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            Allow Resubmission
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Students can submit multiple times before the deadline
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>

                  {formData.allowResubmission && (
                    <Grid xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Maximum Submissions"
                        type="number"
                        value={formData.maxSubmissions}
                        onChange={(e) => setFormData({ ...formData, maxSubmissions: parseInt(e.target.value) || 1 })}
                        variant="outlined"
                        inputProps={{ min: 1, max: 10 }}
                        helperText="How many times can students resubmit their work?"
                      />
                    </Grid>
                  )}

                  <Grid xs={12}>
                    <TextField
                      fullWidth
                      label="Additional Instructions"
                      multiline
                      rows={3}
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      variant="outlined"
                      placeholder="Provide specific submission guidelines, formatting requirements, or special instructions..."
                    />
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* SECTION 4: Assignment Files & Resources */}
            <Grid xs={12}>
              <Card sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FileUploadIcon color="primary" />
                  Assignment Files & Resources
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid xs={12}>
                    <Box sx={{ 
                      border: '2px dashed #e2e8f0', 
                      borderRadius: 2, 
                      p: 4, 
                      textAlign: 'center',
                      bgcolor: '#f8fafc',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#3b82f6',
                        bgcolor: '#f1f5f9'
                      }
                    }}>
                      <FileUploadIcon sx={{ fontSize: 64, color: '#64748b', mb: 2 }} />
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Upload Assignment Files
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Add documents, images, videos, or other resources for this assignment
                      </Typography>
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<FileUploadIcon />}
                        size="large"
                        sx={{ 
                          mb: 2,
                          bgcolor: '#3b82f6',
                          '&:hover': { bgcolor: '#2563eb' }
                        }}
                      >
                        Choose Files
                        <input
                          type="file"
                          multiple
                          hidden
                          onChange={handleFileUpload}
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.xlsx,.pptx"
                        />
                      </Button>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Supported formats: PDF, DOC, DOCX, TXT, Images, Videos, Excel, PowerPoint
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Display uploaded files */}
                  {uploadedFiles.length > 0 && (
                    <Grid xs={12}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1e293b' }}>
                        Uploaded Files ({uploadedFiles.length})
                      </Typography>
                      <Grid container spacing={2}>
                        {uploadedFiles.map((file, index) => (
                          <Grid xs={12} md={6} key={index}>
                            <Card sx={{ 
                              p: 2, 
                              border: '1px solid #e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                                <Avatar sx={{ bgcolor: '#3b82f6' }}>
                                  <FileUploadIcon />
                                </Avatar>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="body1" sx={{ fontWeight: 'medium' }} noWrap>
                                    {file.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.split('/')[1]?.toUpperCase()}
                                  </Typography>
                                </Box>
                              </Box>
                              <IconButton
                                onClick={() => removeFile(index)}
                                color="error"
                                size="small"
                              >
                                <Typography variant="h6">×</Typography>
                              </IconButton>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              </Card>
            </Grid>

            {/* Action Buttons */}
            <Grid xs={12}>
              <Card sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 2, bgcolor: '#f8fafc' }}>
                <Box sx={{ display: 'flex', gap: 3, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={onBack}
                    startIcon={<ArrowBackIcon />}
                    size="large"
                    sx={{ minWidth: 120 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                    size="large"
                    sx={{
                      bgcolor: '#3b82f6',
                      '&:hover': { bgcolor: '#2563eb' },
                      minWidth: 180
                    }}
                  >
                    {loading ? 'Creating Assignment...' : 'Create Assignment'}
                  </Button>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </form>
      </Box>
    );
  };

  // Assignment Edit Form Component
  const AssignmentEditForm = ({ assignment, onClose, onSubmit }: any) => {
    const [formData, setFormData] = useState({
      title: assignment?.title || '',
      description: assignment?.description || '',
      subject: assignment?.subject || '',
      class: assignment?.class || '',
      dueDate: assignment?.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : '',
      dueTime: assignment?.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[1].substring(0, 5) : '',
      totalMarks: assignment?.totalMarks || 100,
      submissionType: assignment?.submissionType || 'both',
      allowResubmission: assignment?.allowResubmission || false,
      maxSubmissions: assignment?.maxSubmissions || 1,
      instructions: assignment?.instructions || '',
    });

    const [loading, setLoading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [existingAttachments, setExistingAttachments] = useState(assignment?.attachments || []);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files) {
        const newFiles = Array.from(files);
        setUploadedFiles(prev => [...prev, ...newFiles]);
      }
    };

    const removeFile = (index: number) => {
      setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingAttachment = (index: number) => {
      setExistingAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      try {
        const dueDateTime = `${formData.dueDate}T${formData.dueTime}:00.000Z`;
        
        // Upload new files if any
        let newAttachments = [];
        if (uploadedFiles.length > 0) {
          const formDataForFiles = new FormData();
          uploadedFiles.forEach(file => {
            formDataForFiles.append('files', file);
          });

          const uploadResponse = await fetch('/api/teacher/upload', {
            method: 'POST',
            credentials: 'include',
            body: formDataForFiles,
          });

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            newAttachments = uploadResult.files || [];
          }
        }

        const response = await fetch(`/api/teacher/assignments/${assignment._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            ...formData,
            dueDate: dueDateTime,
            attachments: [...existingAttachments, ...newAttachments],
          }),
        });

        if (response.ok) {
          onSubmit();
          onClose();
          setAssignmentDialog({
            open: true,
            type: 'success',
            message: 'Assignment updated successfully!'
          });
        } else {
          throw new Error('Failed to update assignment');
        }
      } catch (error) {
        console.error('Error updating assignment:', error);
        setAssignmentDialog({
          open: true,
          type: 'error',
          message: 'Failed to update assignment. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };

    return (
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto' }}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#1976d2' }}>
                Edit Assignment Details
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Assignment Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    multiline
                    rows={3}
                    variant="outlined"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Total Marks"
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Submission Type</InputLabel>
                    <Select
                      value={formData.submissionType}
                      onChange={(e) => setFormData({ ...formData, submissionType: e.target.value })}
                      label="Submission Type"
                    >
                      <MenuItem value="text">Text Only</MenuItem>
                      <MenuItem value="file">File Upload Only</MenuItem>
                      <MenuItem value="both">Both Text and File</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Due Date"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Due Time"
                    type="time"
                    value={formData.dueTime}
                    onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                    required
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Instructions"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    multiline
                    rows={3}
                    variant="outlined"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.allowResubmission}
                        onChange={(e) => setFormData({ ...formData, allowResubmission: e.target.checked })}
                      />
                    }
                    label="Allow Resubmission"
                  />
                </Grid>
              </Grid>
            </Card>
          </Grid>

          {/* File Attachments Section */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#1976d2' }}>
                Assignment Attachments
              </Typography>
              
              {/* Existing Attachments */}
              {existingAttachments.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Current Attachments ({existingAttachments.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {existingAttachments.map((attachment, index) => (
                      <Grid size={{ xs: 12, md: 6 }} key={index}>
                        <Card sx={{ 
                          p: 2, 
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                            <Avatar sx={{ bgcolor: '#3b82f6' }}>
                              <FileUploadIcon />
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body1" sx={{ fontWeight: 'medium' }} noWrap>
                                {attachment.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {(attachment.size / 1024 / 1024).toFixed(2)} MB
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton
                            onClick={() => removeExistingAttachment(index)}
                            color="error"
                            size="small"
                          >
                            <Typography variant="h6">×</Typography>
                          </IconButton>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Add New Files */}
              <Box sx={{ mb: 2 }}>
                <input
                  accept="*/*"
                  style={{ display: 'none' }}
                  id="file-upload-edit"
                  multiple
                  type="file"
                  onChange={handleFileUpload}
                />
                <label htmlFor="file-upload-edit">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<FileUploadIcon />}
                    sx={{ mb: 2 }}
                  >
                    Add New Files
                  </Button>
                </label>
              </Box>

              {/* New Files Preview */}
              {uploadedFiles.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                    New Files to Upload ({uploadedFiles.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {uploadedFiles.map((file, index) => (
                      <Grid size={{ xs: 12, md: 6 }} key={index}>
                        <Card sx={{ 
                          p: 2, 
                          border: '1px solid #10b981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          bgcolor: '#f0fdf4'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                            <Avatar sx={{ bgcolor: '#10b981' }}>
                              <FileUploadIcon />
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body1" sx={{ fontWeight: 'medium' }} noWrap>
                                {file.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.split('/')[1]?.toUpperCase()}
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton
                            onClick={() => removeFile(index)}
                            color="error"
                            size="small"
                          >
                            <Typography variant="h6">×</Typography>
                          </IconButton>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Card>
          </Grid>

          {/* Action Buttons */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <EditIcon />}
              >
                {loading ? 'Updating...' : 'Update Assignment'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
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

  const renderMainContent = () => {
    switch (activeTab) {
      case 0: // Dashboard
        return (
          <Box>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid xs={12} sm={6} md={3}>
                <Card sx={{ p: 2, bgcolor: '#e8f5e8', border: '1px solid #4caf50' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolIcon sx={{ fontSize: 28, color: '#4caf50' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Students
                      </Typography>
                      <Typography variant="h6" component="div">
                        {dashboardData?.stats?.students || 0}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>

              <Grid xs={12} sm={6} md={3}>
                <Card sx={{ p: 2, bgcolor: '#fff3e0', border: '1px solid #ff9800' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BookIcon sx={{ fontSize: 28, color: '#ff9800' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Subjects Teaching
                      </Typography>
                      <Typography variant="h6" component="div">
                        {dashboardData?.stats?.subjects || 0}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>

              <Grid xs={12} sm={6} md={3}>
                <Card sx={{ p: 2, bgcolor: '#e3f2fd', border: '1px solid #2196f3' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentIcon sx={{ fontSize: 28, color: '#2196f3' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Active Assignments
                      </Typography>
                      <Typography variant="h6" component="div">
                        {dashboardData?.stats?.assignments || 0}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>

              <Grid xs={12} sm={6} md={3}>
                <Card sx={{ p: 2, bgcolor: '#fce4ec', border: '1px solid #e91e63' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <QuizIcon sx={{ fontSize: 28, color: '#e91e63' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Quizzes
                      </Typography>
                      <Typography variant="h6" component="div">
                        {dashboardData?.stats?.quizzes || 0}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            </Grid>

            {/* Additional Information Cards */}
            <Grid container spacing={3}>
              {/* Recent Activity */}
              <Grid xs={12} md={6}>
                <Card sx={{ 
                  height: '350px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 2
                }}>
                  <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                      Recent Activity
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <List sx={{ p: 0 }}>
                      {dashboardData?.recentAssignments && dashboardData.recentAssignments.length > 0 ? (
                        dashboardData.recentAssignments.slice(0, 3).map((assignment, index) => (
                          <ListItem key={assignment.id} sx={{ px: 0, py: 2 }}>
                            <ListItemIcon>
                              <AssignmentIcon sx={{ color: '#3b82f6' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={assignment.title}
                              secondary={`${assignment.subject} - Due: ${formatDate(assignment.dueDate)}`}
                              primaryTypographyProps={{ fontWeight: 'bold', fontSize: '0.9rem' }}
                              secondaryTypographyProps={{ fontSize: '0.8rem' }}
                            />
                          </ListItem>
                        ))
                      ) : (
                        <ListItem sx={{ px: 0, py: 2 }}>
                          <ListItemText
                            primary="No recent assignments"
                            secondary="Create your first assignment to get started"
                            primaryTypographyProps={{ fontWeight: 'bold', fontSize: '0.9rem' }}
                            secondaryTypographyProps={{ fontSize: '0.8rem' }}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Box>
                </Card>
              </Grid>

              {/* Class Performance Overview */}
              <Grid xs={12} md={6}>
                <Card sx={{ 
                  height: '350px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 2
                }}>
                  <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                      Class Performance Overview
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      <Grid xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f0f9ff', borderRadius: 1 }}>
                          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3b82f6' }}>
                            {dashboardData?.performance?.assignmentCompletionRate || 0}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Assignment Completion
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f0fdf4', borderRadius: 1 }}>
                          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#10b981' }}>
                            {dashboardData?.performance?.letterGrade || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Average Grade
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fef3c7', borderRadius: 1 }}>
                          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f59e0b' }}>
                            {dashboardData?.performance?.attendanceRate || 0}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Attendance Rate
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fce7f3', borderRadius: 1 }}>
                          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ec4899' }}>
                            {dashboardData?.performance?.activeProjects || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Active Projects
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Card>
              </Grid>

              {/* Upcoming Events */}
              <Grid xs={12} md={6}>
                <Card sx={{ 
                  height: '300px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 2
                }}>
                  <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                      Upcoming Events
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#3b82f6' }}>
                        Tomorrow
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {dashboardData?.classes && dashboardData.classes.length > 0 
                          ? `Teaching ${dashboardData.classes[0].name}` 
                          : 'No classes scheduled'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        9:00 AM - 10:30 AM
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#10b981' }}>
                        This Week
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {dashboardData?.recentAssignments && dashboardData.recentAssignments.length > 0
                          ? `${dashboardData.recentAssignments.filter(a => a.status === 'active').length} assignments due`
                          : 'No assignments due'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dashboardData?.subjects?.length || 0} subjects to teach
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#f59e0b' }}>
                        Next Week
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {dashboardData?.stats?.students || 0} students to evaluate
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Across {dashboardData?.stats?.classes || 0} classes
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>

              {/* Quick Actions */}
              <Grid xs={12} md={6}>
                <Card sx={{ 
                  height: '300px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 2
                }}>
                  <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                      Quick Actions
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      <Grid xs={6}>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<AddIcon />}
                          onClick={() => setActiveTab(3)} // Navigate to Assignments tab
                          sx={{
                            py: 2,
                            borderColor: '#3b82f6',
                            color: '#3b82f6',
                            '&:hover': {
                              bgcolor: '#eff6ff',
                              borderColor: '#3b82f6'
                            }
                          }}
                        >
                          New Assignment
                        </Button>
                      </Grid>
                      <Grid xs={6}>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<QuizIcon />}
                          onClick={() => router.push('/teacher/quiz/create')}
                          sx={{
                            py: 2,
                            borderColor: '#8b5cf6',
                            color: '#8b5cf6',
                            '&:hover': {
                              bgcolor: '#f3e8ff',
                              borderColor: '#8b5cf6'
                            }
                          }}
                        >
                          Create Quiz
                        </Button>
                      </Grid>
                      <Grid xs={6}>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<AnnouncementIcon />}
                          onClick={() => router.push('/teacher/announcements')}
                          sx={{
                            py: 2,
                            borderColor: '#10b981',
                            color: '#10b981',
                            '&:hover': {
                              bgcolor: '#ecfdf5',
                              borderColor: '#10b981'
                            }
                          }}
                        >
                          Announcement
                        </Button>
                      </Grid>
                      <Grid xs={6}>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<ResourceIcon />}
                          onClick={() => router.push('/teacher/resources')}
                          sx={{
                            py: 2,
                            borderColor: '#f59e0b',
                            color: '#f59e0b',
                            '&:hover': {
                              bgcolor: '#fffbeb',
                              borderColor: '#f59e0b'
                            }
                          }}
                        >
                          Upload Resource
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      case 1: // My Classes
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                My Classes
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  bgcolor: '#3b82f6',
                  '&:hover': { bgcolor: '#2563eb' }
                }}
                onClick={fetchClassesWithStudents}
              >
                Refresh Classes
              </Button>
            </Box>

            {dashboardData?.classes && dashboardData.classes.length > 0 ? (
              <Grid container spacing={3}>
                {dashboardData.classes.map((classItem) => {
                  // Find detailed class data if available
                  const detailedClass = classesWithStudents.find(c => c.id === classItem.id);
                  const studentsToShow = detailedClass?.students || [];
                  
                  return (
                    <Grid xs={12} key={classItem.id}>
                      <Card sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
                        <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: '#3b82f6' }}>
                              <ClassIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                {classItem.name}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                <Chip 
                                  icon={<GroupsIcon />} 
                                  label={`${detailedClass?.studentCount || classItem.students} Students`} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                />
                                {classItem.grade && (
                                  <Chip 
                                    label={classItem.grade} 
                                    size="small" 
                                    color="secondary" 
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </Box>

                        <Box sx={{ p: 3 }}>
                          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Students in {classItem.name}
                          </Typography>
                          
                          {(detailedClass?.studentCount || classItem.students) > 0 ? (
                            <TableContainer component={Paper} sx={{ border: '1px solid #e2e8f0' }}>
                              <Table>
                                <TableHead>
                                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Student ID</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {studentsToShow.length > 0 ? (
                                    // Show real student data
                                    studentsToShow.map((student) => (
                                      <TableRow key={student.id} hover>
                                        <TableCell>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#10b981' }}>
                                              <PersonIcon sx={{ fontSize: 18 }} />
                                            </Avatar>
                                            {student.id}
                                          </Box>
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                            {student.name}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2" color="text.secondary">
                                            {student.email}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Chip 
                                            label={student.status === 'active' ? 'Active' : 'Inactive'} 
                                            size="small" 
                                            color={student.status === 'active' ? 'success' : 'default'} 
                                            variant="outlined"
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Button
                                            size="small"
                                            variant="outlined"
                                            sx={{ mr: 1 }}
                                          >
                                            View Profile
                                          </Button>
                                          <Button
                                            size="small"
                                            variant="text"
                                            color="primary"
                                          >
                                            Send Message
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))
                                  ) : (
                                    // Show mock data when real data is not available
                                    Array.from({ length: classItem.students }, (_, index) => (
                                      <TableRow key={index} hover>
                                        <TableCell>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#10b981' }}>
                                              <PersonIcon sx={{ fontSize: 18 }} />
                                            </Avatar>
                                            STU{String(index + 1).padStart(3, '0')}
                                          </Box>
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                            Student {index + 1}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2" color="text.secondary">
                                            student{index + 1}@nexus.edu
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Chip 
                                            label="Active" 
                                            size="small" 
                                            color="success" 
                                            variant="outlined"
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Button
                                            size="small"
                                            variant="outlined"
                                            sx={{ mr: 1 }}
                                          >
                                            View Profile
                                          </Button>
                                          <Button
                                            size="small"
                                            variant="text"
                                            color="primary"
                                          >
                                            Send Message
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))
                                  )}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          ) : (
                            <Box sx={{ 
                              textAlign: 'center', 
                              py: 6,
                              bgcolor: '#f8fafc',
                              borderRadius: 2,
                              border: '1px dashed #cbd5e1'
                            }}>
                              <GroupsIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 2 }} />
                              <Typography variant="h6" color="text.secondary" gutterBottom>
                                No students enrolled
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Students will appear here once they are assigned to this class
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Card sx={{ p: 6, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <ClassIcon sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  No Classes Assigned
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  You haven't been assigned to any classes yet. Contact your school administrator to get assigned to classes.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={fetchClassesWithStudents}
                >
                  Check for New Assignments
                </Button>
              </Card>
            )}
          </Box>
        );

      case 2: // Subjects
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                My Subjects
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  bgcolor: '#8b5cf6',
                  '&:hover': { bgcolor: '#7c3aed' }
                }}
                onClick={fetchSubjectsData}
              >
                Refresh Subjects
              </Button>
            </Box>

            {subjectsData && subjectsData.length > 0 ? (
              <Card sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Classes</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Students</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Content</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {subjectsData.map((subject) => (
                        <TableRow key={subject.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ bgcolor: '#8b5cf6' }}>
                                <SubjectIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                  {subject.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Subject ID: {subject.id}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {subject.classes.length} {subject.classes.length === 1 ? 'Class' : 'Classes'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {subject.classes.map(c => c.name).join(', ')}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              icon={<GroupsIcon />}
                              label={`${subject.totalStudents} Students`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip 
                                label={`${subject.assignmentCount} Assignments`} 
                                size="small" 
                                color="info" 
                                variant="outlined"
                              />
                              <Chip 
                                label={`${subject.quizCount} Quizzes`} 
                                size="small" 
                                color="secondary" 
                                variant="outlined"
                              />
                              <Chip 
                                label={`${subject.resourceCount} Resources`} 
                                size="small" 
                                color="success" 
                                variant="outlined"
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<AssignmentIcon />}
                                sx={{ 
                                  borderColor: '#3b82f6', 
                                  color: '#3b82f6',
                                  '&:hover': { bgcolor: '#eff6ff' }
                                }}
                                onClick={() => {
                                  console.log('Assignments button clicked from subjects');
                                  setActiveTab(3);
                                  fetchAssignments();
                                }}
                              >
                                Assignments
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<QuizIcon />}
                                sx={{ 
                                  borderColor: '#8b5cf6', 
                                  color: '#8b5cf6',
                                  '&:hover': { bgcolor: '#f3e8ff' }
                                }}
                                onClick={() => setActiveTab(4)}
                              >
                                Quizzes
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<AnnouncementIcon />}
                                sx={{ 
                                  borderColor: '#10b981', 
                                  color: '#10b981',
                                  '&:hover': { bgcolor: '#ecfdf5' }
                                }}
                                onClick={() => setActiveTab(5)}
                              >
                                Announce
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<ResourceIcon />}
                                sx={{ 
                                  borderColor: '#f59e0b', 
                                  color: '#f59e0b',
                                  '&:hover': { bgcolor: '#fffbeb' }
                                }}
                                onClick={() => setActiveTab(6)}
                              >
                                Resources
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            ) : (
              <Card sx={{ p: 6, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <SubjectIcon sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  No Subjects Assigned
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  You haven't been assigned to teach any subjects yet. Contact your school administrator to get subject assignments.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={fetchSubjectsData}
                >
                  Check for New Assignments
                </Button>
              </Card>
            )}
          </Box>
        );

      case 3: // Assignments
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                Assignment Management
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchAssignments}
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{
                    bgcolor: '#3b82f6',
                    '&:hover': { bgcolor: '#2563eb' }
                  }}
                  onClick={() => {
                    fetchSubjectsData();
                    setAssignmentTab(1);
                  }}
                >
                  Create Assignment
                </Button>
              </Box>
            </Box>

            <Card sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
              <Tabs
                value={assignmentTab}
                onChange={(e, newValue) => {
                  setAssignmentTab(newValue);
                  if (newValue === 0) { // View Assignments tab
                    console.log('View Assignments tab selected');
                    fetchAssignments();
                  }
                }}
                sx={{ borderBottom: '1px solid #e2e8f0' }}
              >
                <Tab label="View Assignments & Submissions" />
                <Tab label="Create New Assignment" />
              </Tabs>

              {assignmentTab === 0 ? (
                // View Assignments Tab
                <Box sx={{ p: 3 }}>
                  {(() => {
                    console.log('Rendering assignments view');
                    console.log('Assignments state:', assignments);
                    console.log('Assignments array length:', assignments?.length);
                    console.log('Assignment check:', assignments && assignments.length > 0);
                    return null;
                  })()}
                  {assignments && assignments.length > 0 ? (
                    <Grid container spacing={3}>
                      {assignments.map((assignment) => (
                        <Grid xs={12} key={assignment.id}>
                          <Card sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
                            <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar sx={{ bgcolor: '#3b82f6' }}>
                                    <AssignmentIcon />
                                  </Avatar>
                                  <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                      {assignment.title}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                      <Chip 
                                        label={assignment.subject} 
                                        size="small" 
                                        color="primary" 
                                        variant="outlined"
                                      />
                                      <Chip 
                                        label={assignment.class} 
                                        size="small" 
                                        color="secondary" 
                                        variant="outlined"
                                      />
                                      <Chip 
                                        icon={<DateRangeIcon />}
                                        label={`Due: ${formatDate(assignment.dueDate)}`}
                                        size="small" 
                                        color={isDateInFuture(assignment.dueDate) ? 'success' : 'error'}
                                        variant="outlined"
                                      />
                                      <Chip 
                                        label={assignment.status} 
                                        size="small" 
                                        color={assignment.status === 'active' ? 'success' : 'default'}
                                        variant="outlined"
                                      />
                                    </Box>
                                  </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Tooltip title="Edit Assignment">
                                    <IconButton 
                                      color="primary"
                                      onClick={() => {
                                        setEditAssignmentDialog({
                                          open: true,
                                          assignment: assignment
                                        });
                                      }}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="View Details">
                                    <IconButton color="info">
                                      <VisibilityIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>
                            </Box>

                            <Box sx={{ p: 3 }}>
                              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                Student Submissions
                              </Typography>
                              
                              <TableContainer>
                                <Table>
                                  <TableHead>
                                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                      <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                                      <TableCell sx={{ fontWeight: 'bold' }}>Submitted</TableCell>
                                      <TableCell sx={{ fontWeight: 'bold' }}>Submission Date</TableCell>
                                      <TableCell sx={{ fontWeight: 'bold' }}>Grade</TableCell>
                                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {assignment.submissions?.map((submission, index) => (
                                      <TableRow key={index} hover>
                                        <TableCell>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#10b981' }}>
                                              <PersonIcon sx={{ fontSize: 18 }} />
                                            </Avatar>
                                            <Box>
                                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                {submission.studentName}
                                              </Typography>
                                              <Typography variant="caption" color="text.secondary">
                                                ID: {submission.studentId}
                                              </Typography>
                                            </Box>
                                          </Box>
                                        </TableCell>
                                        <TableCell>
                                          <Chip 
                                            label={submission.status === 'submitted' ? 'Submitted' : 'Not Submitted'} 
                                            size="small" 
                                            color={submission.status === 'submitted' ? 'success' : 'default'} 
                                            variant="outlined"
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2">
                                            {submission.submittedAt ? formatDateTime(submission.submittedAt) : 'Not submitted'}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {submission.grade ? (
                                              <Chip 
                                                label={`${submission.grade.score}/${submission.grade.maxPoints} (${submission.grade.percentage}%)`} 
                                                size="small" 
                                                color="primary"
                                                variant="filled"
                                              />
                                            ) : (
                                              <Typography variant="body2" color="text.secondary">
                                                Not graded
                                              </Typography>
                                            )}
                                          </Box>
                                        </TableCell>
                                        <TableCell>
                                          <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button
                                              size="small"
                                              variant="outlined"
                                              startIcon={<VisibilityIcon />}
                                              sx={{ mr: 1 }}
                                              onClick={() => {
                                                setSubmissionDialog({
                                                  open: true,
                                                  submission: submission,
                                                  assignment: assignment
                                                });
                                              }}
                                            >
                                              View
                                            </Button>
                                            <Button
                                              size="small"
                                              variant="contained"
                                              startIcon={<GradeIcon />}
                                              color="success"
                                              onClick={() => {
                                                setGradingDialog({
                                                  open: true,
                                                  submission: submission,
                                                  assignment: assignment,
                                                  score: submission.grade?.score || '',
                                                  feedback: submission.grade?.feedback || '',
                                                  loading: false
                                                });
                                              }}
                                            >
                                              Grade
                                            </Button>
                                          </Box>
                                        </TableCell>
                                      </TableRow>
                                    )) || (
                                      <TableRow>
                                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                                          <Typography variant="body2" color="text.secondary">
                                            No submissions yet
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <AssignmentIcon sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Assignments Created
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Create your first assignment to get started
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          fetchSubjectsData();
                          setAssignmentTab(1);
                        }}
                      >
                        Create Assignment
                      </Button>
                    </Box>
                  )}
                </Box>
              ) : (
                // Create Assignment Tab
                <AssignmentCreationForm 
                  subjectsData={subjectsData}
                  classesData={dashboardData?.classes || []}
                  onBack={() => setAssignmentTab(0)}
                  onSubmit={fetchAssignments}
                  setAssignmentDialog={setAssignmentDialog}
                />
              )}
            </Card>
          </Box>
        );

      case 4: // Quizzes
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                Quizzes
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<VisibilityIcon />}
                  onClick={() => setActiveTab(2)}
                >
                  View Subjects
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => router.push('/teacher/quiz/create')}
                  sx={{
                    bgcolor: '#8b5cf6',
                    '&:hover': { bgcolor: '#7c3aed' }
                  }}
                >
                  Create Quiz
                </Button>
              </Box>
            </Box>

            <Card sx={{ p: 3, border: '1px solid #e2e8f0' }}>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <QuizIcon sx={{ fontSize: 64, color: '#8b5cf6', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Quiz Management
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Create interactive quizzes with timer functionality and instant feedback.
                </Typography>
                <Box sx={{ mt: 3, textAlign: 'left', maxWidth: 400, mx: 'auto' }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • Create multiple choice, true/false, and short answer questions
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • Set time limits with visual countdown timer
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • Automatic grading and instant results
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • Review student performance and identify weak areas
                  </Typography>
                  <Typography variant="body2">
                    • Generate detailed quiz analytics and reports
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        );

      case 5: // Announcements
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                Announcements
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<VisibilityIcon />}
                  onClick={() => setActiveTab(2)}
                >
                  View Subjects
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={() => router.push('/teacher/announcements')}
                  sx={{
                    bgcolor: '#10b981',
                    '&:hover': { bgcolor: '#059669' }
                  }}
                >
                  Create Announcement
                </Button>
              </Box>
            </Box>

            <Card sx={{ p: 3, border: '1px solid #e2e8f0' }}>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <AnnouncementIcon sx={{ fontSize: 64, color: '#10b981', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Announcement Center
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Send important notices and updates to your students and classes.
                </Typography>
                <Box sx={{ mt: 3, textAlign: 'left', maxWidth: 400, mx: 'auto' }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • Create announcements for specific subjects or classes
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • Schedule announcements for future delivery
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • Send urgent notifications with priority levels
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • Track read receipts and student engagement
                  </Typography>
                  <Typography variant="body2">
                    • Manage announcement history and archives
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        );

      case 6: // Resources
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                Resources
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<VisibilityIcon />}
                  onClick={() => setActiveTab(2)}
                >
                  View Subjects
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => router.push('/teacher/resources')}
                  sx={{
                    bgcolor: '#f59e0b',
                    '&:hover': { bgcolor: '#d97706' }
                  }}
                >
                  Upload Resource
                </Button>
              </Box>
            </Box>

            <Card sx={{ p: 3, border: '1px solid #e2e8f0' }}>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <ResourceIcon sx={{ fontSize: 64, color: '#f59e0b', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Resource Library
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Organize and share educational materials with your students.
                </Typography>
                <Box sx={{ mt: 3, textAlign: 'left', maxWidth: 400, mx: 'auto' }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • Upload documents, videos, and learning materials
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • Organize resources by subject and topic
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • Share files with specific classes or students
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • Track resource usage and download statistics
                  </Typography>
                  <Typography variant="body2">
                    • Create interactive learning modules and presentations
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  if (!mounted || !user || loading) {
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

  // Prevent hydration issues by not rendering until mounted
  if (!mounted) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: '#f5f7fa'
      }}>
        <CircularProgress />
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
<<<<<<< HEAD
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
=======
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
            {dashboardData?.schoolName && (
              <Typography variant="caption" sx={{ display: 'block', opacity: 0.7 }}>
                School: {dashboardData.schoolName}
              </Typography>
            )}
          </Box>
        </Box>
        </Box>
>>>>>>> 99ca4a1 (Initial commit)

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
              { label: 'Dashboard', icon: <DashboardIcon />, color: '#1e3a8a', index: 0 },
              { label: 'My Classes', icon: <ClassIcon />, color: '#3b82f6', index: 1 },
              { label: 'Subjects', icon: <SubjectIcon />, color: '#8b5cf6', index: 2 },
              { label: 'Assignments', icon: <AssignmentIcon />, color: '#10b981', index: 3 },
              { label: 'Quizzes', icon: <QuizIcon />, color: '#f59e0b', index: 4 },
              { label: 'Announcements', icon: <AnnouncementIcon />, color: '#ef4444', index: 5 },
              { label: 'Resources', icon: <ResourceIcon />, color: '#6b7280', index: 6 },
            ].map((item) => (
              <ListItem
                key={item.label}
                onClick={() => {
                  if (item.index === 5) { // Announcements
                    router.push('/teacher/announcements');
                  } else if (item.index === 6) { // Resources
                    router.push('/teacher/resources');
                  } else {
                    setActiveTab(item.index);
                    if (item.index === 1) { // My Classes tab
                      fetchClassesWithStudents();
                    } else if (item.index === 2) { // Subjects tab
                      fetchSubjectsData();
                    } else if (item.index === 3) { // Assignments tab
                      fetchSubjectsData(); // Fetch subjects for assignment creation
                      fetchAssignments(); // Fetch existing assignments
                    }
                  }
                }}
                sx={{
                  mx: 1,
                  mb: 1,
                  borderRadius: 2,
                  bgcolor: mounted && activeTab === item.index ? 'rgba(255,255,255,0.15)' : 'transparent',
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
                    fontWeight: activeTab === item.index ? 'bold' : 'normal'
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
          {renderMainContent()}
        </Box>
      </Box>

      {/* Assignment Creation Success/Error Dialog */}
      <Dialog
        open={assignmentDialog.open}
        onClose={() => setAssignmentDialog({ ...assignmentDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          bgcolor: mounted && assignmentDialog.type === 'success' ? '#f0f9ff' : mounted && assignmentDialog.type === 'error' ? '#fef2f2' : '#f8fafc',
          color: mounted && assignmentDialog.type === 'success' ? '#1e40af' : mounted && assignmentDialog.type === 'error' ? '#dc2626' : '#1e293b'
        }}>
          {assignmentDialog.type === 'success' ? (
            <>
              <Avatar sx={{ bgcolor: '#10b981', color: 'white' }}>
                ✓
              </Avatar>
              Assignment Created Successfully!
            </>
          ) : (
            <>
              <Avatar sx={{ bgcolor: '#ef4444', color: 'white' }}>
                ✕
              </Avatar>
              Assignment Creation Failed
            </>
          )}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {assignmentDialog.message}
          </Typography>
          
          {assignmentDialog.type === 'success' && (
            <Box sx={{ 
              p: 2, 
              bgcolor: '#f0f9ff', 
              borderRadius: 1, 
              border: '1px solid #3b82f6'
            }}>
              <Typography variant="body2" color="primary" sx={{ fontWeight: 'medium' }}>
                💡 What&apos;s Next?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                • Students can now view this assignment in their dashboard<br/>
                • Monitor submissions in the "View Assignments & Submissions" tab<br/>
                • Grade submissions when students submit their work
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setAssignmentDialog({ ...assignmentDialog, open: false })}
            variant={mounted && assignmentDialog.type === 'success' ? 'contained' : 'outlined'}
            sx={{
              bgcolor: mounted && assignmentDialog.type === 'success' ? '#10b981' : 'transparent',
              '&:hover': {
                bgcolor: mounted && assignmentDialog.type === 'success' ? '#059669' : '#f3f4f6'
              }
            }}
          >
            {mounted && assignmentDialog.type === 'success' ? 'Great!' : 'Try Again'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Assignment Dialog */}
      <Dialog
        open={editAssignmentDialog.open}
        onClose={() => setEditAssignmentDialog({ open: false, assignment: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Assignment
        </DialogTitle>
        <DialogContent>
          {editAssignmentDialog.assignment && (
            <AssignmentEditForm
              assignment={editAssignmentDialog.assignment}
              onClose={() => setEditAssignmentDialog({ open: false, assignment: null })}
              onSubmit={() => {
                fetchAssignments(); // Refresh assignments list
                setEditAssignmentDialog({ open: false, assignment: null });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Submission Dialog */}
      <Dialog
        open={submissionDialog.open}
        onClose={() => setSubmissionDialog({ open: false, submission: null, assignment: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Student Submission
        </DialogTitle>
        <DialogContent>
          {submissionDialog.submission && submissionDialog.assignment && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <Card sx={{ p: 3, border: '1px solid #e2e8f0' }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                      Assignment: {submissionDialog.assignment.title}
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Student:</strong> {submissionDialog.submission.studentName || submissionDialog.submission.studentId}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Submitted:</strong> {submissionDialog.submission.submittedAt ? 
                          new Date(submissionDialog.submission.submittedAt).toLocaleString() : 'Not submitted'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Status:</strong> {submissionDialog.submission.status || 'Pending'}
                      </Typography>
                    </Box>
                    
                    {submissionDialog.submission.content && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Text Submission:
                        </Typography>
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: '#f8fafc', 
                          borderRadius: 1, 
                          border: '1px solid #e2e8f0',
                          maxHeight: 200,
                          overflow: 'auto'
                        }}>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {submissionDialog.submission.content}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    
                    {submissionDialog.submission.files && submissionDialog.submission.files.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                          File Attachments ({submissionDialog.submission.files.length}):
                        </Typography>
                        <Grid container spacing={2}>
                          {submissionDialog.submission.files.map((attachment: any, index: number) => (
                            <Grid size={{ xs: 12, sm: 6 }} key={index}>
                              <Card sx={{ 
                                p: 2, 
                                border: '1px solid #e2e8f0',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: '#f8fafc' }
                              }}
                              onClick={() => {
                                if (attachment.url || attachment.fileName) {
                                  window.open(attachment.url || `/uploads/${attachment.fileName}`, '_blank');
                                }
                              }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar sx={{ bgcolor: '#3b82f6' }}>
                                    <FileUploadIcon />
                                  </Avatar>
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="body1" sx={{ fontWeight: 'medium' }} noWrap>
                                      {attachment.name || attachment.fileName || `Attachment ${index + 1}`}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {attachment.size ? `${(attachment.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                                      {attachment.type && ` • ${attachment.type.split('/')[1]?.toUpperCase()}`}
                                    </Typography>
                                  </Box>
                                  <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
                                    Click to view
                                  </Typography>
                                </Box>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}

                    {!submissionDialog.submission.content && (!submissionDialog.submission.files || submissionDialog.submission.files.length === 0) && (
                      <Box sx={{ 
                        p: 3, 
                        textAlign: 'center',
                        bgcolor: '#fef3cd',
                        borderRadius: 1,
                        border: '1px solid #fbbf24',
                        mb: 3
                      }}>
                        <Typography variant="body2" color="warning.dark">
                          No submission content or attachments found
                        </Typography>
                      </Box>
                    )}

                    {submissionDialog.submission.grade && (
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: '#f0f9ff', 
                        borderRadius: 1, 
                        border: '1px solid #3b82f6' 
                      }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#1976d2' }}>
                          Current Grade:
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Score:</strong> {submissionDialog.submission.grade.score}/{submissionDialog.submission.grade.maxPoints} 
                          ({submissionDialog.submission.grade.percentage}% - {submissionDialog.submission.grade.letterGrade})
                        </Typography>
                        {submissionDialog.submission.grade.feedback && (
                          <Typography variant="body2">
                            <strong>Feedback:</strong> {submissionDialog.submission.grade.feedback}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setSubmissionDialog({ open: false, submission: null, assignment: null })}
            variant="outlined"
          >
            Close
          </Button>
          <Button
            onClick={() => {
              setGradingDialog({
                open: true,
                submission: submissionDialog.submission,
                assignment: submissionDialog.assignment,
                score: submissionDialog.submission?.grade?.score || '',
                feedback: submissionDialog.submission?.grade?.feedback || '',
                loading: false
              });
              setSubmissionDialog({ open: false, submission: null, assignment: null });
            }}
            variant="contained"
            startIcon={<GradeIcon />}
          >
            Grade This Submission
          </Button>
        </DialogActions>
      </Dialog>

      {/* Grading Dialog */}
      <Dialog
        open={gradingDialog.open}
        onClose={() => setGradingDialog({ open: false, submission: null, assignment: null, score: '', feedback: '', loading: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Grade Assignment
        </DialogTitle>
        <DialogContent>
          {gradingDialog.submission && gradingDialog.assignment && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Assignment:</strong> {gradingDialog.assignment.title}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Student:</strong> {gradingDialog.submission.studentName || gradingDialog.submission.studentId}
                </Typography>
                <Typography variant="body2">
                  <strong>Total Marks:</strong> {gradingDialog.assignment.totalMarks || 100}
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Score"
                    type="number"
                    value={gradingDialog.score}
                    onChange={(e) => setGradingDialog({ ...gradingDialog, score: e.target.value })}
                    inputProps={{ 
                      min: 0, 
                      max: gradingDialog.assignment.totalMarks || 100 
                    }}
                    helperText={`Out of ${gradingDialog.assignment.totalMarks || 100} marks`}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Feedback (Optional)"
                    multiline
                    rows={4}
                    value={gradingDialog.feedback}
                    onChange={(e) => setGradingDialog({ ...gradingDialog, feedback: e.target.value })}
                    placeholder="Provide feedback to help the student improve..."
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setGradingDialog({ open: false, submission: null, assignment: null, score: '', feedback: '', loading: false })}
            variant="outlined"
            disabled={gradingDialog.loading}
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (!gradingDialog.score || !gradingDialog.submission || !gradingDialog.assignment) return;
              
              const maxMarks = gradingDialog.assignment.totalMarks || 100;
              const scoreValue = parseInt(gradingDialog.score);
              
              // Validate score doesn't exceed maximum marks
              if (scoreValue > maxMarks) {
                setAssignmentDialog({
                  open: true,
                  type: 'error',
                  message: `Score cannot exceed maximum marks of ${maxMarks}. Please enter a valid score.`
                });
                return;
              }
              
              if (scoreValue < 0) {
                setAssignmentDialog({
                  open: true,
                  type: 'error',
                  message: 'Score cannot be negative. Please enter a valid score.'
                });
                return;
              }
              
              setGradingDialog({ ...gradingDialog, loading: true });
              
              try {
                const response = await fetch(`/api/teacher/assignments/${gradingDialog.assignment.id}/grade`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  credentials: 'include',
                  body: JSON.stringify({
                    studentId: gradingDialog.submission.studentId,
                    score: parseInt(gradingDialog.score),
                    feedback: gradingDialog.feedback,
                    maxPoints: gradingDialog.assignment.totalMarks || 100
                  }),
                });

                if (response.ok) {
                  setAssignmentDialog({
                    open: true,
                    type: 'success',
                    message: 'Assignment graded successfully!'
                  });
                  fetchAssignments(); // Refresh assignments to show updated grades
                  setGradingDialog({ open: false, submission: null, assignment: null, score: '', feedback: '', loading: false });
                } else {
                  throw new Error('Failed to grade assignment');
                }
              } catch (error) {
                console.error('Error grading assignment:', error);
                setAssignmentDialog({
                  open: true,
                  type: 'error',
                  message: 'Failed to grade assignment. Please try again.'
                });
                setGradingDialog({ ...gradingDialog, loading: false });
              }
            }}
            variant="contained"
            disabled={gradingDialog.loading || !gradingDialog.score}
            startIcon={gradingDialog.loading ? <CircularProgress size={20} /> : <GradeIcon />}
          >
            {gradingDialog.loading ? 'Grading...' : 'Submit Grade'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

