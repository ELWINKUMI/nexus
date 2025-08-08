'use client';

<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
=======
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import MathRenderer from '@/components/MathRenderer';
>>>>>>> 99ca4a1 (Initial commit)
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
<<<<<<< HEAD
  Link
=======
  Link,
  TextField
>>>>>>> 99ca4a1 (Initial commit)
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
<<<<<<< HEAD
=======
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
>>>>>>> 99ca4a1 (Initial commit)

interface QuizQuestion {
  id: string;
  question: string;
<<<<<<< HEAD
  type: 'multiple-choice' | 'multiple-select' | 'true-false';
=======
  type: 'multiple-choice' | 'multiple-select' | 'true-false' | 'short_answer' | 'essay' | 'fill_blank' | 'ordering' | 'matching';
>>>>>>> 99ca4a1 (Initial commit)
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
<<<<<<< HEAD
=======
  passwordProtected?: boolean;
  randomizeQuestions?: boolean;
  randomizeAnswers?: boolean;
  oneQuestionAtTime?: boolean;
  showCorrectAnswers?: boolean;
  showScoreImmediately?: boolean;
>>>>>>> 99ca4a1 (Initial commit)
}

interface QuizAttempt {
  answers: Record<string, string[]>;
  startTime: number;
  currentQuestion: number;
  flaggedQuestions: Set<string>;
  isSubmitted: boolean;
}

