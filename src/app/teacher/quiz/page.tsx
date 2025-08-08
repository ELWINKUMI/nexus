'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Breadcrumbs,
  Link,
  Fab,
  CircularProgress,
  Divider,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FileCopy as CopyIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Assignment as QuizIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  Assessment as StatsIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  className: string;
  subjectName: string;
  timeLimit: number;
  questionCount: number;
  totalPoints: number;
  status: 'draft' | 'published';
  attemptsAllowed: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export default function QuizListPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teacher/quiz', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
      } else if (response.status === 401) {
        // Redirect to login if unauthorized
        window.location.href = '/';
      } else {
        setError('Failed to load quizzes');
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, quiz: Quiz) => {
    setAnchorEl(event.currentTarget);
    setSelectedQuiz(quiz);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedQuiz(null);
  };

  const handleEdit = () => {
    if (selectedQuiz) {
      router.push(`/teacher/quiz/edit/${selectedQuiz._id}`);
    }
    handleMenuClose();
  };

  const handleView = () => {
    if (selectedQuiz) {
      router.push(`/teacher/quiz/view/${selectedQuiz._id}`);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (!selectedQuiz) return;

    try {
      setDeletingQuizId(selectedQuiz._id);
      const response = await fetch(`/api/teacher/quiz/${selectedQuiz._id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setQuizzes(quizzes.filter(quiz => quiz._id !== selectedQuiz._id));
        setDeleteDialogOpen(false);
        setSelectedQuiz(null);
      } else {
        setError('Failed to delete quiz');
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
      setError('Network error. Please try again.');
    } finally {
      setDeletingQuizId(null);
    }
  };

  const handleDuplicate = async () => {
    if (!selectedQuiz) return;

    try {
      const response = await fetch(`/api/teacher/quiz/${selectedQuiz._id}/duplicate`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        fetchQuizzes(); // Refresh the list
      } else {
        setError('Failed to duplicate quiz');
      }
    } catch (error) {
      console.error('Error duplicating quiz:', error);
      setError('Network error. Please try again.');
    }
    handleMenuClose();
  };

  const getStatusColor = (status: string) => {
    return status === 'published' ? 'success' : 'warning';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link href="/teacher" underline="hover">Dashboard</Link>
        <Typography color="text.primary">Quizzes</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          My Quizzes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/teacher/quiz/create')}
        >
          Create Quiz
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Quiz Grid */}
      {quizzes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <QuizIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Quizzes Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Get started by creating your first quiz for your students.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/teacher/quiz/create')}
          >
            Create Your First Quiz
          </Button>
        </Paper>
      ) : (
        <Box display="flex" flexWrap="wrap" gap={3}>
          {quizzes.map((quiz) => (
            <Card key={quiz._id} sx={{ width: 350, height: 'fit-content', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                  <Chip 
                    label={quiz.status.toUpperCase()} 
                    color={getStatusColor(quiz.status)}
                    size="small"
                  />
                  <IconButton 
                    size="small"
                    onClick={(e) => handleMenuClick(e, quiz)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                {/* Title */}
                <Typography variant="h6" gutterBottom noWrap title={quiz.title}>
                  {quiz.title}
                </Typography>

                {/* Description */}
                {quiz.description && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {quiz.description}
                  </Typography>
                )}

                {/* Class and Subject */}
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Chip label={quiz.className} size="small" variant="outlined" />
                  <Chip label={quiz.subjectName} size="small" variant="outlined" />
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* Stats */}
                <Box display="flex" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
                  <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: '45%' }}>
                    <ScheduleIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {quiz.timeLimit} min
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: '45%' }}>
                    <StatsIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {quiz.questionCount} questions
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: '45%' }}>
                    <PeopleIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {quiz.attemptsAllowed === 0 ? 'Unlimited' : `${quiz.attemptsAllowed} attempts`}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: '45%' }}>
                    <Typography variant="body2" color="text.secondary">
                      {quiz.totalPoints} pts
                    </Typography>
                  </Box>
                </Box>

                {/* Dates */}
                {quiz.startDate && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Starts: {formatDate(quiz.startDate)}
                  </Typography>
                )}
                {quiz.endDate && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Ends: {formatDate(quiz.endDate)}
                  </Typography>
                )}

                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  Created: {formatDate(quiz.createdAt)}
                </Typography>
              </CardContent>
<<<<<<< HEAD
=======
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => router.push(`/teacher/quiz/${quiz._id}`)}
              >
                Manage
              </Button>
>>>>>>> 99ca4a1 (Initial commit)
            </Card>
          ))}
        </Box>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add quiz"
        onClick={() => router.push('/teacher/quiz/create')}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24
        }}
      >
        <AddIcon />
      </Fab>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <ViewIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Quiz
        </MenuItem>
        <MenuItem onClick={handleDuplicate}>
          <CopyIcon sx={{ mr: 1 }} />
          Duplicate
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Quiz</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedQuiz?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmDelete}
            disabled={deletingQuizId === selectedQuiz?._id}
          >
            {deletingQuizId === selectedQuiz?._id ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
