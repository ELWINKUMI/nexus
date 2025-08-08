"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, CircularProgress } from "@mui/material";
// CalendarView removed

// Placeholder for fetching all activities (quizzes, assignments, announcements)
async function fetchSchedule() {
  const [quizzes, assignments, announcements] = await Promise.all([
    fetch("/api/student/quizzes", { credentials: "include" }).then(r => r.ok ? r.json() : []),
    fetch("/api/student/assignments", { credentials: "include" }).then(r => r.ok ? r.json() : []),
    fetch("/api/student/announcements", { credentials: "include" }).then(r => r.ok ? r.json() : [])
  ]);
  return { quizzes, assignments, announcements };
}

export default function StudentSchedulePage() {
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<any>({ quizzes: [], assignments: [], announcements: [] });

  useEffect(() => {
    fetchSchedule().then(data => {
      setSchedule(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  // Calendar view removed. You can add a different schedule view here if needed.
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6">No calendar view available.</Typography>
    </Box>
  );
}