<<<<<<< HEAD
export default function QuizTakingPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;
=======
function reorder(list: string[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export default function QuizTakingPage() {
  // Unique key for localStorage per quiz and user
  const params = useParams();
  const quizId = params.id as string;
  const localStorageKey = `quiz-progress-${quizId}`;
  const router = useRouter();
>>>>>>> 99ca4a1 (Initial commit)

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [autoSubmitWarning, setAutoSubmitWarning] = useState(false);
<<<<<<< HEAD

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

=======
  const [showSubmitStatus, setShowSubmitStatus] = useState<null | 'success' | 'error'>(null);
  const [orderingState, setOrderingState] = useState<{ [questionId: string]: string[] }>({});
  const [isClient, setIsClient] = useState(false);


  // Always use backend as source of truth for quiz progress
  useEffect(() => {
    async function fetchQuizAndProgress() {
      setIsLoading(true);
      const response = await fetch(`/api/student/quizzes/${quizId}`, {
        method: 'GET',
        credentials: 'include'
      });
      if (!response.ok) {
        setIsLoading(false);
        return;
      }
      const quizData = await response.json();
      let questions = quizData.questions.map((q: any) => ({
        id: q.id,
        question: q.question,
        type: q.type,
        options: q.options || [],
        correctAnswers: [],
        points: q.points,
        explanation: ''
      }));
      // If randomization is enabled, restore order from activeAttempt if available
      let questionOrder = questions.map(q => q.id);
      let optionsOrder: Record<string, string[]> = {};
      questions.forEach(q => { optionsOrder[q.id] = q.options; });
      if (quizData.randomizeQuestions && quizData.activeAttempt?.questionOrder) {
        questions = quizData.activeAttempt.questionOrder.map((qid: string) => questions.find((q: any) => q.id === qid)).filter(Boolean);
        questionOrder = quizData.activeAttempt.questionOrder;
      }
      if (quizData.randomizeAnswers && quizData.activeAttempt?.optionsOrder) {
        questions = questions.map((q: any) => ({
          ...q,
          options: quizData.activeAttempt.optionsOrder[q.id] || q.options
        }));
        optionsOrder = quizData.activeAttempt.optionsOrder;
      }
      setQuiz({
        id: quizData.id,
        title: quizData.title,
        description: quizData.description || '',
        subject: 'Mathematics',
        subjectColor: '#2196F3',
        teacher: 'Teacher',
        timeLimit: quizData.timeLimit,
        totalQuestions: quizData.totalQuestions,
        totalPoints: quizData.totalPoints,
        attempts: quizData.attemptsUsed,
        maxAttempts: quizData.attemptsAllowed,
        questions,
        isActive: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        randomizeQuestions: quizData.randomizeQuestions,
        randomizeAnswers: quizData.randomizeAnswers,
        oneQuestionAtTime: quizData.oneQuestionAtTime,
        showCorrectAnswers: quizData.showCorrectAnswers,
        showScoreImmediately: quizData.showScoreImmediately
      });
      if (quizData.activeAttempt) {
        // Use backend attempt as source of truth
        const savedAttempt: QuizAttempt = {
          answers: {},
          startTime: new Date(quizData.activeAttempt.startTime).getTime(),
          currentQuestion: quizData.activeAttempt.currentQuestion || 0,
          flaggedQuestions: new Set(quizData.activeAttempt.flaggedQuestions || []),
          isSubmitted: quizData.activeAttempt.isSubmitted || false
        };
        quizData.activeAttempt.answers.forEach((answer: any) => {
          savedAttempt.answers[answer.questionId] = answer.selectedAnswers;
        });
        setAttempt(savedAttempt);
        // Calculate timeRemaining from scheduledStart and quiz.timeLimit
        const scheduledStart = quizData.scheduledStart ? new Date(quizData.scheduledStart).getTime() : savedAttempt.startTime;
        const now = Date.now();
        const elapsed = Math.floor((now - scheduledStart) / 1000);
        const totalAllowed = (quizData.timeLimit || 30) * 60;
        const remaining = Math.max(0, totalAllowed - elapsed);
        setTimeRemaining(remaining);
        setIsQuizStarted(true);
        // Save to localStorage for UI recovery only
        if (typeof window !== 'undefined') {
          localStorage.setItem(localStorageKey, JSON.stringify({
            quizId,
            answers: savedAttempt.answers,
            startTime: savedAttempt.startTime,
            currentQuestion: savedAttempt.currentQuestion,
            flaggedQuestions: Array.from(savedAttempt.flaggedQuestions),
            isSubmitted: savedAttempt.isSubmitted,
            timeRemaining: remaining,
            questionOrder,
            optionsOrder
          }));
        }
      } else {
        // No active attempt, check localStorage for UI recovery (not canonical)
        const saved = typeof window !== 'undefined' ? localStorage.getItem(localStorageKey) : null;
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.quizId === quizId) {
              setAttempt({
                answers: parsed.answers || {},
                startTime: parsed.startTime,
                currentQuestion: parsed.currentQuestion || 0,
                flaggedQuestions: new Set(parsed.flaggedQuestions || []),
                isSubmitted: parsed.isSubmitted || false
              });
              setTimeRemaining(parsed.timeRemaining || 0);
              setIsQuizStarted(parsed.isQuizStarted || false);
            }
          } catch {}
        }
      }
      setIsLoading(false);
    }
    fetchQuizAndProgress();
  }, [quizId]);

  // Save progress to localStorage on every relevant change
  useEffect(() => {
    if (!isQuizStarted || !attempt || !quiz) return;
    // Save question order and options order if randomization is enabled
    const questionOrder = quiz.questions.map(q => q.id);
    const optionsOrder: Record<string, string[]> = {};
    quiz.questions.forEach(q => {
      optionsOrder[q.id] = q.options;
    });
    const data = {
      quizId,
      answers: attempt.answers,
      startTime: attempt.startTime,
      currentQuestion: attempt.currentQuestion,
      flaggedQuestions: Array.from(attempt.flaggedQuestions),
      isSubmitted: attempt.isSubmitted,
      timeRemaining,
      questionOrder,
      optionsOrder
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(localStorageKey, JSON.stringify(data));
    }
  }, [isQuizStarted, attempt, timeRemaining, quiz]);

>>>>>>> 99ca4a1 (Initial commit)
  useEffect(() => {
    if (isQuizStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
<<<<<<< HEAD
=======
          // Check if quiz due date/time is up
          if (quiz && quiz.endDate) {
            const due = new Date(quiz.endDate).getTime();
            const now = Date.now();
            if (now >= due) {
              handleAutoSubmit();
              return 0;
            }
          }
>>>>>>> 99ca4a1 (Initial commit)
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
<<<<<<< HEAD

      return () => clearInterval(timer);
    }
  }, [isQuizStarted, timeRemaining, autoSubmitWarning]);
=======
      return () => clearInterval(timer);
    }
  }, [isQuizStarted, timeRemaining, autoSubmitWarning, quiz]);

  useEffect(() => { setIsClient(true); }, []);
