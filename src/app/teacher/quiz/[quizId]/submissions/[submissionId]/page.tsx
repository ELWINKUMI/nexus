"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button
} from "@mui/material";
import Link from "next/link";

interface SubmissionDetail {
  id: string;
  studentName: string;
  studentId: string;
  score: number;
  submittedAt: string;
  answers: Array<{
    question: string;
    studentAnswer: string | string[];
    correctAnswer: string | string[];
    isCorrect: boolean;
    points: number;
  }>;
}

export default function SubmissionDetailPage() {
  const { quizId, submissionId } = useParams();
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubmission() {
      setLoading(true);
      try {
        const res = await fetch(`/api/teacher/quizzes/${quizId}/submissions/${submissionId}`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch submission");
        const data = await res.json();
        setSubmission(data);
      } catch (err) {
        setSubmission(null);
      } finally {
        setLoading(false);
      }
    }
    fetchSubmission();
  }, [quizId, submissionId]);

  return (
    <Box sx={{ p: 3 }}>
      <Button component={Link} href={`/teacher/quiz/${quizId}/submissions`} variant="outlined" sx={{ mb: 2 }}>
        Back to Submissions
      </Button>
      {loading ? (
        <CircularProgress />
      ) : !submission ? (
        <Typography color="error">Submission not found.</Typography>
      ) : (
        <>
          <Typography variant="h5" gutterBottom>
            Submission Details
          </Typography>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography><strong>Student Name:</strong> {submission.studentName}</Typography>
            <Typography><strong>Student ID:</strong> {submission.studentId}</Typography>
            <Typography><strong>Score:</strong> {submission.score}</Typography>
            <Typography><strong>Submitted At:</strong> {new Date(submission.submittedAt).toLocaleString()}</Typography>
          </Paper>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Question</TableCell>
                  <TableCell>Student Answer</TableCell>
                  <TableCell>Correct Answer</TableCell>
                  <TableCell>Points</TableCell>
                  <TableCell>Result</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submission.answers.map((ans, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{ans.question}</TableCell>
                    <TableCell>{Array.isArray(ans.studentAnswer) ? ans.studentAnswer.join(", ") : ans.studentAnswer}</TableCell>
                    <TableCell>{Array.isArray(ans.correctAnswer) ? ans.correctAnswer.join(", ") : ans.correctAnswer}</TableCell>
                    <TableCell>{ans.points}</TableCell>
                    <TableCell>
                      {ans.isCorrect ? (
                        <Typography color="success.main">Correct</Typography>
                      ) : (
                        <Typography color="error.main">Incorrect</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
}
