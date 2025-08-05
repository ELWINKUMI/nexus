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
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  LinearProgress,
  Alert,
  Chip,
  Grid,
  Paper,
  Stack,
  IconButton,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Timer as TimerIcon,
  Quiz as QuizIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Flag as FlagIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';

interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'multiple-select' | 'true-false';
  options: string[];
  correctAnswers: string[];
  points: number;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  subjectColor: string;
  teacher: string;
  timeLimit: number; // in minutes
  totalQuestions: number;
  totalPoints: number;
  attempts: number;
  maxAttempts: number;
  questions: QuizQuestion[];
  isActive: boolean;
  startDate: string;
  endDate: string;
}

interface QuizAttempt {
  answers: Record<string, string[]>;
  startTime: number;
  currentQuestion: number;
  flaggedQuestions: Set<string>;
  isSubmitted: boolean;
}

export default function QuizTakingPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [autoSubmitWarning, setAutoSubmitWarning] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    if (isQuizStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          if (prev <= 300 && !autoSubmitWarning) { // 5 minutes warning
            setAutoSubmitWarning(true);
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isQuizStarted, timeRemaining, autoSubmitWarning]);

  const loadQuiz = async () => {
    try {
      setIsLoading(true);
      
      // Fetch real quiz data from API
      const response = await fetch(`/api/student/quizzes/${quizId}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load quiz');
      }

      const quizData = await response.json();
      
      // Transform API response to match component interface
      const transformedQuiz: Quiz = {
        id: quizData.id,
        title: quizData.title,
        description: quizData.description || '',
        subject: 'Mathematics', // Default for now, will be enhanced later
        subjectColor: '#2196F3', // Default for now
        teacher: 'Teacher', // Default for now, will be enhanced later
        timeLimit: quizData.timeLimit,
        totalQuestions: quizData.totalQuestions,
        totalPoints: quizData.totalPoints,
        attempts: quizData.attemptsUsed,
        maxAttempts: quizData.attemptsAllowed,
        questions: quizData.questions.map((q: any) => ({
          id: q.id,
          question: q.question,
          type: q.type,
          options: q.options || [],
          correctAnswers: [], // Not provided to students
          points: q.points,
          explanation: ''
        })),
        isActive: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      setQuiz(transformedQuiz);
      
      // If there's an active attempt, load it
      if (quizData.activeAttempt) {
        const savedAttempt: QuizAttempt = {
          answers: {},
          startTime: new Date(quizData.activeAttempt.startTime).getTime(),
          currentQuestion: 0,
          flaggedQuestions: new Set(quizData.activeAttempt.flaggedQuestions || []),
          isSubmitted: false
        };
        
        // Convert saved answers to component format
        quizData.activeAttempt.answers.forEach((answer: any) => {
          savedAttempt.answers[answer.questionId] = answer.selectedAnswers;
        });
        
        setAttempt(savedAttempt);
        setTimeRemaining(quizData.activeAttempt.timeRemaining || quizData.timeLimit * 60);
        setIsQuizStarted(true);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading quiz:', error);
      setIsLoading(false);
      // For development, show an alert and redirect
      alert('Failed to load quiz. Redirecting to quizzes page.');
      router.push('/student/quizzes');
    }
  };

  const startQuiz = async () => {
    if (!quiz) return;

    try {
      // Start a new quiz attempt via API
      const response = await fetch(`/api/student/quizzes/${quizId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error('Failed to start quiz');
      }

      const attemptData = await response.json();
      
      const newAttempt: QuizAttempt = {
        answers: {},
        startTime: new Date(attemptData.startTime).getTime(),
        currentQuestion: 0,
        flaggedQuestions: new Set(),
        isSubmitted: false
      };

      setAttempt(newAttempt);
      setTimeRemaining(attemptData.timeRemaining || quiz.timeLimit * 60);
      setIsQuizStarted(true);
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Failed to start quiz. Please try again.');
    }
  };

  const handleAnswerChange = (questionId: string, answer: string, isMultiSelect: boolean = false) => {
    if (!attempt) return;

    setAttempt(prev => {
      if (!prev) return prev;

      const newAnswers = { ...prev.answers };
      
      if (isMultiSelect) {
        if (!newAnswers[questionId]) {
          newAnswers[questionId] = [];
        }
        
        const currentAnswers = newAnswers[questionId];
        if (currentAnswers.includes(answer)) {
          newAnswers[questionId] = currentAnswers.filter(a => a !== answer);
        } else {
          newAnswers[questionId] = [...currentAnswers, answer];
        }
      } else {
        newAnswers[questionId] = [answer];
      }

      return { ...prev, answers: newAnswers };
    });
  };

  const toggleQuestionFlag = (questionId: string) => {
    if (!attempt) return;

    setAttempt(prev => {
      if (!prev) return prev;

      const newFlagged = new Set(prev.flaggedQuestions);
      if (newFlagged.has(questionId)) {
        newFlagged.delete(questionId);
      } else {
        newFlagged.add(questionId);
      }

      return { ...prev, flaggedQuestions: newFlagged };
    });
  };

  const navigateToQuestion = (index: number) => {
    if (!attempt || !quiz) return;

    setAttempt(prev => {
      if (!prev) return prev;
      return { ...prev, currentQuestion: Math.max(0, Math.min(index, quiz.questions.length - 1)) };
    });
  };

  const handleAutoSubmit = () => {
    submitQuiz(true);
  };

  const submitQuiz = async (isAutoSubmit: boolean = false) => {
    if (!quiz || !attempt) return;

    try {
      const submissionData = {
        quizId: quiz.id,
        answers: attempt.answers,
        timeSpent: Date.now() - attempt.startTime,
        isAutoSubmit
      };

      // Here you would normally send to API
      console.log('Submitting quiz:', submissionData);

      // For now, show results
      setAttempt(prev => prev ? { ...prev, isSubmitted: true } : prev);
      setIsQuizStarted(false);
      setShowSubmitDialog(false);

      // Navigate to results page
      router.push(`/student/quizzes/${quiz.id}/results`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeProgress = () => {
    if (!quiz) return 100;
    const totalTime = quiz.timeLimit * 60;
    return ((totalTime - timeRemaining) / totalTime) * 100;
  };

  const getTimeColor = () => {
    const percentage = (timeRemaining / (quiz?.timeLimit || 1) / 60) * 100;
    if (percentage > 50) return '#4CAF50'; // Green
    if (percentage > 25) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getAnsweredCount = () => {
    if (!attempt || !quiz) return 0;
    return Object.keys(attempt.answers).length;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading quiz...</Typography>
      </Box>
    );
  }

  if (!quiz) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>Quiz not found</Typography>
        <Button variant="contained" onClick={() => router.push('/student/quizzes')}>
          Back to Quizzes
        </Button>
      </Container>
    );
  }

  // Quiz Instructions Screen
  if (!isQuizStarted) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link href="/student" underline="hover">Dashboard</Link>
          <Link href="/student/quizzes" underline="hover">Quizzes</Link>
          <Typography color="text.primary">{quiz.title}</Typography>
        </Breadcrumbs>

        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <QuizIcon sx={{ fontSize: 64, color: quiz.subjectColor, mb: 2 }} />
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                {quiz.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {quiz.description}
              </Typography>
              <Chip 
                label={quiz.subject} 
                sx={{ 
                  backgroundColor: quiz.subjectColor + '20',
                  color: quiz.subjectColor,
                  fontWeight: 'bold'
                }}
              />
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid xs={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: quiz.subjectColor }}>
                    {quiz.totalQuestions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Questions
                  </Typography>
                </Paper>
              </Grid>
              <Grid xs={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: quiz.subjectColor }}>
                    {quiz.timeLimit}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Minutes
                  </Typography>
                </Paper>
              </Grid>
              <Grid xs={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: quiz.subjectColor }}>
                    {quiz.totalPoints}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Points
                  </Typography>
                </Paper>
              </Grid>
              <Grid xs={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: quiz.subjectColor }}>
                    {quiz.attempts}/{quiz.maxAttempts}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Attempts
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mb: 4 }}>
              <Typography variant="body2">
                <strong>Instructions:</strong>
                <br />• You have {quiz.timeLimit} minutes to complete this quiz
                <br />• Once started, the timer cannot be paused
                <br />• You can flag questions for review
                <br />• Make sure to submit before time runs out
                <br />• You can only take this quiz {quiz.maxAttempts} times
              </Typography>
            </Alert>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={startQuiz}
                disabled={quiz.attempts >= quiz.maxAttempts}
                sx={{ 
                  py: 2, 
                  px: 4,
                  fontSize: '1.1rem',
                  backgroundColor: quiz.subjectColor,
                  '&:hover': {
                    backgroundColor: quiz.subjectColor + 'CC'
                  }
                }}
              >
                Start Quiz
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // Quiz Taking Screen
  const currentQuestion = quiz.questions[attempt?.currentQuestion || 0];
  const currentAnswers = attempt?.answers[currentQuestion?.id] || [];

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Timer Header */}
      <Paper sx={{ p: 2, mb: 3, position: 'sticky', top: 0, zIndex: 100 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimerIcon sx={{ color: getTimeColor() }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: getTimeColor() }}>
                {formatTime(timeRemaining)}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={getTimeProgress()} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getTimeColor()
                }
              }} 
            />
          </Grid>
          <Grid xs={12} md={4}>
            <Typography variant="body1" sx={{ textAlign: 'center' }}>
              Question {(attempt?.currentQuestion || 0) + 1} of {quiz.totalQuestions}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              {getAnsweredCount()} answered • {attempt?.flaggedQuestions.size || 0} flagged
            </Typography>
          </Grid>
          <Grid xs={12} md={4}>
            <Box sx={{ textAlign: 'right' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowSubmitDialog(true)}
                sx={{ mr: 1 }}
              >
                Submit Quiz
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push('/student/quizzes')}
                color="error"
              >
                Exit
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {autoSubmitWarning && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Warning:</strong> Less than 5 minutes remaining! The quiz will auto-submit when time runs out.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Question Content */}
        <Grid xs={12} md={9}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1 }}>
                  {currentQuestion?.question}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label={`${currentQuestion?.points} pts`} 
                    size="small" 
                    color="primary" 
                  />
                  <IconButton
                    size="small"
                    onClick={() => toggleQuestionFlag(currentQuestion?.id || '')}
                    sx={{ 
                      color: attempt?.flaggedQuestions.has(currentQuestion?.id || '') ? '#FF9800' : '#ccc'
                    }}
                  >
                    <FlagIcon />
                  </IconButton>
                </Box>
              </Box>

              {currentQuestion?.type === 'multiple-choice' && (
                <RadioGroup
                  value={currentAnswers[0] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                >
                  {currentQuestion.options.map((option) => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={<Radio />}
                      label={option}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </RadioGroup>
              )}

              {currentQuestion?.type === 'multiple-select' && (
                <Box>
                  {currentQuestion.options.map((option) => (
                    <FormControlLabel
                      key={option}
                      control={
                        <Checkbox
                          checked={currentAnswers.includes(option)}
                          onChange={() => handleAnswerChange(currentQuestion.id, option, true)}
                        />
                      }
                      label={option}
                      sx={{ display: 'block', mb: 1 }}
                    />
                  ))}
                </Box>
              )}

              {currentQuestion?.type === 'true-false' && (
                <RadioGroup
                  value={currentAnswers[0] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                >
                  <FormControlLabel value="True" control={<Radio />} label="True" />
                  <FormControlLabel value="False" control={<Radio />} label="False" />
                </RadioGroup>
              )}

              {/* Navigation */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  startIcon={<PrevIcon />}
                  onClick={() => navigateToQuestion((attempt?.currentQuestion || 0) - 1)}
                  disabled={(attempt?.currentQuestion || 0) === 0}
                >
                  Previous
                </Button>
                <Button
                  endIcon={<NextIcon />}
                  onClick={() => navigateToQuestion((attempt?.currentQuestion || 0) + 1)}
                  disabled={(attempt?.currentQuestion || 0) === quiz.questions.length - 1}
                >
                  Next
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Question Navigator */}
        <Grid xs={12} md={3}>
          <Card sx={{ position: 'sticky', top: 120 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Question Navigator
              </Typography>
              <Grid container spacing={1}>
                {quiz.questions.map((q, index) => {
                  const isAnswered = attempt?.answers[q.id]?.length > 0;
                  const isFlagged = attempt?.flaggedQuestions.has(q.id);
                  const isCurrent = index === attempt?.currentQuestion;

                  return (
                    <Grid xs={3} key={q.id}>
                      <Button
                        size="small"
                        onClick={() => navigateToQuestion(index)}
                        sx={{
                          minWidth: 40,
                          height: 40,
                          backgroundColor: isCurrent ? quiz.subjectColor : 
                                         isAnswered ? '#4CAF50' : 
                                         '#e0e0e0',
                          color: isCurrent || isAnswered ? 'white' : 'black',
                          border: isFlagged ? '2px solid #FF9800' : 'none',
                          '&:hover': {
                            backgroundColor: isCurrent ? quiz.subjectColor + 'CC' : 
                                           isAnswered ? '#4CAF50CC' : 
                                           '#d0d0d0'
                          }
                        }}
                      >
                        {index + 1}
                      </Button>
                    </Grid>
                  );
                })}
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Box sx={{ width: 16, height: 16, backgroundColor: quiz.subjectColor, borderRadius: 1 }} />
                  <Typography variant="caption">Current</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Box sx={{ width: 16, height: 16, backgroundColor: '#4CAF50', borderRadius: 1 }} />
                  <Typography variant="caption">Answered</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Box sx={{ width: 16, height: 16, backgroundColor: '#e0e0e0', borderRadius: 1 }} />
                  <Typography variant="caption">Not answered</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 16, height: 16, backgroundColor: '#e0e0e0', border: '2px solid #FF9800', borderRadius: 1 }} />
                  <Typography variant="caption">Flagged</Typography>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onClose={() => setShowSubmitDialog(false)}>
        <DialogTitle>Submit Quiz?</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to submit your quiz? You cannot change your answers after submission.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Questions answered: {getAnsweredCount()} of {quiz.totalQuestions}
            • Time remaining: {formatTime(timeRemaining)}
          </Typography>
          {getAnsweredCount() < quiz.totalQuestions && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              You have {quiz.totalQuestions - getAnsweredCount()} unanswered questions.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSubmitDialog(false)}>Cancel</Button>
          <Button onClick={() => submitQuiz()} variant="contained" color="primary">
            Submit Quiz
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