>>>>>>> 99ca4a1 (Initial commit)

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
<<<<<<< HEAD
=======
      // Prepare questions array
      let questions = quizData.questions.map((q: any) => ({
        id: q.id,
        question: q.question,
        type: q.type,
        options: q.options || [],
        correctAnswers: [], // Not provided to students
        points: q.points,
        explanation: ''
      }));

      // Randomize question order if enabled
      if (quizData.randomizeQuestions) {
        questions = [...questions].sort(() => Math.random() - 0.5);
      }

      // Randomize answer options if enabled
      if (quizData.randomizeAnswers) {
        questions = questions.map((q: QuizQuestion) => ({
          ...q,
          options: [...q.options].sort(() => Math.random() - 0.5)
        }));
      }

>>>>>>> 99ca4a1 (Initial commit)
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
<<<<<<< HEAD
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
=======
        questions,
        isActive: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        randomizeQuestions: quizData.randomizeQuestions,
        randomizeAnswers: quizData.randomizeAnswers,
        oneQuestionAtTime: quizData.oneQuestionAtTime,
        showCorrectAnswers: quizData.showCorrectAnswers,
        showScoreImmediately: quizData.showScoreImmediately
>>>>>>> 99ca4a1 (Initial commit)
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
<<<<<<< HEAD

    try {
      // Start a new quiz attempt via API
=======
    await doStartQuiz();
  };

  // Actual quiz start logic (no password)
  const doStartQuiz = async () => {
    if (!quiz) return;
    try {
>>>>>>> 99ca4a1 (Initial commit)
      const response = await fetch(`/api/student/quizzes/${quizId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
<<<<<<< HEAD
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error('Failed to start quiz');
      }

      const attemptData = await response.json();
      
=======
      });
      if (response.status === 409) {
        // Quiz already in progress, prompt to resume
        const data = await response.json();
        console.warn('Quiz already in progress:', data);
        // Optionally show a dialog, or just auto-resume
        setIsQuizStarted(true);
        setShowSubmitStatus(null);
        await loadQuiz();
        return;
      }
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to start quiz:', response.status, errorText);
        throw new Error('Failed to start quiz: ' + errorText);
      }
      const attemptData = await response.json();
>>>>>>> 99ca4a1 (Initial commit)
      const newAttempt: QuizAttempt = {
        answers: {},
        startTime: new Date(attemptData.startTime).getTime(),
        currentQuestion: 0,
        flaggedQuestions: new Set(),
        isSubmitted: false
      };
<<<<<<< HEAD

=======
>>>>>>> 99ca4a1 (Initial commit)
      setAttempt(newAttempt);
      setTimeRemaining(attemptData.timeRemaining || quiz.timeLimit * 60);
      setIsQuizStarted(true);
    } catch (error) {
      console.error('Error starting quiz:', error);
<<<<<<< HEAD
      alert('Failed to start quiz. Please try again.');
    }
  };

  const handleAnswerChange = (questionId: string, answer: string, isMultiSelect: boolean = false) => {
=======
      alert('Failed to start quiz. Please try again or contact support.');
    }
  };

  // Autosave to backend on every answer change
  const handleAnswerChange = async (questionId: string, answer: string, isMultiSelect: boolean = false) => {
>>>>>>> 99ca4a1 (Initial commit)
    if (!attempt) return;

    setAttempt(prev => {
      if (!prev) return prev;

      const newAnswers = { ...prev.answers };
<<<<<<< HEAD
      
=======
>>>>>>> 99ca4a1 (Initial commit)
      if (isMultiSelect) {
        if (!newAnswers[questionId]) {
          newAnswers[questionId] = [];
        }
<<<<<<< HEAD
        
=======
>>>>>>> 99ca4a1 (Initial commit)
        const currentAnswers = newAnswers[questionId];
        if (currentAnswers.includes(answer)) {
          newAnswers[questionId] = currentAnswers.filter(a => a !== answer);
        } else {
          newAnswers[questionId] = [...currentAnswers, answer];
        }
      } else {
        newAnswers[questionId] = [answer];
      }

<<<<<<< HEAD
=======
      // Call PATCH to backend for autosave
      autosaveToBackend({
        answers: { ...newAnswers },
        flaggedQuestions: Array.from(prev.flaggedQuestions),
        currentQuestion: prev.currentQuestion
      });

>>>>>>> 99ca4a1 (Initial commit)
      return { ...prev, answers: newAnswers };
    });
  };

<<<<<<< HEAD
=======
  // Autosave to backend on flag change
>>>>>>> 99ca4a1 (Initial commit)
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

<<<<<<< HEAD
=======
      // Call PATCH to backend for autosave
      autosaveToBackend({
        answers: { ...prev.answers },
        flaggedQuestions: Array.from(newFlagged),
        currentQuestion: prev.currentQuestion
      });

>>>>>>> 99ca4a1 (Initial commit)
      return { ...prev, flaggedQuestions: newFlagged };
    });
  };

<<<<<<< HEAD
=======
  // Autosave to backend on navigation
>>>>>>> 99ca4a1 (Initial commit)
  const navigateToQuestion = (index: number) => {
    if (!attempt || !quiz) return;

    setAttempt(prev => {
      if (!prev) return prev;
<<<<<<< HEAD
      return { ...prev, currentQuestion: Math.max(0, Math.min(index, quiz.questions.length - 1)) };
    });
  };
=======
      const newCurrent = Math.max(0, Math.min(index, quiz.questions.length - 1));
      // Call PATCH to backend for autosave
      autosaveToBackend({
        answers: { ...prev.answers },
        flaggedQuestions: Array.from(prev.flaggedQuestions),
        currentQuestion: newCurrent
      });
      return { ...prev, currentQuestion: newCurrent };
    });
  };
// Autosave helper
  const autosaveToBackend = useCallback(async ({ answers, flaggedQuestions, currentQuestion }: {
    answers: Record<string, string[]>;
    flaggedQuestions: string[];
    currentQuestion: number;
  }) => {
    try {
      await fetch(`/api/student/quizzes/${quizId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, selectedAnswers]) => ({ questionId, selectedAnswers })),
          flaggedQuestions,
          currentQuestion,
          autosave: true
        })
      });
    } catch (e) {
      // Optionally show error or retry
      // console.error('Autosave failed', e);
    }
  }, [quizId]);
