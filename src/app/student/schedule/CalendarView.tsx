"use client";

import React, { useMemo, useState } from "react";
import { Box, Typography, Paper, Chip, Button, Badge, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, IconButton } from "@mui/material";
import { CalendarMonth as CalendarIcon, Event as EventIcon, Close as CloseIcon } from "@mui/icons-material";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from "date-fns";
import { useRouter } from "next/navigation";



interface Activity {
  type: string;
  title: string;
  date: string;
  id: string;
}

interface CalendarViewProps {
  activities: Activity[];
}

export default function CalendarView({ activities }: CalendarViewProps) {
// (removed duplicate function body)

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const router = useRouter();

  // Group activities by date string (YYYY-MM-DD)
// CalendarView component and related code removed as requested.
      const key = format(new Date(a.date), "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(a);
    });
    return map;
  }, [activities]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
// CalendarView component and all related code removed as requested.

