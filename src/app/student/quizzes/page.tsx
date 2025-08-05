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
  LinearProgress,
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
  IconButton,
  Breadcrumbs,
  Link,
  Paper,
  Stack,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Quiz as QuizIcon,
  Schedule as ScheduleIcon,
  Timer as TimerIcon,
  Star as StarIcon,
  CheckCircle as CompletedIcon,
  PendingActions as PendingIcon,
  Lock as LockedIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  PlayArrow as StartIcon,
  Info as InfoIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  Subject as SubjectIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  teacher: string;
  dueDate: string | null;
  timeLimit: number;
  totalQuestions: number;
  totalPoints: number;
  attempts: number;
  maxAttempts: number;
  status: 'upcoming' | 'available' | 'completed' | 'overdue' | 'locked';
  score?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  lastAttempt?: string;
}

export default function StudentQuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);

  useEffect(() => {
    loadQuizzes();
  }, []);

  useEffect(() => {
    filterQuizzes();
  }, [quizzes, filter]);

  const loadQuizzes = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/student/quizzes', {
        credentials: 'include'
      });

      if (response.ok) {
        const quizzesData = await response.json();
        setQuizzes(quizzesData);
      } else if (response.status === 401) {
        // Redirect to login if unauthorized
        router.push('/auth/login');
      } else {
        console.error('Failed to fetch quizzes:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading quizzes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterQuizzes = () => {
    let filtered = quizzes;
    
    switch (filter) {
      case 'available':
        filtered = quizzes.filter(q => q.status === 'available');
        break;
      case 'completed':
        filtered = quizzes.filter(q => q.status === 'completed');
        break;
      case 'upcoming':
        filtered = quizzes.filter(q => q.status === 'upcoming');
        break;
      case 'overdue':
        filtered = quizzes.filter(q => q.status === 'overdue');
        break;
      default:
        filtered = quizzes;
    }

    setFilteredQuizzes(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'completed': return 'primary';
      case 'upcoming': return 'info';
      case 'overdue': return 'error';
      case 'locked': return 'default';
      default: return 'default';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  const formatDueDate = (dateString: string | null) => {
    if (!dateString) {
      return 'No due date set';
    }
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const now = new Date();
    const diffHours = (date.getTime() - now.getTime()) / (1000 * 3600);
    
    if (diffHours < 24 && diffHours > 0) {
      return `Due in ${Math.round(diffHours)} hours`;
    } else if (diffHours < 0) {
      return `Overdue by ${Math.abs(Math.round(diffHours))} hours`;
    } else {
      return `Due ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  const startQuiz = async (quiz: Quiz) => {
    if (quiz.status === 'available') {
      // Navigate directly to quiz taking page
      router.push(`/student/quizzes/${quiz.id}`);
    } else {
      setSelectedQuiz(quiz);
      setQuizDialogOpen(true);
    }
  };

  const getQuizStats = () => {
    return {
      total: quizzes.length,
      available: quizzes.filter(q => q.status === 'available').length,
      completed: quizzes.filter(q => q.status === 'completed').length,
      upcoming: quizzes.filter(q => q.status === 'upcoming').length,
      overdue: quizzes.filter(q => q.status === 'overdue').length,
      averageScore: quizzes
        .filter(q => q.score !== undefined)
        .reduce((acc, q) => acc + (q.score || 0), 0) / 
        quizzes.filter(q => q.score !== undefined).length || 0
    };
  };

  const stats = getQuizStats();

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <LinearProgress sx={{ width: '100%', maxWidth: 400 }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link href="/student" underline="hover">Dashboard</Link>
        <Typography color="text.primary">Quizzes</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight="bold">
          My Quizzes 📚
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Track your progress and complete your assignments
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <QuizIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
              <Typography variant="body2">Total Quizzes</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <StartIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">{stats.available}</Typography>
              <Typography variant="body2">Available</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CompletedIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">{stats.completed}</Typography>
              <Typography variant="body2">Completed</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ background: 'linear-gradient(45deg, #9C27B0 30%, #BA68C8 90%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">{stats.upcoming}</Typography>
              <Typography variant="body2">Upcoming</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ background: 'linear-gradient(45deg, #F44336 30%, #EF5350 90%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">{stats.averageScore.toFixed(1)}%</Typography>
              <Typography variant="body2">Avg Score</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Typography variant="h6">Filter:</Typography>
          {['all', 'available', 'completed', 'upcoming', 'overdue'].map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? 'contained' : 'outlined'}
              onClick={() => setFilter(filterType)}
              size="small"
              sx={{ textTransform: 'capitalize' }}
            >
              {filterType} 
              {filterType !== 'all' && (
                <Badge badgeContent={quizzes.filter(q => q.status === filterType).length} color="primary" sx={{ ml: 1 }} />
              )}
            </Button>
          ))}
        </Stack>
      </Paper>

      {/* Quiz Cards */}
      <Grid container spacing={3}>
        {filteredQuizzes.map((quiz) => (
          <Grid item xs={12} md={6} lg={4} key={quiz.id}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Chip 
                      label={quiz.status} 
                      color={getStatusColor(quiz.status) as any}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {quiz.title}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: `${getDifficultyColor(quiz.difficulty)}.main` }}>
                    <QuizIcon />
                  </Avatar>
                </Box>

                {/* Description */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                  {quiz.description}
                </Typography>

                {/* Details */}
                <Stack spacing={1} sx={{ mb: 2 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <SubjectIcon fontSize="small" />
                    <Typography variant="body2">{quiz.subject}</Typography>
                    <Typography variant="body2" color="text.secondary">• {quiz.teacher}</Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={1}>
                    <TimerIcon fontSize="small" />
                    <Typography variant="body2">{quiz.timeLimit} minutes</Typography>
                    <Typography variant="body2" color="text.secondary">• {quiz.totalQuestions} questions</Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <ScheduleIcon fontSize="small" />
                    <Typography variant="body2" color={quiz.status === 'overdue' ? 'error.main' : 'text.secondary'}>
                      {formatDueDate(quiz.dueDate)}
                    </Typography>
                  </Box>
                </Stack>

                {/* Score/Attempts */}
                {quiz.score !== undefined && (
                  <Box sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2">Your Score:</Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary.main">
                        {quiz.score}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={quiz.score} 
                      color={quiz.score >= 80 ? 'success' : quiz.score >= 60 ? 'warning' : 'error'}
                    />
                  </Box>
                )}

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Attempts: {quiz.attempts}/{quiz.maxAttempts}
                  </Typography>
                  <Chip 
                    label={quiz.difficulty} 
                    color={getDifficultyColor(quiz.difficulty) as any}
                    size="small"
                  />
                </Box>

                {/* Tags */}
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                  {quiz.tags.slice(0, 2).map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                  {quiz.tags.length > 2 && (
                    <Typography variant="caption" color="text.secondary">
                      +{quiz.tags.length - 2} more
                    </Typography>
                  )}
                </Stack>

                {/* Action Button */}
                <Button
                  fullWidth
                  variant={quiz.status === 'available' ? 'contained' : 'outlined'}
                  startIcon={
                    quiz.status === 'completed' ? <CompletedIcon /> :
                    quiz.status === 'available' ? <StartIcon /> :
                    quiz.status === 'locked' ? <LockedIcon /> :
                    <InfoIcon />
                  }
                  onClick={() => startQuiz(quiz)}
                  disabled={quiz.status === 'locked'}
                  color={
                    quiz.status === 'overdue' ? 'error' :
                    quiz.status === 'completed' ? 'success' :
                    'primary'
                  }
                >
                  {quiz.status === 'available' ? 'Start Quiz' :
                   quiz.status === 'completed' ? 'View Results' :
                   quiz.status === 'upcoming' ? 'View Details' :
                   quiz.status === 'overdue' ? 'Past Due' :
                   'Locked'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredQuizzes.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <QuizIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No quizzes found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filter === 'all' 
              ? "You don&apos;t have any quizzes yet."
              : `No ${filter} quizzes at the moment.`
            }
          </Typography>
        </Paper>
      )}

      {/* Quiz Details Dialog */}
      <Dialog 
        open={quizDialogOpen} 
        onClose={() => setQuizDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedQuiz && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: `${getDifficultyColor(selectedQuiz.difficulty)}.main` }}>
                  <QuizIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedQuiz.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedQuiz.subject} • {selectedQuiz.teacher}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph>
                {selectedQuiz.description}
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon><TimerIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Time Limit" 
                    secondary={`${selectedQuiz.timeLimit} minutes`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><AssignmentIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Questions" 
                    secondary={`${selectedQuiz.totalQuestions} questions worth ${selectedQuiz.totalPoints} points`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><ScheduleIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Due Date" 
                    secondary={formatDueDate(selectedQuiz.dueDate)} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><StarIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Attempts" 
                    secondary={`${selectedQuiz.attempts}/${selectedQuiz.maxAttempts} attempts used`} 
                  />
                </ListItem>
              </List>

              {selectedQuiz.score !== undefined && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Your best score: {selectedQuiz.score}%
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setQuizDialogOpen(false)}>
                Close
              </Button>
              {selectedQuiz.status === 'available' && (
                <Button 
                  variant="contained" 
                  startIcon={<StartIcon />}
                  onClick={() => {
                    setQuizDialogOpen(false);
                    router.push(`/student/quiz/${selectedQuiz.id}/take`);
                  }}
                >
                  Start Quiz
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}
