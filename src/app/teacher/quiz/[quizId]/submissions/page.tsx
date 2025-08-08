"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  Link as MuiLink
} from "@mui/material";
import Link from "next/link";

// Update Submission interface to match QuizAttempt
interface Submission {
  _id: string;
  studentName: string;
  studentId: string;
  totalPoints: number;
  submittedAt: string;
  status: string;
}

export default function QuizAttemptsPage() {
  const { quizId } = useParams();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAttempts() {
      setLoading(true);
      try {
        const res = await fetch(`/api/teacher/quizzes/${quizId}/attempts`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch attempts");
        const data = await res.json();
        // Map MongoDB $oid/$date to plain values if needed
        const mapped = data.map((a: any) => ({
          _id: a._id?.$oid || a._id || '',
          studentName: a.studentName,
          studentId: a.studentId,
          totalPoints: a.totalPoints,
          submittedAt: a.submittedAt?.$date || a.submittedAt || '',
          status: a.status || '',
        }));
        setSubmissions(mapped);
      } catch (err) {
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAttempts();
  }, [quizId]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Quiz Attempts
      </Typography>
      <Button
        component={Link}
        href={`/teacher/quiz/${quizId}`}
        variant="outlined"
        sx={{ mb: 2 }}
      >
        Back to Quiz Management
      </Button>
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student Name</TableCell>
                <TableCell>Student ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Submitted At</TableCell>
                <TableCell>View</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No attempts yet.
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((sub) => (
                  <TableRow key={sub._id}>
                    <TableCell>{sub.studentName}</TableCell>
                    <TableCell>{sub.studentId}</TableCell>
                    <TableCell>{sub.status}</TableCell>
                    <TableCell>{sub.totalPoints}</TableCell>
                    <TableCell>{sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : ''}</TableCell>
                    <TableCell>
                      <MuiLink component={Link} href={`/teacher/quiz/${quizId}/submissions/${sub._id}`} underline="hover">
                        <Button size="small" variant="outlined">View</Button>
                      </MuiLink>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
