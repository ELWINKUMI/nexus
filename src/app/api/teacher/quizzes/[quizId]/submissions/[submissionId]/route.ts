import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import QuizAttempt from '@/models/QuizAttempt';

// GET /api/teacher/quizzes/[quizId]/submissions/[submissionId]
export async function GET(req: NextRequest, { params }: { params: Promise<{ quizId: string; submissionId: string }> }) {
  await dbConnect();
  const { submissionId } = await params;
  if (!submissionId) {
    return NextResponse.json({ error: 'Missing submissionId' }, { status: 400 });
  }
  try {
    const attempt = await QuizAttempt.findById(submissionId).lean();
    if (!attempt) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }
    // Map to frontend structure
    const mapped = {
      id: attempt._id,
      studentName: attempt.studentName,
      studentId: attempt.studentId,
      score: attempt.totalPoints,
      submittedAt: attempt.submittedAt,
      answers: attempt.answers || [], // If answers are stored, otherwise []
    };
    return NextResponse.json(mapped);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch submission' }, { status: 500 });
  }
}
