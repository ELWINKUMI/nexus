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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AppBar,
  Toolbar,
  IconButton,
  Breadcrumbs,
  Link,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  LinearProgress,
  Tooltip,
  Fab,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Send as SendIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  AttachFile as AttachFileIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Description as DescriptionIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarIcon,
  Sync as AutoSaveIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';

// Rich text editor component (placeholder - you can replace with react-quill, draft-js, etc.)
const RichTextEditor = ({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder?: string }) => {
  return (
    <TextField
      multiline
      rows={12}
      fullWidth
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      variant="outlined"
      sx={{
        '& .MuiOutlinedInput-root': {
          padding: 2,
          fontSize: '16px',
          lineHeight: 1.6
        }
      }}
    />
  );
};

interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  subjectColor: string;
  teacher: string;
  dueDate: string;
  maxPoints: number;
  instructions: string;
  attachments: { id: string; name: string; type: string; url: string }[];
  submissionTypes: ('text' | 'file' | 'both')[];
  allowLateSubmission: boolean;
  estimatedTime: string;
  category: string;
}

interface UploadedFile {
  name: string; // original file name
  url: string;  // server file url or fileName
}

interface Submission {
  textContent: string;
  uploadedFiles: (File | UploadedFile)[];
  status: 'draft' | 'submitted';
  lastSaved: Date;
  submittedAt?: Date;
}