>>>>>>> 99ca4a1 (Initial commit)

  const handleAutoSubmit = () => {
    submitQuiz(true);
  };

  const submitQuiz = async (isAutoSubmit: boolean = false) => {
    if (!quiz || !attempt) return;

    try {
<<<<<<< HEAD
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
=======
      // Clear progress from localStorage on submit
      if (typeof window !== 'undefined') {
        localStorage.removeItem(localStorageKey);
      }
      // Calculate score and percentage (simple version, adjust as needed)
      let score = 0;
      let totalPoints = quiz.totalPoints || 0;
      quiz.questions.forEach(q => {
        const userAnswers = (attempt.answers[q.id] || []).map(String);
        const correctAnswers = (q.correctAnswers || []).map(String);
        if (q.type === 'multiple-choice' || q.type === 'true-false') {
          if (userAnswers.length === 1 && correctAnswers.length === 1 && userAnswers[0] === correctAnswers[0]) {
            score += q.points;
          }
        } else if (q.type === 'multiple-select' || q.type === 'multiple-answer') {
          const correct = [...correctAnswers].sort().join(',');
          const user = [...userAnswers].sort().join(',');
          if (correct === user) {
            score += q.points;
          }
        }
      });
      const percentage = totalPoints ? Math.round((score / totalPoints) * 100) : 0;
      const endTime = new Date().toISOString();

      // Send PATCH request to mark attempt as completed and save answers/score
      const res = await fetch(`/api/student/quizzes/${quiz.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: Object.entries(attempt.answers).map(([questionId, selectedAnswers]) => ({ questionId, selectedAnswers })),
          score,
          percentage,
          endTime
        })
      });

      if (res.ok) {
        setShowSubmitStatus('success');
      } else {
        setShowSubmitStatus('error');
      }
      setAttempt(prev => prev ? { ...prev, isSubmitted: true } : prev);
      setIsQuizStarted(false);
      setShowSubmitDialog(false);
    } catch (error) {
      setShowSubmitStatus('error');
>>>>>>> 99ca4a1 (Initial commit)
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

<<<<<<< HEAD
=======
  // Place all hooks at the top of the component, after useState/useEffect declarations
  const currentQuestion = quiz && attempt && quiz.questions[attempt.currentQuestion] ? quiz.questions[attempt.currentQuestion] : null;

  const matchingChoices = useMemo(() => {
    if (!isClient || !currentQuestion?.type || currentQuestion.type !== 'matching' || !currentQuestion.correctAnswers) return [];
    return seededShuffle(currentQuestion.correctAnswers, currentQuestion.id);
  }, [isClient, currentQuestion?.id, currentQuestion?.type]);

  const orderingChoices = useMemo(() => {
    if (!isClient || !currentQuestion?.type || currentQuestion.type !== 'ordering' || !currentQuestion.options) return [];
    return seededShuffle(currentQuestion.options, currentQuestion.id);
  }, [isClient, currentQuestion?.id, currentQuestion?.type]);

  // Render only the dialog if showSubmitStatus is set
  if (showSubmitStatus) {
    return (
      <Dialog open onClose={() => setShowSubmitStatus(null)}>
        <DialogTitle>{showSubmitStatus === 'success' ? 'Quiz Submitted Successfully' : 'Quiz Submission Failed'}</DialogTitle>
        <DialogContent>
          <Typography>
            {showSubmitStatus === 'success'
              ? 'Your quiz has been submitted. You can view your score on the Grades page.'
              : 'There was a problem submitting your quiz. Please try again.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowSubmitStatus(null);
            if (showSubmitStatus === 'success') router.push('/student/quizzes');
          }} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

>>>>>>> 99ca4a1 (Initial commit)
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
<<<<<<< HEAD
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
=======
    // Use backend values for attempts used and allowed ONLY
    const attemptsUsed = (quiz as any).attemptsUsed ?? 0;
    const maxAttempts = (quiz as any).attemptsAllowed ?? 0;
    const attemptsExceeded = maxAttempts > 0 && attemptsUsed >= maxAttempts;
    return (
      <>
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
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: quiz.subjectColor }}>
                      {quiz.totalQuestions}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Questions
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: quiz.subjectColor }}>
                      {quiz.timeLimit}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Minutes
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: quiz.subjectColor }}>
                      {quiz.totalPoints}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Points
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: quiz.subjectColor }}>
                      {attemptsUsed}/{maxAttempts}
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

              {attemptsExceeded && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    You have reached the maximum number of attempts for this quiz.
                  </Typography>
                </Alert>
              )}

              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={startQuiz}
                  disabled={attemptsExceeded}
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

      </>
>>>>>>> 99ca4a1 (Initial commit)
    );
  }

  // Quiz Taking Screen
<<<<<<< HEAD
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
=======
  // If oneQuestionAtTime is false, show all questions at once; otherwise, show one at a time (default behavior)
  const oneAtATime = quiz.oneQuestionAtTime !== undefined ? quiz.oneQuestionAtTime : true;
  const currentQuestionIndex = attempt?.currentQuestion || 0;
  // currentQuestion is already declared above, so do not redeclare it here
  const currentAnswers = attempt?.answers[currentQuestion?.id] || [];

  // Utility to get a stable shuffle based on question id
  function seededShuffle(array: string[], seed: string): string[] {
    let arr = [...array];
    let s = 0;
    for (let i = 0; i < seed.length; i++) s += seed.charCodeAt(i);
    for (let i = arr.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  return (
    <>
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
                {oneAtATime
                  ? `Question ${(attempt?.currentQuestion || 0) + 1} of ${quiz.totalQuestions}`
                  : `${quiz.totalQuestions} Questions`}
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
          <Grid item xs={12} md={9}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                {oneAtATime ? (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                      <Box sx={{ flex: 1, fontWeight: 'bold', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ minWidth: 28, fontWeight: 'bold', color: 'primary.main', mr: 1, fontSize: '1.1rem' }}>
                          {currentQuestionIndex + 1}.
                        </Box>
                        {currentQuestion?.question && (
                          <MathRenderer content={currentQuestion.question} />
                        )}
                      </Box>
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
                    {currentQuestion.options.map((option, idx) => {
                      const optionLetter = String.fromCharCode(65 + idx);
                      return (
                        <FormControlLabel
                          key={option + '-' + idx}
                          value={option}
                          control={<Radio />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ minWidth: 24, fontWeight: 'bold', color: 'primary.main' }}>{optionLetter}.</Box>
                              <MathRenderer content={option} />
                            </Box>
                          }
                          sx={{ mb: 1 }}
                        />
                      );
                    })}
                  </RadioGroup>
                )}

                {currentQuestion?.type === 'multiple-select' && (
                  <Box>
                    {currentQuestion.options.map((option, idx) => {
                      const optionLetter = String.fromCharCode(65 + idx);
                      return (
                        <Box key={option + '-' + idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Checkbox
                            checked={currentAnswers.includes(option)}
                            onChange={() => handleAnswerChange(currentQuestion.id, option, true)}
                            sx={{ p: 0, mr: 1 }}
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ minWidth: 24, fontWeight: 'bold', color: 'primary.main' }}>{optionLetter}.</Box>
                            <MathRenderer content={option} />
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}

                  {currentQuestion?.type === 'true-false' && (
                    <RadioGroup
                      value={currentAnswers[0] || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    >
                      <FormControlLabel value="True" control={<Radio />} label={<MathRenderer content={"True"} />} />
                      <FormControlLabel value="False" control={<Radio />} label={<MathRenderer content={"False"} />} />
                    </RadioGroup>
                  )}

                {/* Short Answer */}
                {currentQuestion?.type === 'short_answer' && (
                  <TextField
                    fullWidth
                    label="Your Answer"
                    value={currentAnswers[0] || ''}
                    onChange={e => handleAnswerChange(currentQuestion.id, e.target.value)}
                    sx={{ mt: 2 }}
                  />
                )}

                {/* Essay / Open Response */}
                {currentQuestion?.type === 'essay' && (
                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    label="Your Response"
                    value={currentAnswers[0] || ''}
                    onChange={e => handleAnswerChange(currentQuestion.id, e.target.value)}
                    sx={{ mt: 2 }}
                  />
                )}

                {/* Fill in the Blank */}
                {currentQuestion?.type === 'fill_blank' && (
                  <TextField
                    fullWidth
                    label="Fill in the Blank"
                    value={currentAnswers[0] || ''}
                    onChange={e => handleAnswerChange(currentQuestion.id, e.target.value)}
                    sx={{ mt: 2 }}
                  />
                )}

                {/* Matching */}
                {currentQuestion?.type === 'matching' && isClient && matchingChoices.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>Drag and drop to match the items:</Typography>
                    <DragDropContext
                      onDragEnd={result => {
                        if (!result.destination) return;
                        const items = reorder(
                          orderingState[currentQuestion.id] || matchingChoices,
                          result.source.index,
                          result.destination.index
                        );
                        setOrderingState(prev => ({ ...prev, [currentQuestion.id]: items }));
                        handleAnswerChange(currentQuestion.id, items.join(','));
                      }}
                    >
                      <Droppable droppableId={`matching-droppable-${currentQuestion.id}`} direction="vertical">
                        {provided => {
                          const choices = orderingState[currentQuestion.id] || matchingChoices;
                          return (
                            <Box ref={provided.innerRef} {...provided.droppableProps} sx={{ display: 'flex', gap: 2 }}>
                              {/* Left column: Prompts (fixed order) */}
                              <Box>
                                {(currentQuestion.options || []).map((prompt, idx) => (
                                  <Paper key={`left-${prompt}-${idx}`} sx={{ p: 2, mb: 1, minWidth: 120, textAlign: 'center', bgcolor: 'grey.100' }}>
                                    <Typography variant="body1">{prompt}</Typography>
                                  </Paper>
                                ))}
                              </Box>
                              {/* Right column: Choices (draggable) */}
                              <Box>
                                {(choices || []).map((choice, idx) => (
                                  <Draggable key={choice + '-' + idx} draggableId={choice + '-' + idx} index={idx}>
                                    {providedDraggable => (
                                      <Paper
                                        ref={providedDraggable.innerRef}
                                        {...providedDraggable.draggableProps}
                                        {...providedDraggable.dragHandleProps}
                                        sx={{ p: 2, mb: 1, minWidth: 120, textAlign: 'center', cursor: 'grab' }}
                                      >
                                        <Typography variant="body1">{choice}</Typography>
                                      </Paper>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </Box>
                            </Box>
                          );
                        }}
                      </Droppable>
                    </DragDropContext>
                  </Box>
                )}

                {/* Ordering */}
                {currentQuestion?.type === 'ordering' && isClient && orderingChoices.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>Drag and drop to arrange in the correct order:</Typography>
                    <DragDropContext
                      onDragEnd={result => {
                        if (!result.destination) return;
                        const items = reorder(
                          orderingState[currentQuestion.id] || orderingChoices,
                          result.source.index,
                          result.destination.index
                        );
                        setOrderingState(prev => ({ ...prev, [currentQuestion.id]: items }));
                        handleAnswerChange(currentQuestion.id, items.join(','));
                      }}
                    >
                      <Droppable droppableId={`ordering-droppable-${currentQuestion.id}`} direction="vertical">
                        {provided => (
                          <Box ref={provided.innerRef} {...provided.droppableProps}>
                            {(orderingState[currentQuestion.id] || orderingChoices).map((item, idx) => (
                              <Draggable key={item + '-' + idx} draggableId={item + '-' + idx} index={idx}>
                                {providedDraggable => (
                                  <Paper
                                    ref={providedDraggable.innerRef}
                                    {...providedDraggable.draggableProps}
                                    {...providedDraggable.dragHandleProps}
                                    sx={{ p: 2, mb: 1, display: 'flex', alignItems: 'center', cursor: 'grab' }}
                                  >
                                    <Typography variant="body1">{item}</Typography>
                                  </Paper>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </Box>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </Box>
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
                </>
                ) : (
                  // Show all questions at once if not one-at-a-time
                  <>
                    {quiz.questions.map((q, idx) => {
                      const answers = attempt?.answers[q.id] || [];
                      return (
                        <Box key={q.id} sx={{ mb: 4, borderBottom: '1px solid #eee', pb: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box sx={{ flex: 1, fontWeight: 'bold', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ minWidth: 28, fontWeight: 'bold', color: 'primary.main', mr: 1, fontSize: '1.1rem' }}>
                                {idx + 1}.
                              </Box>
                              <MathRenderer content={q.question} />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Chip 
                                label={`${q.points} pts`} 
                                size="small" 
                                color="primary" 
                              />
                              <IconButton
                                size="small"
                                onClick={() => toggleQuestionFlag(q.id)}
                                sx={{ 
                                  color: attempt?.flaggedQuestions.has(q.id) ? '#FF9800' : '#ccc'
                                }}
                              >
                                <FlagIcon />
                              </IconButton>
                            </Box>
                          </Box>
              {q.type === 'multiple-choice' && (
                          <RadioGroup
                            value={answers[0] || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          >
                            {q.options.map((option, idx) => {
                              const optionLetter = String.fromCharCode(65 + idx);
                              return (
                                <FormControlLabel
                                  key={option + '-' + idx}
                                  value={option}
                                  control={<Radio />}
                                  label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Box sx={{ minWidth: 24, fontWeight: 'bold', color: 'primary.main' }}>{optionLetter}.</Box>
                                      <MathRenderer content={option} />
                                    </Box>
                                  }
                                  sx={{ mb: 1 }}
                                />
                              );
                            })}
                          </RadioGroup>
                        )}
                        {q.type === 'multiple-select' && (
                          <Box>
                            {q.options.map((option, idx) => {
                              const optionLetter = String.fromCharCode(65 + idx);
                              return (
                                <Box key={option + '-' + idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <Checkbox
                                    checked={answers.includes(option)}
                                    onChange={() => handleAnswerChange(q.id, option, true)}
                                    sx={{ p: 0, mr: 1 }}
                                  />
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ minWidth: 24, fontWeight: 'bold', color: 'primary.main' }}>{optionLetter}.</Box>
                                    <MathRenderer content={option} />
                                  </Box>
                                </Box>
                              );
                            })}
                          </Box>
                        )}
                        {q.type === 'true-false' && (
                          <RadioGroup
                            value={answers[0] || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          >
                            <FormControlLabel value="True" control={<Radio />} label={<MathRenderer content={"True"} />} />
                            <FormControlLabel value="False" control={<Radio />} label={<MathRenderer content={"False"} />} />
                          </RadioGroup>
                        )}
                        {/* Short Answer */}
                        {q.type === 'short_answer' && (
                          <TextField
                            fullWidth
                            label="Your Answer"
                            value={answers[0] || ''}
                            onChange={e => handleAnswerChange(q.id, e.target.value)}
                            sx={{ mt: 2 }}
                          />
                        )}
                        {/* Essay / Open Response */}
                        {q.type === 'essay' && (
                          <TextField
                            fullWidth
                            multiline
                            minRows={4}
                            label="Your Response"
                            value={answers[0] || ''}
                            onChange={e => handleAnswerChange(q.id, e.target.value)}
                            sx={{ mt: 2 }}
                          />
                        )}
                        {/* Fill in the Blank */}
                        {q.type === 'fill_blank' && (
                          <TextField
                            fullWidth
                            label="Fill in the Blank"
                            value={answers[0] || ''}
                            onChange={e => handleAnswerChange(q.id, e.target.value)}
                            sx={{ mt: 2 }}
                          />
                        )}
                        {/* Matching */}
                        {q.type === 'matching' && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>Drag and drop to match the items:</Typography>
                            <DragDropContext
                              onDragEnd={result => {
                                if (!result.destination) return;
                                const items = reorder(
                                  orderingState[q.id] || q.options || [],
                                  result.source.index,
                                  result.destination.index
                                );
                                setOrderingState(prev => ({ ...prev, [q.id]: items }));
                                handleAnswerChange(q.id, items.join(','));
                              }}
                            >
                              <Droppable droppableId={`matching-droppable-${q.id}`} direction="vertical">
                                {provided => (
                                  <Box ref={provided.innerRef} {...provided.droppableProps} sx={{ display: 'flex', gap: 2 }}>
                                    {/* Left column: Prompts (fixed order) */}
                                    <Box>
                                      {q.options.map((prompt, idx) => (
                                        <Paper key={`left-${prompt}-${idx}`} sx={{ p: 2, mb: 1, minWidth: 120, textAlign: 'center', bgcolor: 'grey.100' }}>
                                          <Typography variant="body1">{prompt}</Typography>
                                        </Paper>
                                      ))}
                                    </Box>
                                    {/* Right column: Choices (draggable) */}
                                    <Box>
                                      {(orderingState[q.id] || q.options || []).map((choice, idx) => (
                                        <Draggable key={choice + '-' + idx} draggableId={choice + '-' + idx} index={idx}>
                                          {providedDraggable => (
                                            <Paper
                                              ref={providedDraggable.innerRef}
                                              {...providedDraggable.draggableProps}
                                              {...providedDraggable.dragHandleProps}
                                              sx={{ p: 2, mb: 1, minWidth: 120, textAlign: 'center', cursor: 'grab' }}
                                            >
                                              <Typography variant="body1">{choice}</Typography>
                                            </Paper>
                                          )}
                                        </Draggable>
                                      ))}
                                      {provided.placeholder}
                                    </Box>
                                  </Box>
                                )}
                              </Droppable>
                            </DragDropContext>
                          </Box>
                        )}
                        {/* Ordering */}
                        {q.type === 'ordering' && (
                          <TextField
                            fullWidth
                            label="Enter order (comma separated)"
                            value={answers[0] || ''}
                            onChange={e => handleAnswerChange(q.id, e.target.value)}
                            sx={{ mt: 2 }}
                            helperText="Format: 1,2,3,4"
                          />
                        )}
                      </Box>
                    );
                  })}
                </>
              )}

>>>>>>> 99ca4a1 (Initial commit)
            </CardContent>
          </Card>
        </Grid>

        {/* Question Navigator */}
<<<<<<< HEAD
        <Grid xs={12} md={3}>
=======
        <Grid item xs={12} md={3}>
>>>>>>> 99ca4a1 (Initial commit)
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
<<<<<<< HEAD
                    <Grid xs={3} key={q.id}>
=======
                    <Grid item xs={3} key={q.id}>
>>>>>>> 99ca4a1 (Initial commit)
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
<<<<<<< HEAD
    </Container>
=======

    </Container>
    {/* Close the fragment opened at the top-level response */}
    </>
>>>>>>> 99ca4a1 (Initial commit)
  );
}
