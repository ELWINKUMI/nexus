"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Box, Typography, Button } from "@mui/material";
import Link from "next/link";

export default function TeacherQuizPage() {
  const { quizId } = useParams();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Quiz Management
      </Typography>
      {/* ...other quiz management UI... */}
      <Button
        component={Link}
        href="/teacher/quiz"
        variant="outlined"
        sx={{ mb: 2 }}
      >
        Back to Quiz List
      </Button>
      <Button
        component={Link}
        href={`/teacher/quiz/${quizId}/submissions`}
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
      >
        View Submissions
      </Button>
    </Box>
  );
}
