import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
// Adjust the import path below to match the actual location and filename of your QuizAttempt model.
// For example, if your model is at src/models/QuizAttempt.ts, use the following:
import QuizAttempt from '@/models/QuizAttempt';

// GET /api/teacher/quizzes/[quizId]/attempts
export async function GET(req: NextRequest, { params }: { params: Promise<{ quizId: string }> }) {
  await dbConnect();
  const { quizId } = await params;
  try {
    const attempts = await QuizAttempt.find({ quizId }).lean();
    // Map attempts to match frontend expectations
    const mapped = attempts.map((a: any) => ({
      _id: a._id,
      studentName: a.studentName,
      studentId: a.studentId,
      totalPoints: a.totalPoints,
      submittedAt: a.submittedAt,
      status: a.status,
    }));
    return NextResponse.json(mapped);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 });
  }
}
