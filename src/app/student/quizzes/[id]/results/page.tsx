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
  Alert,
  Chip,
  Paper,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Breadcrumbs,
  Link,
  Divider
} from '@mui/material';
import {
  CheckCircle as CorrectIcon,
  Cancel as WrongIcon,
  ExpandMore as ExpandMoreIcon,
  Quiz as QuizIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Timer as TimerIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';

interface QuizResult {
  id: string;
  quizId: string;
  quizTitle: string;
  subject: string;
  subjectColor: string;
  teacher: string;
  score: number;
  totalPoints: number;
  percentage: number;
  letterGrade: string;
  timeSpent: number; // in seconds
  submittedAt: string;
  questions: QuestionResult[];
  feedback?: string;
}

interface QuestionResult {
  id: string;
  question: string;
  type: 'multiple-choice' | 'multiple-select' | 'true-false';
  options: string[];
  correctAnswers: string[];
  userAnswers: string[];
  isCorrect: boolean;
  points: number;
  earnedPoints: number;
  explanation?: string;
}

export default function QuizResultsPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [result, setResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState<string | false>(false);

  useEffect(() => {
    loadQuizResult();
  }, [quizId]);

  const loadQuizResult = async () => {
    try {
      setIsLoading(true);
      
      // For now, use mockup data since we're implementing the feature
      const mockResult: QuizResult = {
        id: 'result_001',
        quizId: quizId,
        quizTitle: 'Chapter 7: Quadratic Equations',
        subject: 'Mathematics',
        subjectColor: '#2196F3',
        teacher: 'Mrs. Johnson',
        score: 38,
        totalPoints: 50,
        percentage: 76,
        letterGrade: 'B',
        timeSpent: 1580, // 26 minutes and 20 seconds
        submittedAt: new Date().toISOString(),
        feedback: 'Good work! You have a solid understanding of quadratic equations. Focus on reviewing the discriminant and vertex form for better results.',
        questions: [
          {
            id: 'q1',
            question: 'What is the quadratic formula?',
            type: 'multiple-choice',
            options: [
              'x = (-b ± √(b² - 4ac)) / 2a',
              'x = (-b ± √(b² + 4ac)) / 2a',
              'x = (b ± √(b² - 4ac)) / 2a',
              'x = (-b ± √(b² - 4ac)) / a'
            ],
            correctAnswers: ['x = (-b ± √(b² - 4ac)) / 2a'],
            userAnswers: ['x = (-b ± √(b² - 4ac)) / 2a'],
            isCorrect: true,
            points: 5,
            earnedPoints: 5,
            explanation: 'The quadratic formula is used to solve equations of the form ax² + bx + c = 0.'
          },
          {
            id: 'q2',
            question: 'Which of the following are quadratic equations? (Select all that apply)',
            type: 'multiple-select',
            options: [
              'x² + 5x + 6 = 0',
              '2x + 3 = 0',
              '3x² - 2x + 1 = 0',
              'x³ + x² + 1 = 0'
            ],
            correctAnswers: ['x² + 5x + 6 = 0', '3x² - 2x + 1 = 0'],
            userAnswers: ['x² + 5x + 6 = 0'],
            isCorrect: false,
            points: 5,
            earnedPoints: 2,
            explanation: 'Quadratic equations have the highest power of x as 2. You missed one correct answer.'
          },
          {
            id: 'q3',
            question: 'The discriminant of a quadratic equation ax² + bx + c = 0 is b² - 4ac.',
            type: 'true-false',
            options: ['True', 'False'],
            correctAnswers: ['True'],
            userAnswers: ['True'],
            isCorrect: true,
            points: 3,
            earnedPoints: 3,
            explanation: 'The discriminant determines the nature of the roots of a quadratic equation.'
          },
          {
            id: 'q4',
            question: 'What are the roots of x² - 5x + 6 = 0?',
            type: 'multiple-choice',
            options: ['x = 2, 3', 'x = 1, 6', 'x = -2, -3', 'x = 5, 1'],
            correctAnswers: ['x = 2, 3'],
            userAnswers: ['x = 1, 6'],
            isCorrect: false,
            points: 7,
            earnedPoints: 0,
            explanation: 'Factor the equation: (x-2)(x-3) = 0, so x = 2 or x = 3.'
          },
          {
            id: 'q5',
            question: 'If the discriminant is negative, the quadratic equation has:',
            type: 'multiple-choice',
            options: [
              'Two real and distinct roots',
              'Two real and equal roots', 
              'No real roots',
              'One real root'
            ],
            correctAnswers: ['No real roots'],
            userAnswers: ['Two real and equal roots'],
            isCorrect: false,
            points: 5,
            earnedPoints: 0,
            explanation: 'A negative discriminant means the roots are complex (imaginary).'
          },
          {
            id: 'q6',
            question: 'Which methods can be used to solve quadratic equations? (Select all that apply)',
            type: 'multiple-select',
            options: [
              'Factoring',
              'Quadratic formula',
              'Completing the square',
              'Linear substitution'
            ],
            correctAnswers: ['Factoring', 'Quadratic formula', 'Completing the square'],
            userAnswers: ['Factoring', 'Quadratic formula', 'Completing the square'],
            isCorrect: true,
            points: 6,
            earnedPoints: 6,
            explanation: 'All three methods are valid for solving quadratic equations.'
          },
          {
            id: 'q7',
            question: 'The vertex form of a quadratic equation is y = a(x - h)² + k.',
            type: 'true-false',
            options: ['True', 'False'],
            correctAnswers: ['True'],
            userAnswers: ['True'],
            isCorrect: true,
            points: 3,
            earnedPoints: 3,
            explanation: 'In vertex form, (h, k) represents the vertex of the parabola.'
          },
          {
            id: 'q8',
            question: 'What is the axis of symmetry for y = x² - 4x + 3?',
            type: 'multiple-choice',
            options: ['x = 2', 'x = -2', 'x = 4', 'x = 1'],
            correctAnswers: ['x = 2'],
            userAnswers: ['x = 4'],
            isCorrect: false,
            points: 5,
            earnedPoints: 0,
            explanation: 'The axis of symmetry is x = -b/2a = -(-4)/2(1) = 2.'
          },
          {
            id: 'q9',
            question: 'A parabola opens upward when the coefficient of x² is positive.',
            type: 'true-false',
            options: ['True', 'False'],
            correctAnswers: ['True'],
            userAnswers: ['True'],
            isCorrect: true,
            points: 3,
            earnedPoints: 3,
            explanation: 'When a > 0, the parabola opens upward; when a < 0, it opens downward.'
          },
          {
            id: 'q10',
            question: 'Solve for x: x² + 6x + 9 = 0',
            type: 'multiple-choice',
            options: ['x = -3 (double root)', 'x = 3, -3', 'x = 0, -6', 'No real solutions'],
            correctAnswers: ['x = -3 (double root)'],
            userAnswers: ['x = -3 (double root)'],
            isCorrect: true,
            points: 8,
            earnedPoints: 8,
            explanation: 'This is a perfect square: (x + 3)² = 0, so x = -3 with multiplicity 2.'
          }
        ]
      };

      setResult(mockResult);
    } catch (error) {
      console.error('Error loading quiz result:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return '#4CAF50'; // Green
    if (percentage >= 80) return '#2196F3'; // Blue
    if (percentage >= 70) return '#FF9800'; // Orange
    if (percentage >= 60) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getCorrectAnswersCount = () => {
    if (!result) return 0;
    return result.questions.filter(q => q.isCorrect).length;
  };

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedQuestion(isExpanded ? panel : false);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading results...</Typography>
      </Box>
    );
  }

  if (!result) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>Results not found</Typography>
        <Button variant="contained" onClick={() => router.push('/student/quizzes')}>
          Back to Quizzes
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link href="/student" underline="hover">Dashboard</Link>
        <Link href="/student/quizzes" underline="hover">Quizzes</Link>
        <Typography color="text.primary">Results</Typography>
      </Breadcrumbs>

      {/* Results Header */}
      <Card sx={{ mb: 4, background: `linear-gradient(135deg, ${result.subjectColor}20 0%, ${result.subjectColor}40 100%)` }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <AssessmentIcon sx={{ fontSize: 64, color: result.subjectColor, mb: 2 }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
              Quiz Results
            </Typography>
            <Typography variant="h5" color="text.secondary">
              {result.quizTitle}
            </Typography>
            <Chip 
              label={result.subject} 
              sx={{ 
                mt: 1,
                backgroundColor: result.subjectColor + '20',
                color: result.subjectColor,
                fontWeight: 'bold'
              }}
            />
          </Box>

          <Grid container spacing={3} justifyContent="center">
            <Grid xs={6} md={2}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: getGradeColor(result.percentage) }}>
                  {result.percentage}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Grade: {result.letterGrade}
                </Typography>
              </Paper>
            </Grid>
            <Grid xs={6} md={2}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: result.subjectColor }}>
                  {result.score}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  of {result.totalPoints} points
                </Typography>
              </Paper>
            </Grid>
            <Grid xs={6} md={2}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                  {getCorrectAnswersCount()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  of {result.questions.length} correct
                </Typography>
              </Paper>
            </Grid>
            <Grid xs={6} md={2}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                  {formatTime(result.timeSpent)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Time taken
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Teacher Feedback */}
      {result.feedback && (
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Teacher Feedback:
          </Typography>
          <Typography variant="body2">
            {result.feedback}
          </Typography>
        </Alert>
      )}

      {/* Performance Breakdown */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Performance Breakdown
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Score Progress</Typography>
              <Typography variant="body2">{result.score}/{result.totalPoints} points</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(result.score / result.totalPoints) * 100} 
              sx={{ 
                height: 10, 
                borderRadius: 5,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getGradeColor(result.percentage)
                }
              }} 
            />
          </Box>

          <Grid container spacing={2}>
            <Grid xs={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <CorrectIcon sx={{ fontSize: 32, color: '#4CAF50', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {getCorrectAnswersCount()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Correct
                </Typography>
              </Box>
            </Grid>
            <Grid xs={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <WrongIcon sx={{ fontSize: 32, color: '#F44336', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {result.questions.length - getCorrectAnswersCount()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Incorrect
                </Typography>
              </Box>
            </Grid>
            <Grid xs={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <StarIcon sx={{ fontSize: 32, color: '#FF9800', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {result.percentage >= 80 ? 'Excellent' : result.percentage >= 60 ? 'Good' : 'Needs Work'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Performance
                </Typography>
              </Box>
            </Grid>
            <Grid xs={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <TimerIcon sx={{ fontSize: 32, color: '#2196F3', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {Math.round((result.timeSpent / result.questions.length) / 60 * 10) / 10}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Min/Question
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Question Review */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
        Question Review
      </Typography>

      {result.questions.map((question, index) => (
        <Accordion
          key={question.id}
          expanded={expandedQuestion === question.id}
          onChange={handleAccordionChange(question.id)}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
              {question.isCorrect ? (
                <CorrectIcon sx={{ color: '#4CAF50' }} />
              ) : (
                <WrongIcon sx={{ color: '#F44336' }} />
              )}
              <Typography sx={{ flex: 1 }}>
                Question {index + 1}: {question.question.length > 80 ? question.question.substring(0, 80) + '...' : question.question}
              </Typography>
              <Chip 
                label={`${question.earnedPoints}/${question.points} pts`}
                size="small"
                color={question.isCorrect ? 'success' : 'error'}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ pl: 5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                {question.question}
              </Typography>

              {question.type === 'multiple-choice' && (
                <Box sx={{ mb: 2 }}>
                  {question.options.map((option) => {
                    const isCorrect = question.correctAnswers.includes(option);
                    const isUserAnswer = question.userAnswers.includes(option);
                    
                    return (
                      <Box
                        key={option}
                        sx={{
                          p: 1,
                          mb: 1,
                          borderRadius: 1,
                          backgroundColor: isCorrect ? '#4CAF5020' : 
                                         isUserAnswer && !isCorrect ? '#F4433620' : 
                                         'transparent',
                          border: isCorrect ? '1px solid #4CAF50' : 
                                 isUserAnswer && !isCorrect ? '1px solid #F44336' : 
                                 '1px solid #e0e0e0'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {isCorrect && <CorrectIcon sx={{ fontSize: 20, color: '#4CAF50' }} />}
                          {isUserAnswer && !isCorrect && <WrongIcon sx={{ fontSize: 20, color: '#F44336' }} />}
                          <Typography variant="body2">{option}</Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}

              {question.type === 'multiple-select' && (
                <Box sx={{ mb: 2 }}>
                  {question.options.map((option) => {
                    const isCorrect = question.correctAnswers.includes(option);
                    const isUserAnswer = question.userAnswers.includes(option);
                    
                    return (
                      <Box
                        key={option}
                        sx={{
                          p: 1,
                          mb: 1,
                          borderRadius: 1,
                          backgroundColor: isCorrect && isUserAnswer ? '#4CAF5020' : 
                                         isCorrect && !isUserAnswer ? '#FF980020' :
                                         !isCorrect && isUserAnswer ? '#F4433620' : 
                                         'transparent',
                          border: isCorrect && isUserAnswer ? '1px solid #4CAF50' : 
                                 isCorrect && !isUserAnswer ? '1px solid #FF9800' :
                                 !isCorrect && isUserAnswer ? '1px solid #F44336' : 
                                 '1px solid #e0e0e0'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {isCorrect && isUserAnswer && <CorrectIcon sx={{ fontSize: 20, color: '#4CAF50' }} />}
                          {isCorrect && !isUserAnswer && <Typography variant="caption" sx={{ color: '#FF9800' }}>Missed</Typography>}
                          {!isCorrect && isUserAnswer && <WrongIcon sx={{ fontSize: 20, color: '#F44336' }} />}
                          <Typography variant="body2">{option}</Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}

              {question.type === 'true-false' && (
                <Box sx={{ mb: 2 }}>
                  {question.options.map((option) => {
                    const isCorrect = question.correctAnswers.includes(option);
                    const isUserAnswer = question.userAnswers.includes(option);
                    
                    return (
                      <Box
                        key={option}
                        sx={{
                          p: 1,
                          mb: 1,
                          borderRadius: 1,
                          backgroundColor: isCorrect ? '#4CAF5020' : 
                                         isUserAnswer && !isCorrect ? '#F4433620' : 
                                         'transparent',
                          border: isCorrect ? '1px solid #4CAF50' : 
                                 isUserAnswer && !isCorrect ? '1px solid #F44336' : 
                                 '1px solid #e0e0e0'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {isCorrect && <CorrectIcon sx={{ fontSize: 20, color: '#4CAF50' }} />}
                          {isUserAnswer && !isCorrect && <WrongIcon sx={{ fontSize: 20, color: '#F44336' }} />}
                          <Typography variant="body2">{option}</Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}

              {question.explanation && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Explanation:</strong> {question.explanation}
                  </Typography>
                </Alert>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Actions */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="outlined"
            onClick={() => router.push('/student/quizzes')}
          >
            Back to Quizzes
          </Button>
          <Button
            variant="contained"
            onClick={() => router.push('/student/grades')}
            sx={{ backgroundColor: result.subjectColor }}
          >
            View All Grades
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
