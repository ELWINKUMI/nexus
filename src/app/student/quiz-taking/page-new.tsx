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
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  FormControl,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  Chip,
  Paper,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Flag as FlagIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UnansweredIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';

interface Question {
  id: string;
  question: string;
  type: 'multiple-choice' | 'multiple-answer' | 'true-false';
  options: string[];
  correctAnswer: number[];
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  duration: number; // in minutes
  questions: Question[];
  maxAttempts: number;
  isActive: boolean;
  createdAt: string;
}

interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  startedAt: string;
  submittedAt?: string;
  timeRemaining: number;
  answers: { [questionId: string]: number[] };
  score?: number;
  status: 'in-progress' | 'submitted';
}

export default function QuizTakingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizId = searchParams.get('id');
  const attemptId = searchParams.get('attemptId');

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: number[] }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quizStatus, setQuizStatus] = useState<'not-started' | 'in-progress' | 'completed'>('not-started');
  const [finalResults, setFinalResults] = useState<any>(null);

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0 && quizStatus === 'in-progress') {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            submitQuiz();
            return 0;
          }
          return newTime;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, quizStatus]);

  useEffect(() => {
    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      setIsLoading(true);
      
      // Mock quiz data
      const mockQuiz: Quiz = {
        id: quizId || '1',
        title: 'Environmental Science Quiz',
        description: 'Test your knowledge on climate change and ecosystems',
        subject: 'Environmental Science',
        duration: 30,
        questions: [
          {
            id: '1',
            question: 'What is the primary cause of global warming?',
            type: 'multiple-choice',
            options: [
              'Deforestation',
              'Greenhouse gas emissions',
              'Solar radiation',
              'Ocean currents'
            ],
            correctAnswer: [1],
            points: 5
          },
          {
            id: '2',
            question: 'Which of the following are renewable energy sources? (Select all that apply)',
            type: 'multiple-answer',
            options: [
              'Solar power',
              'Coal',
              'Wind power',
              'Natural gas',
              'Hydroelectric power'
            ],
            correctAnswer: [0, 2, 4],
            points: 10
          },
          {
            id: '3',
            question: 'Climate change only affects polar regions.',
            type: 'true-false',
            options: ['True', 'False'],
            correctAnswer: [1],
            points: 5
          }
        ],
        maxAttempts: 2,
        isActive: true,
        createdAt: new Date().toISOString()
      };

      setQuiz(mockQuiz);
      setTimeRemaining(mockQuiz.duration * 60);
      setQuizStatus('in-progress');
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error loading quiz:', error);
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answerIndex: number, isMultipleAnswer: boolean = false) => {
    setSelectedAnswers(prev => {
      if (isMultipleAnswer) {
        const currentAnswers = prev[questionId] || [];
        const newAnswers = currentAnswers.includes(answerIndex)
          ? currentAnswers.filter(a => a !== answerIndex)
          : [...currentAnswers, answerIndex];
        return { ...prev, [questionId]: newAnswers };
      } else {
        return { ...prev, [questionId]: [answerIndex] };
      }
    });
  };

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const submitQuiz = async () => {
    try {
      setQuizStatus('completed');
      
      // Calculate score (mock calculation)
      let totalScore = 0;
      let maxScore = 0;
      
      quiz?.questions.forEach(question => {
        maxScore += question.points;
        const userAnswer = selectedAnswers[question.id] || [];
        const correctAnswer = question.correctAnswer;
        
        if (userAnswer.length === correctAnswer.length && 
            userAnswer.every(a => correctAnswer.includes(a))) {
          totalScore += question.points;
        }
      });
      
      const results = {
        score: totalScore,
        maxScore,
        percentage: Math.round((totalScore / maxScore) * 100),
        answeredQuestions: Object.keys(selectedAnswers).length,
        totalQuestions: quiz?.questions.length || 0
      };
      
      setFinalResults(results);
      setShowResultDialog(true);
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressColor = () => {
    const percentage = (timeRemaining / ((quiz?.duration || 30) * 60)) * 100;
    if (percentage > 50) return 'success';
    if (percentage > 25) return 'warning';
    return 'error';
  };

  const currentQuestion = quiz?.questions[currentQuestionIndex];

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading quiz...
        </Typography>
      </Container>
    );
  }

  if (!quiz) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Quiz not found or could not be loaded.
        </Alert>
      </Container>
    );
  }

  if (quizStatus === 'completed') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Quiz Completed!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your responses have been submitted successfully.
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/student/dashboard')}
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Grid container spacing={3}>
        {/* Main Quiz Area */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="h1">
                  {quiz.title}
                </Typography>
                <Chip label={quiz.subject} color="primary" />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <LinearProgress
                  variant="determinate"
                  value={(timeRemaining / (quiz.duration * 60)) * 100}
                  color={getProgressColor()}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Time Remaining: {formatTime(timeRemaining)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Question {currentQuestionIndex + 1} of {quiz.questions.length}
                  </Typography>
                </Box>
              </Box>

              {currentQuestion && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ flex: 1 }}>
                      {currentQuestion.question}
                    </Typography>
                    <Tooltip title={flaggedQuestions.has(currentQuestion.id) ? "Remove flag" : "Flag for review"}>
                      <IconButton
                        onClick={() => toggleFlag(currentQuestion.id)}
                        color={flaggedQuestions.has(currentQuestion.id) ? "warning" : "default"}
                      >
                        <FlagIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <FormControl component="fieldset" sx={{ width: '100%' }}>
                    {currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false' ? (
                      <RadioGroup
                        value={selectedAnswers[currentQuestion.id]?.[0] ?? ''}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, parseInt(e.target.value))}
                      >
                        {currentQuestion.options.map((option, index) => (
                          <FormControlLabel
                            key={index}
                            value={index}
                            control={<Radio />}
                            label={option}
                            sx={{ mb: 1 }}
                          />
                        ))}
                      </RadioGroup>
                    ) : (
                      <Box>
                        {currentQuestion.options.map((option, index) => (
                          <FormControlLabel
                            key={index}
                            control={
                              <Checkbox
                                checked={selectedAnswers[currentQuestion.id]?.includes(index) ?? false}
                                onChange={() => handleAnswerChange(currentQuestion.id, index, true)}
                              />
                            }
                            label={option}
                            sx={{ display: 'block', mb: 1 }}
                          />
                        ))}
                      </Box>
                    )}
                  </FormControl>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<PrevIcon />}
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>

                <Typography variant="body2" color="text.secondary">
                  {currentQuestion?.points} points
                </Typography>

                {currentQuestionIndex === quiz.questions.length - 1 ? (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => setShowSubmitDialog(true)}
                  >
                    Submit Quiz
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    endIcon={<NextIcon />}
                    onClick={() => setCurrentQuestionIndex(Math.min(quiz.questions.length - 1, currentQuestionIndex + 1))}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quiz Progress
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Answered: {Object.keys(selectedAnswers).length} / {quiz.questions.length}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(Object.keys(selectedAnswers).length / quiz.questions.length) * 100}
                    sx={{ mt: 1 }}
                  />
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setShowSubmitDialog(true)}
                  disabled={Object.keys(selectedAnswers).length === 0}
                >
                  Submit Quiz
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Question Navigation
                </Typography>
                <Grid container spacing={1}>
                  {quiz.questions.map((question, index) => (
                    <Grid item xs={3} key={question.id}>
                      <Button
                        variant={index === currentQuestionIndex ? "contained" : "outlined"}
                        size="small"
                        onClick={() => setCurrentQuestionIndex(index)}
                        sx={{
                          minWidth: 40,
                          height: 40,
                          position: 'relative'
                        }}
                        color={
                          selectedAnswers[question.id] ? "success" :
                          flaggedQuestions.has(question.id) ? "warning" :
                          "primary"
                        }
                      >
                        {index + 1}
                        {flaggedQuestions.has(question.id) && (
                          <FlagIcon sx={{ position: 'absolute', top: -4, right: -4, fontSize: 12 }} />
                        )}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onClose={() => setShowSubmitDialog(false)}>
        <DialogTitle>Submit Quiz?</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to submit your quiz? You have answered{' '}
            {Object.keys(selectedAnswers).length} out of {quiz.questions.length} questions.
          </Typography>
          {Object.keys(selectedAnswers).length < quiz.questions.length && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              You have {quiz.questions.length - Object.keys(selectedAnswers).length} unanswered questions.
              These will be marked as incorrect.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSubmitDialog(false)}>
            Continue Quiz
          </Button>
          <Button onClick={submitQuiz} variant="contained" color="success">
            Submit Quiz
          </Button>
        </DialogActions>
      </Dialog>

      {/* Results Dialog */}
      <Dialog open={showResultDialog} onClose={() => setShowResultDialog(false)}>
        <DialogTitle>Quiz Results</DialogTitle>
        <DialogContent>
          {finalResults && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" gutterBottom>
                {finalResults.percentage}%
              </Typography>
              <Typography variant="body1" gutterBottom>
                Score: {finalResults.score} / {finalResults.maxScore} points
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You answered {finalResults.answeredQuestions} out of {finalResults.totalQuestions} questions.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => router.push('/student/dashboard')} variant="contained">
            Return to Dashboard
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
