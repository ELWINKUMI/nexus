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
  Tooltip,
  TextField,
  InputAdornment,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Grade as GradeIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  Subject as SubjectIcon,
  DateRange as DateIcon,
  Star as StarIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  CheckCircle as PassIcon,
  Warning as WarningIcon,
  Error as FailIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface Grade {
  id: string;
  title: string;
  type: 'assignment' | 'quiz' | 'exam' | 'project';
  subject: string;
  subjectColor: string;
  teacher: string;
  score: number | null;
  maxPoints: number;
  percentage: number | null;
  letterGrade: string;
  submittedAt: string | null;
  gradedAt: string | null;
  feedback?: string;
  status: 'graded' | 'pending' | 'missing';
}

interface SubjectGrade {
  subject: string;
  subjectColor: string;
  teacher: string;
  currentGrade: number;
  letterGrade: string;
  totalPoints: number;
  earnedPoints: number;
  assignments: number;
  quizzes: number;
  trend: 'up' | 'down' | 'stable';
}

export default function StudentGradesPage() {
  const router = useRouter();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjectGrades, setSubjectGrades] = useState<SubjectGrade[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);

  useEffect(() => {
    loadGrades();
  }, []);

  const loadGrades = async () => {
    try {
      setIsLoading(true);
      
      // Fetch real grades from API
      const response = await fetch('/api/student/grades', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        
        // Map API response to component interface
        const mappedGrades: Grade[] = data.grades.map((grade: any) => ({
          id: grade.id,
          title: grade.title,
          type: grade.type,
          subject: grade.subject,
          subjectColor: grade.subjectColor,
          teacher: grade.teacher,
          score: grade.score,
          maxPoints: grade.maxPoints,
          percentage: grade.percentage,
          letterGrade: grade.letterGrade,
          submittedAt: grade.submittedAt,
          gradedAt: grade.gradedAt,
          feedback: grade.feedback,
          status: grade.status
        }));

        const mappedSubjectGrades: SubjectGrade[] = data.subjectGrades.map((subject: any) => ({
          subject: subject.subject,
          subjectColor: subject.subjectColor,
          teacher: subject.teacher,
          currentGrade: subject.currentGrade,
          letterGrade: subject.letterGrade,
          totalPoints: subject.totalPoints,
          earnedPoints: subject.earnedPoints,
          assignments: subject.assignments,
          quizzes: subject.quizzes,
          trend: subject.trend
        }));

        setGrades(mappedGrades);
        setSubjectGrades(mappedSubjectGrades);
      } else {
        console.error('Failed to fetch grades');
        // Fallback to empty arrays if API fails
        setGrades([]);
        setSubjectGrades([]);
      }
    } catch (error) {
      console.error('Error loading grades:', error);
      // Fallback to empty arrays if there's an error
      setGrades([]);
      setSubjectGrades([]);
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

  const getGradeIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <AssignmentIcon />;
      case 'quiz': return <QuizIcon />;
      case 'exam': return <AssessmentIcon />;
      case 'project': return <StarIcon />;
      default: return <GradeIcon />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUpIcon sx={{ color: '#4CAF50' }} />;
      case 'down': return <TrendingDownIcon sx={{ color: '#F44336' }} />;
      default: return null;
    }
  };

  const getOverallGPA = () => {
    if (subjectGrades.length === 0) return 0;
    const totalGrade = subjectGrades.reduce((sum, subject) => sum + subject.currentGrade, 0);
    return (totalGrade / subjectGrades.length).toFixed(1);
  };

  const getOverallLetterGrade = () => {
    const gpa = parseFloat(getOverallGPA());
    if (gpa >= 90) return 'A';
    if (gpa >= 80) return 'B';
    if (gpa >= 70) return 'C';
    if (gpa >= 60) return 'D';
    return 'F';
  };

  const filteredGrades = grades.filter(grade => {
    const matchesSearch = grade.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grade.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = subjectFilter === 'all' || grade.subject === subjectFilter;
    const matchesType = typeFilter === 'all' || grade.type === typeFilter;
    
    return matchesSearch && matchesSubject && matchesType;
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading grades...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link href="/student" underline="hover">Dashboard</Link>
        <Typography color="text.primary">Grades</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            <GradeIcon sx={{ mr: 2, verticalAlign: 'middle', fontSize: 40 }} />
            My Grades
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your academic performance and progress
          </Typography>
        </Box>
      </Box>

      {/* Overall GPA Card */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {getOverallGPA()}%
                </Typography>
                <Typography variant="h5" sx={{ opacity: 0.9 }}>
                  Overall Grade: {getOverallLetterGrade()}
                </Typography>
              </Box>
            </Grid>
            <Grid xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {subjectGrades.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Subjects
                    </Typography>
                  </Box>
                </Grid>
                <Grid xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {grades.filter(g => g.status === 'graded').length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Graded Items
                    </Typography>
                  </Box>
                </Grid>
                <Grid xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {grades.filter(g => g.status === 'pending').length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Pending
                    </Typography>
                  </Box>
                </Grid>
                <Grid xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {grades.filter(g => g.percentage !== null && g.percentage >= 90).length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      A Grades
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Subject Grades */}
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        Subject Performance
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {subjectGrades.map((subject) => (
          <Grid xs={12} sm={6} md={3} key={subject.subject}>
            <Card sx={{ borderLeft: `4px solid ${subject.subjectColor}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {subject.subject}
                  </Typography>
                  {getTrendIcon(subject.trend)}
                </Box>
                
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: subject.subjectColor, mb: 1 }}>
                  {subject.currentGrade}%
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Grade: {subject.letterGrade}
                </Typography>
                
                <LinearProgress 
                  variant="determinate" 
                  value={subject.currentGrade} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: subject.subjectColor
                    }
                  }} 
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {subject.earnedPoints}/{subject.totalPoints} pts
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {subject.teacher}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search grades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Subject"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value="all">All Subjects</option>
              {[...new Set(grades.map(g => g.subject))].map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </TextField>
          </Grid>
          <Grid xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value="all">All Types</option>
              <option value="assignment">Assignments</option>
              <option value="quiz">Quizzes</option>
              <option value="exam">Exams</option>
              <option value="project">Projects</option>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Grades Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Assignment</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Score</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Grade</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredGrades.map((grade) => (
                  <TableRow 
                    key={grade.id}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#f9f9f9' }
                    }}
                    onClick={() => {
                      setSelectedGrade(grade);
                      setGradeDialogOpen(true);
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getGradeIcon(grade.type)}
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {grade.title}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={grade.subject} 
                        size="small" 
                        sx={{ 
                          backgroundColor: grade.subjectColor + '20',
                          color: grade.subjectColor,
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {grade.type}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {grade.score !== null ? `${grade.score}/${grade.maxPoints}` : `-/${grade.maxPoints}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 'bold',
                            color: grade.percentage !== null ? getGradeColor(grade.percentage) : '#9E9E9E'
                          }}
                        >
<<<<<<< HEAD
                          {grade.percentage !== null ? `${grade.percentage}%` : '-'}
=======
                          {grade.percentage !== null ? `${Math.round(grade.percentage)}%` : '-'}
>>>>>>> 99ca4a1 (Initial commit)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ({grade.letterGrade})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {grade.gradedAt ? new Date(grade.gradedAt).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={grade.status} 
                        size="small"
                        color={
                          grade.status === 'graded' ? 'success' : 
                          grade.status === 'pending' ? 'warning' : 
                          'error'
                        }
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Grade Details Dialog */}
      <Dialog
        open={gradeDialogOpen}
        onClose={() => setGradeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedGrade && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {getGradeIcon(selectedGrade.type)}
                <Box>
                  <Typography variant="h6">{selectedGrade.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedGrade.subject} • {selectedGrade.teacher}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid xs={6}>
                  <Typography variant="body2" color="text.secondary">Score</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {selectedGrade.score}/{selectedGrade.maxPoints}
                  </Typography>
                </Grid>
                <Grid xs={6}>
                  <Typography variant="body2" color="text.secondary">Grade</Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: getGradeColor(selectedGrade.percentage)
                    }}
                  >
                    {selectedGrade.percentage}% ({selectedGrade.letterGrade})
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Submitted:</strong> {selectedGrade.submittedAt ? new Date(selectedGrade.submittedAt).toLocaleString() : 'Not submitted'}
                </Typography>
                {selectedGrade.gradedAt && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Graded:</strong> {new Date(selectedGrade.gradedAt).toLocaleString()}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  <strong>Type:</strong> {selectedGrade.type.charAt(0).toUpperCase() + selectedGrade.type.slice(1)}
                </Typography>
              </Box>

              {selectedGrade.feedback && (
                <Box sx={{ mt: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Teacher Feedback:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedGrade.feedback}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            
            <DialogActions>
              <Button onClick={() => setGradeDialogOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}
