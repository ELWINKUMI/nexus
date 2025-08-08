'use client';

import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
=======
import MathRenderer from '@/components/MathRenderer';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
>>>>>>> 99ca4a1 (Initial commit)
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
<<<<<<< HEAD
  Grid,
=======
>>>>>>> 99ca4a1 (Initial commit)
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  RadioGroup,
  Radio,
  Checkbox,
  FormGroup,
  Tabs,
  Tab,
  Breadcrumbs,
  Link,
  Snackbar,
  CircularProgress
} from '@mui/material';
<<<<<<< HEAD
=======
import Grid from '@mui/material/Grid';
>>>>>>> 99ca4a1 (Initial commit)
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Preview as PreviewIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Publish as PublishIcon,
  DragIndicator as DragIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ArrowBack as ArrowBackIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Quiz as QuizIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useRouter } from 'next/navigation';

interface Question {
  id: string;
<<<<<<< HEAD
  type: 'multiple_choice' | 'multiple_select' | 'true_false' | 'short_answer' | 'essay' | 'fill_blank' | 'matching' | 'ordering';
=======
  type: 'multiple_choice' | 'multiple_select' | 'true_false' | 'short_answer' | 'essay' | 'fill_blank';
>>>>>>> 99ca4a1 (Initial commit)
  question: string;
  options?: string[];
  correctAnswers: string[] | number[];
  points: number;
  feedback?: string;
  tags?: string[];
  required: boolean;
}

interface QuizData {
  title: string;
  description: string;
  instructions: string;
  classId: string;
  subjectId: string;
  timeLimit: number;
  attemptsAllowed: number;
  startDate?: Date | null;
  endDate?: Date | null;
  randomizeQuestions: boolean;
  randomizeAnswers: boolean;
  showCorrectAnswers: boolean;
  showScoreImmediately: boolean;
  oneQuestionAtTime: boolean;
  passwordProtected: boolean;
  password?: string;
  questions: Question[];
  status: 'draft' | 'published';
}

<<<<<<< HEAD
=======
// Remove all trial questions from TEST_QUESTIONS
const TEST_QUESTIONS: Question[] = [];

>>>>>>> 99ca4a1 (Initial commit)
const steps = ['Quiz Details', 'Questions', 'Settings', 'Preview'];

const questionTypes = [
  { value: 'multiple_choice', label: 'Multiple Choice (Single)' },
  { value: 'multiple_select', label: 'Multiple Choice (Multiple)' },
  { value: 'true_false', label: 'True/False' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'essay', label: 'Essay/Open Response' },
<<<<<<< HEAD
  { value: 'fill_blank', label: 'Fill in the Blank' },
  { value: 'matching', label: 'Matching' },
  { value: 'ordering', label: 'Ordering/Sequence' }
=======
  { value: 'fill_blank', label: 'Fill in the Blank' }
>>>>>>> 99ca4a1 (Initial commit)
];

export default function CreateQuizPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  
  // Feedback dialog states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

<<<<<<< HEAD
=======
  // For testing: prefill quizData with all types