export default function AssignmentWorkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get('id');

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission>({
    textContent: '',
    uploadedFiles: [],
    status: 'draft',
    lastSaved: new Date(0) // Use consistent timestamp initially
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showInstructionsDialog, setShowInstructionsDialog] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isClient, setIsClient] = useState(false);
  // Mock assignment data
  const mockAssignment: Assignment = {
    id: '1',
    title: 'Essay on Climate Change',
    description: 'Write a comprehensive essay on the effects of climate change on local ecosystems.',
    subject: 'Environmental Science',
    subjectColor: '#4CAF50',
    teacher: 'Dr. Sarah Johnson',
    dueDate: '2024-01-25T23:59:00Z',
    maxPoints: 100,
    instructions: `Please write a 1500-word essay analyzing the impact of climate change on local ecosystems. Your essay should include:

1. Introduction with clear thesis statement
2. Analysis of current climate change effects
3. Impact on local flora and fauna
4. Discussion of adaptation strategies
5. Conclusion with personal insights

Requirements:
- Minimum 1500 words
- At least 5 scholarly sources
- Proper APA citations
- Include graphs or charts if relevant
- Submit as both text and uploaded file`,
    attachments: [
      { id: '1', name: 'Assignment Guidelines.pdf', type: 'pdf', url: '/files/guidelines.pdf' },
      { id: '2', name: 'Research Sources.docx', type: 'docx', url: '/files/sources.docx' },
      { id: '3', name: 'Citation Format.pdf', type: 'pdf', url: '/files/citation.pdf' }
    ],
    submissionTypes: ['text', 'file'],
    allowLateSubmission: true,
    estimatedTime: '3-4 hours',
    category: 'essay'
  };

  useEffect(() => {
    if (assignmentId) {
      loadAssignment();
      loadSubmission();
    }
  }, [assignmentId]);

  // Set client flag for hydration-safe rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && hasUnsavedChanges) {
      const timer = setTimeout(() => {
        handleSaveDraft();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(timer);
    }
  }, [submission.textContent, submission.uploadedFiles, hasUnsavedChanges, autoSaveEnabled]);

  // Auto-save to localStorage for immediate persistence
  useEffect(() => {
    if (assignmentId && (submission.textContent || submission.uploadedFiles.length > 0) && typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        const submissionToSave = {
          textContent: submission.textContent,
          uploadedFiles: submission.uploadedFiles.map(file => {
            if (file instanceof File) {
              // Not yet uploaded, just store name and empty url
              return { name: file.name, url: '' };
            }
            // Already uploaded, keep as is
            return file;
          }),
          lastSaved: new Date().toISOString()
        };
        localStorage.setItem(`assignment_${assignmentId}_submission`, JSON.stringify(submissionToSave));
      }, 1000); // Save to localStorage after 1 second of no changes

      return () => clearTimeout(timer);
    }
  }, [submission.textContent, submission.uploadedFiles, assignmentId]);

  const loadAssignment = async () => {
    if (!assignmentId) return;
    try {
      setIsLoading(true);
      // Fetch real assignment from API
      const response = await fetch(`/api/student/assignments/${assignmentId}`, {
        credentials: 'include'
      });
      let serverSubmission = null;
      let serverLastSaved = new Date(0);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched assignment:', data);
        setAssignment(data);
        // Load existing submission if available
        if (data.submission) {
          serverSubmission = {
            textContent: data.submission.content || '',
            uploadedFiles: data.submission.attachments || [],
            status: data.submission.status || 'draft',
            lastSaved: data.submission.updatedAt ? new Date(data.submission.updatedAt) : new Date(0)
          };
          serverLastSaved = serverSubmission.lastSaved;
        }
      } else {
        console.error('Failed to fetch assignment:', response.status);
        setAssignment(mockAssignment);
      }
      // Merge with localStorage if newer
      if (assignmentId && typeof window !== 'undefined') {
        const savedSubmission = localStorage.getItem(`assignment_${assignmentId}_submission`);
        if (savedSubmission) {
          try {
            const parsed = JSON.parse(savedSubmission);
            const localSavedTime = new Date(parsed.lastSaved);
            if (localSavedTime > serverLastSaved) {
              // Only keep serializable objects (with name and url)
              const filteredFiles = Array.isArray(parsed.uploadedFiles)
                ? parsed.uploadedFiles.filter((f: any) => f && typeof f === 'object' && 'name' in f && 'url' in f)
                : [];
              setSubmission({
                textContent: parsed.textContent || '',
                uploadedFiles: filteredFiles,
                status: 'draft',
                lastSaved: localSavedTime
              });
              setIsLoading(false);
              return;
            }
          } catch (parseError) {
            console.error('Error parsing saved submission:', parseError);
          }
        }
      }
      // If no localStorage is newer, use server
      if (serverSubmission) {
        setSubmission(serverSubmission);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading assignment:', error);
      setAssignment(mockAssignment);
      setIsLoading(false);
    }
  };

  const loadSubmission = async () => {
    try {
      // Load from localStorage only after server data is loaded
      // This ensures we don't lose server-saved file references
      if (assignmentId && typeof window !== 'undefined') {
        const savedSubmission = localStorage.getItem(`assignment_${assignmentId}_submission`);
        if (savedSubmission) {
          try {
            const parsed = JSON.parse(savedSubmission);
            const localSavedTime = new Date(parsed.lastSaved);
            // Only use localStorage data if it's more recent than current submission
            setSubmission(prev => {
              const currentSavedTime = prev.lastSaved || new Date(0);
              if (localSavedTime > currentSavedTime) {
                console.log('Loading newer draft from localStorage');
                // Only keep serializable objects (with name and url)
                const filteredFiles = Array.isArray(parsed.uploadedFiles)
                  ? parsed.uploadedFiles.filter((f: any) => f && typeof f === 'object' && 'name' in f && 'url' in f)
                  : [];
                return {
                  ...prev,
                  textContent: parsed.textContent || prev.textContent,
                  uploadedFiles: filteredFiles,
                  lastSaved: localSavedTime
                };
              }
              return prev; // Keep server data if it's newer or equal
            });
          } catch (parseError) {
            console.error('Error parsing saved submission:', parseError);
          }
        }
      }
    } catch (error) {
      console.error('Error loading submission:', error);
    }
  };

  const handleTextChange = (newText: string) => {
    setSubmission(prev => ({ ...prev, textContent: newText }));
    setHasUnsavedChanges(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSubmission(prev => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, ...files] as (File | UploadedFile)[]
    }));
    setHasUnsavedChanges(true);
  };

  const handleFileRemove = (index: number) => {
    setSubmission(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index)
    }));
    setHasUnsavedChanges(true);
  };

  const handleSaveDraft = async () => {
    if (!assignmentId) return;
    try {
      setIsSaving(true);
      let attachmentData: UploadedFile[] = [];
      // Upload files first if there are any new files
      const newFiles = submission.uploadedFiles.filter(file => file instanceof File) as File[];
      if (newFiles.length > 0) {
        const fileFormData = new FormData();
        newFiles.forEach(file => {
          fileFormData.append('files', file);
        });
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          credentials: 'include',
          body: fileFormData
        });
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          // Combine uploaded files with existing file references
          const existingAttachments = submission.uploadedFiles
            .filter(file => typeof file !== 'object' || file instanceof File === false)
            .filter(file => typeof file === 'object' && 'name' in file && 'url' in file) as UploadedFile[];
          // Map uploaded files to { name, url }
          const newAttachments: UploadedFile[] = uploadResult.files.map((file: any, idx: number) => ({
            name: newFiles[idx].name,
            url: file.fileName || file.url || file.path || ''
          }));
          attachmentData = [...existingAttachments, ...newAttachments];
        } else {
          throw new Error('Failed to upload files');
        }
      } else {
        // No new files, just use existing file references
        attachmentData = submission.uploadedFiles.filter(file => typeof file === 'object' && 'name' in file && 'url' in file) as UploadedFile[];
      }
      // Save draft to API
      const response = await fetch('/api/student/assignments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          assignmentId,
          content: submission.textContent,
          attachments: attachmentData,
          isDraft: true
        })
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Draft saved successfully:', data);
        // Update submission state to replace File objects with {name, url}
        const updatedSubmission = {
          ...submission,
          uploadedFiles: attachmentData,
          lastSaved: new Date()
        };
        setSubmission(updatedSubmission);
        setHasUnsavedChanges(false);
        setSnackbarMessage('Draft saved successfully');
        setSnackbarOpen(true);
        // Also save to localStorage for offline access - use the updated data
        if (typeof window !== 'undefined') {
          const submissionToSave = {
            textContent: updatedSubmission.textContent,
            uploadedFiles: attachmentData,
            lastSaved: new Date().toISOString()
          };
          localStorage.setItem(`assignment_${assignmentId}_submission`, JSON.stringify(submissionToSave));
        }
      } else {
        throw new Error('Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setSnackbarMessage('Error saving draft');
      setSnackbarOpen(true);
      // Still save to localStorage even if server save fails
      if (typeof window !== 'undefined') {
        const filesToSave = submission.uploadedFiles.map(file => {
          if (file instanceof File) {
            return { name: file.name, url: '' };
          }
          return file;
        });
        const submissionToSave = {
          textContent: submission.textContent,
          uploadedFiles: filesToSave,
          lastSaved: new Date().toISOString()
        };
        localStorage.setItem(`assignment_${assignmentId}_submission`, JSON.stringify(submissionToSave));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!assignmentId) return;
    
    try {
      setIsSaving(true);
      
      let attachmentData = [];
      
      // Upload files first if there are any new files
      const newFiles = submission.uploadedFiles.filter(file => file instanceof File);
      if (newFiles.length > 0) {
        const fileFormData = new FormData();
        newFiles.forEach(file => {
          fileFormData.append('files', file);
        });

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          credentials: 'include',
          body: fileFormData
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          // Combine uploaded files with existing file references
          const existingAttachments = submission.uploadedFiles
            .filter(file => typeof file === 'string')
            .map(fileName => fileName);
          
          const newAttachments = uploadResult.files.map((file: any) => file.fileName);
          attachmentData = [...existingAttachments, ...newAttachments];
        } else {
          throw new Error('Failed to upload files');
        }
      } else {
        // No new files, just use existing file references
        attachmentData = submission.uploadedFiles.filter(file => typeof file === 'string');
      }
      
      // Submit assignment to API
      const response = await fetch('/api/student/assignments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          assignmentId,
          content: submission.textContent,
          attachments: attachmentData,
          isDraft: false
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Assignment submitted successfully:', data);
        setSubmission(prev => ({ 
          ...prev, 
          status: 'submitted', 
          lastSaved: new Date(),
          submittedAt: new Date() 
        }));
        setHasUnsavedChanges(false);
        setSnackbarMessage('Assignment submitted successfully!');
        setSnackbarOpen(true);
        
        // Redirect back to assignments page after a delay
        setTimeout(() => {
          router.push('/student/assignments');
        }, 2000);
      } else {
        throw new Error('Failed to submit assignment');
      }
      
    } catch (error) {
      console.error('Error submitting assignment:', error);
      setSnackbarMessage('Error submitting assignment');
      setSnackbarOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading assignment...
        </Typography>
      </Container>
    );
  }

  if (!assignment) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Assignment not found or could not be loaded.
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/student/assignments')}
          sx={{ mt: 2 }}
        >
          Back to Assignments
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Top App Bar */}
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => router.push('/student/assignments')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" noWrap>
              {assignment.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {assignment.subject} • Due: {formatDate(assignment.dueDate)}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            {hasUnsavedChanges && (
              <Chip
                label="Unsaved changes"
                color="warning"
                size="small"
                icon={<WarningIcon />}
              />
            )}
            
            {submission.status === 'submitted' && (
              <Chip
                label="Submitted"
                color="success"
                size="small"
                icon={<CheckCircleIcon />}
              />
            )}

            <Tooltip title="Save Draft">
              <Button
                variant="outlined"
                startIcon={isSaving ? <AutoSaveIcon /> : <SaveIcon />}
                onClick={handleSaveDraft}
                disabled={isSaving || submission.status === 'submitted'}
                size="small"
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
            </Tooltip>

            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={() => setShowSubmitDialog(true)}
              disabled={
                submission.status === 'submitted' || 
                (!submission.textContent.trim() && submission.uploadedFiles.length === 0)
              }
              size="small"
            >
              Submit
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Grid container spacing={3}>
          {/* Main Content Area */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Assignment Submission
                </Typography>
                <Breadcrumbs>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => router.push('/student/assignments')}
                    sx={{ textDecoration: 'none' }}
                  >
                    Assignments
                  </Link>
                  <Typography variant="body2" color="text.primary">
                    {assignment.title}
                  </Typography>
                </Breadcrumbs>
              </Box>

              {/* Status and Progress */}
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Chip
                      label={assignment.subject}
                      sx={{
                        backgroundColor: assignment.subjectColor,
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Grid>
                  <Grid item>
                    <Typography variant="body2" color="text.secondary">
                      Last saved: {isClient && submission.lastSaved ? submission.lastSaved.toLocaleTimeString() : 'Never'}
                    </Typography>
                  </Grid>
                  <Grid item xs>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Words: {getWordCount(submission.textContent)}
                      </Typography>
                      {getWordCount(submission.textContent) >= 1500 && (
                        <CheckCircleIcon color="success" fontSize="small" />
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Text Editor */}
              {assignment.submissionTypes.includes('text') && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Written Response
                  </Typography>
                  <RichTextEditor
                    value={submission.textContent}
                    onChange={handleTextChange}
                    placeholder="Start writing your assignment here..."
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Minimum 1500 words required
                  </Typography>
                </Box>
              )}

              {/* File Upload */}
              {assignment.submissionTypes.includes('file') && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    File Attachments
                  </Typography>
                  
                  <Box
                    sx={{
                      border: '2px dashed',
                      borderColor: 'grey.300',
                      borderRadius: 2,
                      p: 3,
                      textAlign: 'center',
                      mb: 2,
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                      id="file-upload"
                      disabled={submission.status === 'submitted'}
                    />
                    <label htmlFor="file-upload">
                      <Button
                        component="span"
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        disabled={submission.status === 'submitted'}
                      >
                        Upload Files
                      </Button>
                    </label>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Drag and drop files here or click to browse
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Supported formats: PDF, DOC, DOCX, TXT, PNG, JPG
                    </Typography>
                  </Box>

                  {/* Uploaded Files List */}
                  {submission.uploadedFiles.length > 0 && (
                    <List>
                      {submission.uploadedFiles.map((file, index) => (
                        <ListItem
                          key={index}
                          secondaryAction={
                            submission.status !== 'submitted' && (
                              <IconButton
                                edge="end"
                                onClick={() => handleFileRemove(index)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            )
                          }
                        >
                          <ListItemIcon>
                            <AttachFileIcon />
                          </ListItemIcon>
                          {file instanceof File ? (
                            <ListItemText
                              primary={file.name}
                              secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                            />
                          ) : (
                            <ListItemText
                              primary={
                                file && typeof file === 'object' && 'name' in file && 'url' in file ? (
                                  <a
                                    href={file.url.startsWith('/') ? file.url : `/uploads/${encodeURIComponent(file.url)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ textDecoration: 'underline', color: '#1976d2' }}
                                  >
                                    {file.name}
                                  </a>
                                ) : ''
                              }
                              secondary="Uploaded file"
                            />
                          )}
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Assignment Info */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Assignment Details
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Due Date
                    </Typography>
                    <Typography
                      variant="body1"
                      color={isOverdue(assignment.dueDate) ? 'error' : 'inherit'}
                      sx={{ fontWeight: isOverdue(assignment.dueDate) ? 'bold' : 'normal' }}
                    >
                      {formatDate(assignment.dueDate)}
                      {!isOverdue(assignment.dueDate) && (
                        <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          ({getDaysUntilDue(assignment.dueDate)} days left)
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Points
                    </Typography>
                    <Typography variant="body1">{assignment.maxPoints} points</Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Estimated Time
                    </Typography>
                    <Typography variant="body1">{assignment.estimatedTime}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Teacher
                    </Typography>
                    <Typography variant="body1">{assignment.teacher}</Typography>
                  </Box>
                </Stack>
              </Paper>

              {/* Instructions */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoIcon color="primary" />
                    <Typography variant="h6">Instructions</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {assignment.instructions}
                  </Typography>
                </AccordionDetails>
              </Accordion>

              {/* Resources */}
              {assignment.attachments.length > 0 && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Resources
                  </Typography>
                  <List dense>
                    {assignment.attachments.map(attachment => (
                      <ListItem
                        key={attachment.id}
                        component="button"
                        onClick={() => window.open(attachment.url, '_blank')}
                      >
                        <ListItemIcon>
                          <DescriptionIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={attachment.name}
                          secondary={attachment.type.toUpperCase()}
                        />
                        <DownloadIcon color="action" />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* Submit Confirmation Dialog */}
      <Dialog
        open={showSubmitDialog}
        onClose={() => setShowSubmitDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Submit Assignment?</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography>
              Are you sure you want to submit your assignment? Once submitted, you will not be able to make any changes.
            </Typography>
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Submission Summary:
              </Typography>
              <Typography variant="body2">
                • Word count: {getWordCount(submission.textContent)} words
              </Typography>
              <Typography variant="body2">
                • Files attached: {submission.uploadedFiles.length}
              </Typography>
              {getWordCount(submission.textContent) < 1500 && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  Your essay is below the minimum word count of 1500 words.
                </Alert>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSubmitDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSaving}
          >
            {isSaving ? 'Submitting...' : 'Submit Assignment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />

      {/* Floating Action Button for quick save (mobile) */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={handleSaveDraft}
        disabled={isSaving || submission.status === 'submitted'}
      >
        {isSaving ? <AutoSaveIcon /> : <SaveIcon />}
      </Fab>
    </Box>
  );
}
