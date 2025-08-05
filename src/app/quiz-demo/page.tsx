'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Alert,
} from '@mui/material';
import QuizTimer from '@/components/QuizTimer';

const DEMO_QUIZ = {
  title: "Sample Mathematics Quiz",
  timeLimit: 120, // 2 minutes for demo
  questions: [
    {
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      correctAnswer: 1
    },
    {
      question: "What is 5 × 3?",
      options: ["12", "15", "18", "20"],
      correctAnswer: 1
    },
    {
      question: "What is 10 ÷ 2?",
      options: ["3", "4", "5", "6"],
      correctAnswer: 2
    }
  ]
};

export default function QuizDemo() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeUp, setTimeUp] = useState(false);

  const startQuiz = () => {
    setQuizStarted(true);
    setQuizCompleted(false);
    setTimeUp(false);
    setCurrentQuestion(0);
    setAnswers([]);
  };

  const handleTimeUp = () => {
    setTimeUp(true);
    submitQuiz();
  };

  const handleAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < DEMO_QUIZ.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitQuiz = () => {
    setQuizCompleted(true);
    setQuizStarted(false);
  };

  const calculateScore = () => {
    let correct = 0;
    DEMO_QUIZ.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: DEMO_QUIZ.questions.length,
      percentage: Math.round((correct / DEMO_QUIZ.questions.length) * 100)
    };
  };

  if (!quizStarted && !quizCompleted) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h4" gutterBottom color="primary">
              Quiz Timer Demo
            </Typography>
            <Typography variant="h6" gutterBottom>
              {DEMO_QUIZ.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              This demo showcases the NEXUS quiz timer feature with a color-changing progress bar.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • Time limit: {Math.floor(DEMO_QUIZ.timeLimit / 60)} minutes<br/>
              • Questions: {DEMO_QUIZ.questions.length}<br/>
              • Timer changes from green → orange → red as time runs out
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={startQuiz}
              sx={{ mt: 2 }}
            >
              Start Quiz Demo
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (quizCompleted) {
    const score = calculateScore();
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h4" gutterBottom color="primary">
              Quiz Completed!
            </Typography>
            {timeUp && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Time&apos;s up! Your quiz was automatically submitted.
              </Alert>
            )}
            <Typography variant="h6" gutterBottom>
              Your Score: {score.correct}/{score.total} ({score.percentage}%)
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Thank you for trying the NEXUS quiz demo!
            </Typography>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              sx={{ mt: 2 }}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const currentQ = DEMO_QUIZ.questions[currentQuestion];

  return (
    <Container maxWidth="md" sx={{ mt: 4, pb: 4 }}>
      {quizStarted && (
        <QuizTimer
          totalTime={DEMO_QUIZ.timeLimit}
          onTimeUp={handleTimeUp}
          isActive={true}
        />
      )}

      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" color="primary">
              {DEMO_QUIZ.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Question {currentQuestion + 1} of {DEMO_QUIZ.questions.length}
            </Typography>
          </Box>

          <Paper sx={{ p: 3, mb: 3, backgroundColor: 'background.default' }}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend" sx={{ mb: 2 }}>
                <Typography variant="h6">
                  {currentQ.question}
                </Typography>
              </FormLabel>
              <RadioGroup
                value={answers[currentQuestion] || ''}
                onChange={(e) => handleAnswer(currentQuestion, parseInt(e.target.value))}
              >
                {currentQ.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={index}
                    control={<Radio />}
                    label={option}
                    sx={{ mb: 1 }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Paper>

          <Grid container spacing={2} justifyContent="space-between">
            <Grid item>
              <Button
                variant="outlined"
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
            </Grid>
            <Grid item>
              <Box display="flex" gap={2}>
                {currentQuestion < DEMO_QUIZ.questions.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={nextQuestion}
                    disabled={answers[currentQuestion] === undefined}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={submitQuiz}
                    disabled={answers.length !== DEMO_QUIZ.questions.length}
                  >
                    Submit Quiz
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Question Progress */}
          <Box mt={3}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Progress:
            </Typography>
            <Box display="flex" gap={1} mt={1}>
              {DEMO_QUIZ.questions.map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: 
                      answers[index] !== undefined 
                        ? 'success.main' 
                        : index === currentQuestion 
                          ? 'primary.main' 
                          : 'grey.300',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.75rem',
                  }}
                >
                  {index + 1}
                </Box>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
