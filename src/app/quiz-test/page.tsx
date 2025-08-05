import React from 'react';
import { 
  Box, 
  Typography, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Paper,
  Button
} from '@mui/material';

export default function QuizTestPage() {
  // Sample true_false question with empty options (like the problematic quiz)
  const currentQuestion = {
    id: "1754245000550",
    type: "true_false",
    question: "5/5 = 5",
    options: ["", "", "", ""], // Empty options like in the broken quiz
    points: 1,
    index: 2
  };

  const handleAnswerChange = (questionId: string, answerIndex: number) => {
    console.log('Answer changed:', questionId, answerIndex);
  };

  const userAnswers: number[] = [];

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
        Quiz Options Test Page
      </Typography>
      
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
          Testing True/False Question Rendering
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>Question:</strong> {currentQuestion.question}
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Question Type: {currentQuestion.type}
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Original Options from DB: {JSON.stringify(currentQuestion.options)}
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 'bold' }}>
            Answer Options:
          </Typography>
          
          {currentQuestion.type === 'true_false' ? (
            <RadioGroup
              value={userAnswers[0] ?? ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, parseInt(e.target.value))}
            >
              {['True', 'False'].map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={index}
                  control={<Radio />}
                  label={
                    <Typography variant="body1" sx={{ py: 1 }}>
                      {option}
                    </Typography>
                  }
                  sx={{
                    p: 2,
                    m: 1,
                    border: '1px solid',
                    borderColor: userAnswers.includes(index) ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    bgcolor: userAnswers.includes(index) ? 'primary.50' : 'transparent',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                />
              ))}
            </RadioGroup>
          ) : (
            <Typography color="error">
              This would show multiple choice options with fallback: 
              {(currentQuestion.options && currentQuestion.options.length > 0 ? currentQuestion.options : ['Option A', 'Option B', 'Option C', 'Option D']).join(', ')}
            </Typography>
          )}
        </Box>
      </Paper>

      <Paper sx={{ p: 4, bgcolor: 'success.light' }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'success.dark' }}>
          ✅ Fix Status
        </Typography>
        <Typography variant="body1">
          The quiz-taking page has been updated to handle true/false questions correctly by using hardcoded ['True', 'False'] options instead of relying on the potentially empty options from the database.
        </Typography>
      </Paper>
    </Box>
  );
}