>>>>>>> 99ca4a1 (Initial commit)
  const [quizData, setQuizData] = useState<QuizData>({
    title: '',
    description: '',
    instructions: '',
    classId: '',
    subjectId: '',
<<<<<<< HEAD
    timeLimit: 60,
    attemptsAllowed: 1,
    startDate: null,
    endDate: null,
=======
    timeLimit: 30,
    attemptsAllowed: 1,
>>>>>>> 99ca4a1 (Initial commit)
    randomizeQuestions: false,
    randomizeAnswers: false,
    showCorrectAnswers: true,
    showScoreImmediately: true,
    oneQuestionAtTime: false,
    passwordProtected: false,
<<<<<<< HEAD
    password: '',
    questions: [],
    status: 'draft'
=======
    questions: [],
    status: 'draft',
>>>>>>> 99ca4a1 (Initial commit)
  });

  // Enhanced logging for quiz data changes
  useEffect(() => {
    console.log('QuizData state changed:', quizData);
  }, [quizData]);

  // Enhanced logging for classes and subjects data
  useEffect(() => {
    console.log('Classes data changed:', classes);
  }, [classes]);

  useEffect(() => {
    console.log('Subjects data changed:', subjects);
  }, [subjects]);

  useEffect(() => {
    fetchClassesAndSubjects();
  }, []);

  const fetchClassesAndSubjects = async () => {
    try {
      const [classesRes, subjectsRes] = await Promise.all([
        fetch('/api/teacher/classes', { credentials: 'include' }),
        fetch('/api/teacher/subjects', { credentials: 'include' })
      ]);

      if (classesRes.ok && subjectsRes.ok) {
        const classesData = await classesRes.json();
        const subjectsData = await subjectsRes.json();
        console.log('Classes loaded:', classesData);
        console.log('Subjects loaded:', subjectsData);
        setClasses(classesData);
        setSubjects(subjectsData);
      } else {
        console.error('Failed to fetch classes or subjects:', {
          classesStatus: classesRes.status,
          subjectsStatus: subjectsRes.status
        });
        // If unauthorized, redirect to login
        if (classesRes.status === 401 || subjectsRes.status === 401) {
          console.log('Unauthorized - redirecting to login');
          window.location.href = '/';
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const addNewQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'multiple_choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswers: [0],
      points: 1,
      feedback: '',
      tags: [],
      required: true
    };
    setEditingQuestion(newQuestion);
    setQuestionDialogOpen(true);
  };

  const editQuestion = (question: Question) => {
    setEditingQuestion({ ...question });
    setQuestionDialogOpen(true);
  };

  const saveQuestion = () => {
    if (editingQuestion) {
      const existingIndex = quizData.questions.findIndex(q => q.id === editingQuestion.id);
      if (existingIndex >= 0) {
        const updatedQuestions = [...quizData.questions];
        updatedQuestions[existingIndex] = editingQuestion;
        setQuizData({ ...quizData, questions: updatedQuestions });
      } else {
        setQuizData({ ...quizData, questions: [...quizData.questions, editingQuestion] });
      }
    }
    setQuestionDialogOpen(false);
    setEditingQuestion(null);
  };

  const deleteQuestion = (questionId: string) => {
    setQuizData({
      ...quizData,
      questions: quizData.questions.filter(q => q.id !== questionId)
    });
  };

  const saveQuiz = async (status: 'draft' | 'published') => {
    setIsSubmitting(true);
    setSubmitError('');
    
    // Validate required fields before sending
    const missingFields = [];
    if (!quizData.title?.trim()) missingFields.push('title');
    if (!quizData.classId) missingFields.push('class');
    if (!quizData.subjectId) missingFields.push('subject');
    if (!quizData.timeLimit || quizData.timeLimit <= 0) missingFields.push('timeLimit');
    
    if (missingFields.length > 0) {
      setSubmitSuccess(false);
      setSubmitError(`Missing required fields: ${missingFields.join(', ')}`);
      setSubmitDialogOpen(true);
      setIsSubmitting(false);
      return;
    }
    
    // Log the data being sent for debugging
    console.log('Saving quiz with data:', {
      ...quizData,
      status,
      questionsCount: quizData.questions.length
    });
    
    try {
      const response = await fetch('/api/teacher/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...quizData, status })
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitSuccess(true);
        setSubmitDialogOpen(true);
      } else {
        setSubmitSuccess(false);
        setSubmitError(result.error || 'Failed to save quiz. Please try again.');
        setSubmitDialogOpen(true);
      }
    } catch (error) {
      console.error('Error saving quiz:', error);
      setSubmitSuccess(false);
      setSubmitError('Network error. Please check your connection and try again.');
      setSubmitDialogOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTotalPoints = () => {
    return quizData.questions.reduce((total, q) => total + q.points, 0);
  };

  const renderQuizDetails = () => {
    console.log('Current quiz data state:', quizData);
    console.log('Available classes:', classes);
    console.log('Available subjects:', subjects);
    
    const requiredFields = [
      { field: 'title', label: 'Quiz Title', value: quizData.title },
      { field: 'classId', label: 'Class', value: quizData.classId },
      { field: 'subjectId', label: 'Subject', value: quizData.subjectId },
      { field: 'timeLimit', label: 'Time Limit', value: quizData.timeLimit }
    ];
    
    const missingFields = requiredFields.filter(field => !field.value);
    const completedFields = requiredFields.filter(field => field.value);
    
    return (
    <Card>
      <CardContent>
        {/* Validation Summary */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            <QuizIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Quiz Details
          </Typography>
          
          {/* Authentication Alert */}
          {classes.length === 0 && subjects.length === 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Authentication Required:</strong> Please ensure you are logged in as a teacher to access classes and subjects. 
                <Button 
                  size="small" 
                  onClick={() => window.location.href = '/'}
                  sx={{ ml: 1 }}
                >
                  Go to Login
                </Button>
              </Typography>
            </Alert>
          )}

          {/* Debug Info */}
          {(classes.length > 0 || subjects.length > 0) && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Data Loaded:</strong> Classes: {classes.length}, Subjects: {subjects.length}
                <br />
                <strong>Current Selection:</strong> Class: {quizData.classId || 'None'}, Subject: {quizData.subjectId || 'None'}
              </Typography>
            </Alert>
          )}

          {/* Progress Indicator */}
          <Box sx={{ mb: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Required Fields Progress
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {completedFields.length}/{requiredFields.length} Complete
              </Typography>
            </Box>
            <Box
              sx={{
                width: '100%',
                height: 8,
                backgroundColor: 'grey.200',
                borderRadius: 4,
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  width: `${(completedFields.length / requiredFields.length) * 100}%`,
                  height: '100%',
                  backgroundColor: completedFields.length === requiredFields.length ? 'success.main' : 'warning.main',
                  transition: 'width 0.3s ease'
                }}
              />
            </Box>
          </Box>

          {/* Field Status */}
          {missingFields.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="medium" gutterBottom>
                Please complete the following required fields:
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {missingFields.map((field) => (
                  <Typography component="li" key={field.field} variant="body2">
                    {field.label}
                  </Typography>
                ))}
              </Box>
            </Alert>
          )}

          {completedFields.length === requiredFields.length && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body2">
                ✓ All required fields completed! You can proceed to the next step.
              </Typography>
            </Alert>
          )}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Quiz Title *"
              value={quizData.title || ''}
              onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
              required
              size="medium"
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: '1.1rem',
                  minHeight: 56
                },
                '& .MuiInputLabel-root': {
                  fontSize: '1.1rem'
                }
              }}
              placeholder="Enter a clear and descriptive quiz title"
              helperText={
                quizData.title 
                  ? `✓ Title entered (${quizData.title.length} characters)`
                  : "Quiz title is required - make it descriptive and clear"
              }
              error={!quizData.title && quizData.title !== ''}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={quizData.description || ''}
              onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
              placeholder="Brief summary or overview of the quiz"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Instructions"
              value={quizData.instructions || ''}
              onChange={(e) => setQuizData({ ...quizData, instructions: e.target.value })}
              placeholder="Additional guidelines and instructions for students"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="medium" variant="outlined">
              <InputLabel id="class-select-label" sx={{ fontSize: '1.1rem' }}>
                Class *
              </InputLabel>
              <Select
                labelId="class-select-label"
                value={quizData.classId || ''}
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  console.log('Class onChange - Raw event:', e);
                  console.log('Class onChange - Value:', selectedValue, typeof selectedValue);
                  console.log('Current quizData.classId:', quizData.classId);
                  
                  // Ensure we're setting a string value
                  const cleanValue = selectedValue === '' ? '' : String(selectedValue);
                  
                  setQuizData(prev => {
                    const updated = { 
                      ...prev, 
                      classId: cleanValue 
                    };
                    console.log('Setting new quizData:', updated);
                    return updated;
                  });
                }}
                label="Class *"
                required
                sx={{ 
                  minHeight: 56,
                  '& .MuiSelect-select': {
                    padding: '16px 14px',
                    fontSize: '1rem'
                  }
                }}
                displayEmpty
                renderValue={(selected) => {
                  console.log('Class renderValue called with:', selected, 'type:', typeof selected);
                  if (!selected || selected === '') {
                    return <Typography color="text.secondary">Select a class</Typography>;
                  }
                  const selectedClass = classes.find(cls => cls.id === selected);
                  console.log('Found class for renderValue:', selectedClass);
                  return selectedClass?.name || `Unknown Class (${selected})`;
                }}
              >
                {classes.length === 0 ? [
                  <MenuItem key="loading" value="" disabled sx={{ display: 'none' }}>
                    <Typography color="text.secondary">
                      {classes.length === 0 && subjects.length === 0 ? 'Loading classes...' : 'No classes available'}
                    </Typography>
                  </MenuItem>
                ] : classes.map((cls, index) => {
                  console.log(`Rendering class MenuItem ${index}:`, cls);
                  return (
                    <MenuItem 
                      key={cls.id} 
                      value={cls.id}
                      onClick={() => console.log('MenuItem clicked for class:', cls.id)}
                      sx={{ 
                        fontSize: '1rem',
                        padding: '12px 16px',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          color: 'primary.contrastText'
                        }
                      }}
                    >
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {cls.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Class ID: {cls.id}
                        </Typography>
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
              {quizData.classId && (
                <Typography variant="caption" color="success.main" sx={{ mt: 1 }}>
                  ✓ Selected: {classes.find(cls => cls.id === quizData.classId)?.name}
                </Typography>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="medium" variant="outlined">
              <InputLabel id="subject-select-label" sx={{ fontSize: '1.1rem' }}>
                Subject *
              </InputLabel>
              <Select
                labelId="subject-select-label"
                value={quizData.subjectId || ''}
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  console.log('Subject onChange - Raw event:', e);
                  console.log('Subject onChange - Value:', selectedValue, typeof selectedValue);
                  console.log('Current quizData.subjectId:', quizData.subjectId);
                  
                  // Ensure we're setting a string value
                  const cleanValue = selectedValue === '' ? '' : String(selectedValue);
                  
                  setQuizData(prev => {
                    const updated = { 
                      ...prev, 
                      subjectId: cleanValue 
                    };
                    console.log('Setting new quizData:', updated);
                    return updated;
                  });
                }}
                label="Subject *"
                required
                sx={{ 
                  minHeight: 56,
                  '& .MuiSelect-select': {
                    padding: '16px 14px',
                    fontSize: '1rem'
                  }
                }}
                displayEmpty
                renderValue={(selected) => {
                  console.log('Subject renderValue called with:', selected, 'type:', typeof selected);
                  if (!selected || selected === '') {
                    return <Typography color="text.secondary">Select a subject</Typography>;
                  }
                  const selectedSubject = subjects.find(subject => subject._id === selected);
                  console.log('Found subject for renderValue:', selectedSubject);
                  return selectedSubject?.name || `Unknown Subject (${selected})`;
                }}
              >
                {subjects.length === 0 ? [
                  <MenuItem key="loading" value="" disabled sx={{ display: 'none' }}>
                    <Typography color="text.secondary">
                      {subjects.length === 0 && classes.length === 0 ? 'Loading subjects...' : 'No subjects available'}
                    </Typography>
                  </MenuItem>
                ] : subjects.map((subject, index) => {
                  console.log(`Rendering subject MenuItem ${index}:`, subject);
                  return (
                    <MenuItem 
                      key={subject.id} 
                      value={subject._id}
                      onClick={() => console.log('MenuItem clicked for subject:', subject._id)}
                      sx={{ 
                        fontSize: '1rem',
                        padding: '12px 16px',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          color: 'primary.contrastText'
                        }
                      }}
                    >
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {subject.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Subject ID: {subject._id}
                        </Typography>
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
              {quizData.subjectId && (
                <Typography variant="caption" color="success.main" sx={{ mt: 1 }}>
                  ✓ Selected: {subjects.find(subject => subject._id === quizData.subjectId)?.name}
                </Typography>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Time Limit (minutes) *"
              value={quizData.timeLimit || 60}
              onChange={(e) => setQuizData({ ...quizData, timeLimit: parseInt(e.target.value) || 60 })}
              inputProps={{ min: 1, max: 300 }}
              required
              size="medium"
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: '1rem',
                  minHeight: 56
                }
              }}
              helperText={
                quizData.timeLimit 
                  ? `✓ Time limit: ${quizData.timeLimit} minutes`
                  : "How long should students have to complete this quiz?"
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Attempts Allowed (0 = unlimited)"
              value={quizData.attemptsAllowed || 1}
              onChange={(e) => setQuizData({ ...quizData, attemptsAllowed: parseInt(e.target.value) || 1 })}
              inputProps={{ min: 0 }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
    );
  };

  const renderQuestionManager = () => (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Questions ({quizData.questions.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addNewQuestion}
            >
              Add Question
            </Button>
          </Box>
          {quizData.questions.length === 0 ? (
            <Alert severity="info">
              No questions added yet. Click "Add Question" to get started.
            </Alert>
          ) : (
            quizData.questions.map((question, index) => (
              <Accordion key={question.id} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" width="100%">
                    <DragIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography sx={{ flexGrow: 1 }}>
                      Question {index + 1}: {question.question || 'Untitled'}
                    </Typography>
                    <Chip 
                      label={questionTypes.find(t => t.value === question.type)?.label || question.type}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      label={`${question.points} pts`}
                      size="small"
                      color="primary"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      {question.question}
                    </Typography>
                    <Box>
                      <IconButton onClick={() => editQuestion(question)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => deleteQuestion(question.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </CardContent>
      </Card>
    </Box>
  );

  const renderQuizSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Scheduling
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <DateTimePicker
                    label="Start Date & Time"
                    value={quizData.startDate}
                    onChange={(date) => setQuizData({ ...quizData, startDate: date || undefined })}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <DateTimePicker
                    label="End Date & Time"
                    value={quizData.endDate}
                    onChange={(date) => setQuizData({ ...quizData, endDate: date || undefined })}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Security & Access
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={quizData.passwordProtected}
                  onChange={(e) => setQuizData({ ...quizData, passwordProtected: e.target.checked })}
                />
              }
              label="Password Protection"
            />
            {quizData.passwordProtected && (
              <TextField
                fullWidth
                label="Quiz Password"
                type="password"
                value={quizData.password || ''}
                onChange={(e) => setQuizData({ ...quizData, password: e.target.value })}
                sx={{ mt: 2 }}
              />
            )}
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Display & Behavior Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={quizData.randomizeQuestions}
                      onChange={(e) => setQuizData({ ...quizData, randomizeQuestions: e.target.checked })}
                    />
                  }
                  label="Randomize Question Order"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={quizData.randomizeAnswers}
                      onChange={(e) => setQuizData({ ...quizData, randomizeAnswers: e.target.checked })}
                    />
                  }
                  label="Randomize Answer Options"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={quizData.oneQuestionAtTime}
                      onChange={(e) => setQuizData({ ...quizData, oneQuestionAtTime: e.target.checked })}
                    />
                  }
                  label="Show One Question at a Time"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={quizData.showCorrectAnswers}
                      onChange={(e) => setQuizData({ ...quizData, showCorrectAnswers: e.target.checked })}
                    />
                  }
                  label="Show Correct Answers After Submission"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={quizData.showScoreImmediately}
                      onChange={(e) => setQuizData({ ...quizData, showScoreImmediately: e.target.checked })}
                    />
                  }
                  label="Show Score Immediately"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderPreview = () => (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Quiz Preview
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="h4" gutterBottom>
          {quizData.title}
        </Typography>
        
        {quizData.description && (
          <Typography variant="body1" paragraph>
            {quizData.description}
          </Typography>
        )}
        
        {quizData.instructions && (
          <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Instructions:</Typography>
            <Typography variant="body2">
              {quizData.instructions}
            </Typography>
          </Box>
        )}
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item>
            <Chip label={`Time Limit: ${quizData.timeLimit} minutes`} />
          </Grid>
          <Grid item>
            <Chip label={`Questions: ${quizData.questions.length}`} />
          </Grid>
          <Grid item>
            <Chip label={`Total Points: ${getTotalPoints()}`} />
          </Grid>
          <Grid item>
            <Chip 
              label={`Attempts: ${quizData.attemptsAllowed === 0 ? 'Unlimited' : quizData.attemptsAllowed}`} 
            />
          </Grid>
        </Grid>

        {quizData.questions.map((question, index) => (
          <Card key={question.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Question {index + 1} ({question.points} points)
              </Typography>
              <Typography variant="body1" paragraph>
                {question.question}
              </Typography>
<<<<<<< HEAD
              
              {question.type === 'multiple_choice' && question.options && (
                <RadioGroup>
                  {question.options.map((option, optIndex) => (
                    <FormControlLabel
                      key={optIndex}
                      value={optIndex}
                      control={<Radio />}
                      label={option}
                    />
                  ))}
                </RadioGroup>
              )}
              
              {question.type === 'multiple_select' && question.options && (
                <FormGroup>
                  {question.options.map((option, optIndex) => (
                    <FormControlLabel
                      key={optIndex}
                      control={<Checkbox />}
                      label={option}
                    />
                  ))}
                </FormGroup>
              )}
              
=======
              {/* Multiple Choice/Select with A, B, C, D... labels */}
              {(question.type === 'multiple_choice' || question.type === 'multiple_select') && question.options && (
                <Box>
                  {(question.type === 'multiple_choice') ? (
                    <RadioGroup>
                      {question.options.map((option, optIndex) => {
                        const optionLetter = String.fromCharCode(65 + optIndex); // A, B, C, ...
                        return (
                          <FormControlLabel
                            key={optIndex}
                            value={optIndex}
                            control={<Radio />}
                            label={
                              <Box display="flex" alignItems="center">
                                <Box sx={{ minWidth: 24, fontWeight: 'bold', color: 'primary.main', mr: 1 }}>{optionLetter}</Box>
                                <MathRenderer content={option} />
                              </Box>
                            }
                          />
                        );
                      })}
                    </RadioGroup>
                  ) : (
                    <FormGroup>
                      {question.options.map((option, optIndex) => {
                        const optionLetter = String.fromCharCode(65 + optIndex);
                        return (
                          <FormControlLabel
                            key={optIndex}
                            control={<Checkbox />}
                            label={
                              <Box display="flex" alignItems="center">
                                <Box sx={{ minWidth: 24, fontWeight: 'bold', color: 'primary.main', mr: 1 }}>{optionLetter}</Box>
                                <MathRenderer content={option} />
                              </Box>
                            }
                          />
                        );
                      })}
                    </FormGroup>
                  )}
                </Box>
              )}
              {/* True/False */}
>>>>>>> 99ca4a1 (Initial commit)
              {question.type === 'true_false' && (
                <RadioGroup>
                  <FormControlLabel value="true" control={<Radio />} label="True" />
                  <FormControlLabel value="false" control={<Radio />} label="False" />
                </RadioGroup>
              )}
<<<<<<< HEAD
              
=======
              {/* Short Answer/Fill Blank */}
>>>>>>> 99ca4a1 (Initial commit)
              {(question.type === 'short_answer' || question.type === 'fill_blank') && (
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Student answer will appear here"
                  disabled
                />
              )}
<<<<<<< HEAD
              
=======
              {/* Essay */}
>>>>>>> 99ca4a1 (Initial commit)
              {question.type === 'essay' && (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  placeholder="Student essay response will appear here"
                  disabled
                />
              )}
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );

  const getStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderQuizDetails();
      case 1:
        return renderQuestionManager();
      case 2:
        return renderQuizSettings();
      case 3:
        return renderPreview();
      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link href="/teacher" underline="hover">Dashboard</Link>
          <Link href="/teacher/quiz" underline="hover">Quizzes</Link>
          <Typography color="text.primary">Create Quiz</Typography>
        </Breadcrumbs>

        <Typography variant="h4" gutterBottom>
          Create New Quiz
        </Typography>

        {/* Stepper */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Step Content */}
        <Box sx={{ mb: 3 }}>
          {getStepContent()}
        </Box>

        {/* Navigation */}
        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between">
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box>
              <Button
                variant="outlined"
                startIcon={isSubmitting ? <CircularProgress size={16} /> : <SaveIcon />}
                onClick={() => saveQuiz('draft')}
                sx={{ mr: 2 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save as Draft'}
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  startIcon={isSubmitting ? <CircularProgress size={16} /> : <PublishIcon />}
                  onClick={() => saveQuiz('published')}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Quiz'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<NavigateNextIcon />}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Question Editor Dialog */}
        <QuestionEditorDialog
          open={questionDialogOpen}
          question={editingQuestion}
          onSave={saveQuestion}
          onClose={() => {
            setQuestionDialogOpen(false);
            setEditingQuestion(null);
          }}
          onChange={setEditingQuestion}
        />

        {/* Submit Feedback Dialog */}
        <Dialog 
          open={submitDialogOpen} 
          onClose={() => setSubmitDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={2}>
              {submitSuccess ? (
                <CheckCircleIcon color="success" fontSize="large" />
              ) : (
                <ErrorIcon color="error" fontSize="large" />
              )}
              <Typography variant="h6">
                {submitSuccess ? 'Quiz Saved Successfully!' : 'Save Failed'}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            {submitSuccess ? (
              <Box>
                <Typography gutterBottom>
                  Your quiz has been saved successfully. You can:
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <Typography component="li" gutterBottom>
                    Continue editing this quiz
                  </Typography>
                  <Typography component="li" gutterBottom>
                    View your quiz in the quiz list
                  </Typography>
                  <Typography component="li">
                    Create a new quiz
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box>
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Error:</strong> {submitError}
                  </Typography>
                </Alert>
                <Typography variant="body2" color="text.secondary">
                  Please check your quiz details and try again. If the problem persists, 
                  contact your system administrator.
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            {submitSuccess ? (
              <>
                <Button 
                  onClick={() => setSubmitDialogOpen(false)}
                  startIcon={<EditIcon />}
                >
                  Continue Editing
                </Button>
                <Button 
                  onClick={() => router.push('/teacher/quiz')}
                  variant="contained"
                  startIcon={<ArrowBackIcon />}
                >
                  View Quiz List
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setSubmitDialogOpen(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setSubmitDialogOpen(false);
                    // Retry logic could be added here
                  }}
                  variant="contained"
                  color="primary"
                >
                  Try Again
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}

// Question Editor Dialog Component
interface QuestionEditorDialogProps {
  open: boolean;
  question: Question | null;
  onSave: () => void;
  onClose: () => void;
  onChange: (question: Question | null) => void;
}

function QuestionEditorDialog({ open, question, onSave, onClose, onChange }: QuestionEditorDialogProps) {
  if (!question) return null;

  const updateQuestion = (updates: Partial<Question>) => {
    onChange({ ...question, ...updates });
  };

  const addOption = () => {
    const newOptions = [...(question.options || []), ''];
    updateQuestion({ options: newOptions });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(question.options || [])];
    newOptions[index] = value;
    updateQuestion({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = question.options?.filter((_, i) => i !== index) || [];
    updateQuestion({ options: newOptions });
  };

<<<<<<< HEAD
=======
  // Prefill a trial matching question for demonstration
  useEffect(() => {
    if (question.type === 'matching' && (!question.options || question.options.length === 0)) {
      updateQuestion({
        options: ['Nigeria', 'Ghana', 'Kenya'],
        correctAnswers: ['Abuja', 'Accra', 'Nairobi']
      });
    }
  }, [question.type]);

>>>>>>> 99ca4a1 (Initial commit)
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {question.question ? 'Edit Question' : 'Add New Question'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Question Type</InputLabel>
                <Select
                  value={question.type || 'multiple_choice'}
                  onChange={(e) => updateQuestion({ type: e.target.value as Question['type'] })}
                >
                  {questionTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Points"
                value={question.points || 1}
                onChange={(e) => updateQuestion({ points: parseInt(e.target.value) || 1 })}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
<<<<<<< HEAD
                rows={3}
                label="Question"
                value={question.question || ''}
                onChange={(e) => updateQuestion({ question: e.target.value })}
                placeholder="Enter your question here..."
              />
=======
                rows={6}
                label="Question (supports LaTeX: $...$ or $$...$$)"
                value={question.question || ''}
                onChange={(e) => updateQuestion({ question: e.target.value })}
                placeholder="Enter your question here..."
                sx={{ mb: 2, fontSize: '1.2rem' }}
                InputProps={{ style: { fontSize: '1.2rem', minHeight: 120 } }}
              />
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Preview:
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, minHeight: 48 }}>
                  {question.question && (/\$(.+?)\$|\$\$(.+?)\$\$|\\\[(.+?)\\\]/g.test(question.question)) ? (
                    <MathRenderer
                      content={question.question.replace(/\\\[(.+?)\\\]/g, (_, expr) => `$$${expr}$$`)}
                    />
                  ) : (
                    <Typography variant="body1">{question.question}</Typography>
                  )}
                </Paper>
              </Box>
>>>>>>> 99ca4a1 (Initial commit)
            </Grid>

            {/* Options for multiple choice questions */}
            {(question.type === 'multiple_choice' || question.type === 'multiple_select') && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Answer Options
                </Typography>
<<<<<<< HEAD
                {question.options?.map((option, index) => (
                  <Box key={index} display="flex" alignItems="center" sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      label={`Option ${index + 1}`}
                      value={option || ''}
                      onChange={(e) => updateOption(index, e.target.value)}
                      sx={{ mr: 2 }}
                    />
                    <FormControlLabel
                      control={
                        question.type === 'multiple_choice' ? (
                          <Radio
                            checked={question.correctAnswers.includes(index)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateQuestion({ correctAnswers: [index] });
                              }
                            }}
                          />
                        ) : (
                          <Checkbox
                            checked={question.correctAnswers.includes(index)}
                            onChange={(e) => {
                              const newCorrectAnswers = e.target.checked
                                ? [...question.correctAnswers, index]
                                : question.correctAnswers.filter(a => a !== index);
                              updateQuestion({ correctAnswers: newCorrectAnswers });
                            }}
                          />
                        )
                      }
                      label="Correct"
                    />
                    <IconButton onClick={() => removeOption(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
=======
                {question.options?.map((option, index) => {
                  const optionLetter = String.fromCharCode(65 + index); // A, B, C, ...
                  return (
                    <Box key={index} display="flex" alignItems="flex-start" sx={{ mb: 2 }}>
                      <Box flex={1} mr={2}>
                        <TextField
                          fullWidth
                          label={`Option ${optionLetter}`}
                          value={option || ''}
                          onChange={(e) => updateOption(index, e.target.value)}
                          sx={{ mb: 1 }}
                          InputProps={{ startAdornment: (
                            <Box sx={{ minWidth: 24, fontWeight: 'bold', color: 'primary.main', mr: 1 }}>
                              {optionLetter}
                            </Box>
                          ) }}
                        />
                        <Box sx={{ minHeight: 32 }}>
                          <MathRenderer content={option || ''} />
                        </Box>
                      </Box>
                      <FormControlLabel
                        control={
                          question.type === 'multiple_choice' ? (
                            <Radio
                              checked={question.correctAnswers.includes(option)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  updateQuestion({ correctAnswers: [option] });
                                }
                              }}
                            />
                          ) : (
                            <Checkbox
                              checked={question.correctAnswers.includes(option)}
                              onChange={(e) => {
                                const newCorrectAnswers = e.target.checked
                                  ? [...question.correctAnswers, option]
                                  : question.correctAnswers.filter(a => a !== option);
                                updateQuestion({ correctAnswers: newCorrectAnswers });
                              }}
                            />
                          )
                        }
                        label="Correct"
                      />
                      <IconButton onClick={() => removeOption(index)} color="error" sx={{ mt: 1 }}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  );
                })}
>>>>>>> 99ca4a1 (Initial commit)
                <Button startIcon={<AddIcon />} onClick={addOption}>
                  Add Option
                </Button>
              </Grid>
            )}

<<<<<<< HEAD
=======
  {/* Short Answer */}
  {question.type === 'short_answer' && (
    <Grid item xs={12}>
      <Typography variant="h6" gutterBottom>
        Correct Answer <span style={{ color: 'red' }}>*</span>
      </Typography>
      <TextField
        fullWidth
        label="Correct Answer"
        value={question.correctAnswers[0] || ''}
        onChange={e => updateQuestion({ correctAnswers: [e.target.value] })}
        error={!question.correctAnswers[0]}
        helperText={!question.correctAnswers[0] ? 'Please provide a correct answer.' : ''}
        sx={{ mb: 2 }}
      />
    </Grid>
  )}

  {/* Essay */}
  {question.type === 'essay' && (
    <Grid item xs={12}>
      <Typography variant="h6" gutterBottom>
        Sample Correct Answer (Optional)
      </Typography>
      <TextField
        fullWidth
        multiline
        minRows={3}
        label="Sample Answer"
        value={question.correctAnswers[0] || ''}
        onChange={e => updateQuestion({ correctAnswers: [e.target.value] })}
        sx={{ mb: 2 }}
      />
    </Grid>
  )}

  {/* Fill in the Blank */}
  {question.type === 'fill_blank' && (
    <Grid item xs={12}>
      <Typography variant="h6" gutterBottom>
        Correct Answer <span style={{ color: 'red' }}>*</span>
      </Typography>
      <TextField
        fullWidth
        label="Correct Answer"
        value={question.correctAnswers[0] || ''}
        onChange={e => updateQuestion({ correctAnswers: [e.target.value] })}
        error={!question.correctAnswers[0]}
        helperText={!question.correctAnswers[0] ? 'Please provide a correct answer.' : ''}
        sx={{ mb: 2 }}
      />
    </Grid>
  )}

>>>>>>> 99ca4a1 (Initial commit)
            {/* True/False options */}
            {question.type === 'true_false' && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Correct Answer
                </Typography>
                <RadioGroup
                  value={question.correctAnswers[0]}
                  onChange={(e) => updateQuestion({ correctAnswers: [e.target.value] })}
                >
                  <FormControlLabel value="true" control={<Radio />} label="True" />
                  <FormControlLabel value="false" control={<Radio />} label="False" />
                </RadioGroup>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Feedback (Optional)"
                value={question.feedback || ''}
                onChange={(e) => updateQuestion({ feedback: e.target.value })}
                placeholder="Provide feedback or explanation for this question..."
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained">
          Save Question
        </Button>
      </DialogActions>
    </Dialog>
  );
}
