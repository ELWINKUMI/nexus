import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { User, Quiz, QuizAttempt } from '@/models';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// GET attempt details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    await dbConnect();
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    const studentId = decoded.id;
    const { attemptId } = await params;

    // Get attempt and verify ownership
    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      studentId
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Quiz attempt not found' }, { status: 404 });
    }

    return NextResponse.json(attempt);
  } catch (error) {
    console.error('Error fetching quiz attempt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz attempt' },
      { status: 500 }
    );
  }
}

// PUT - Update attempt (save answers, flag questions)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    await dbConnect();
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    const studentId = decoded.id;
    const { attemptId } = await params;
    const body = await request.json();

    // Get attempt and verify ownership
    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      studentId,
      status: 'in_progress'
    });

    if (!attempt) {
      return NextResponse.json({ 
        error: 'Quiz attempt not found or not in progress' 
      }, { status: 404 });
    }

    // Update attempt based on action
    const updates: any = {};

    if (body.action === 'save_answer') {
      // Save answer for a specific question
      const { questionId, selectedAnswers } = body;
      
      const existingAnswerIndex = attempt.answers.findIndex(
        a => a.questionId === questionId
      );

      if (existingAnswerIndex >= 0) {
        attempt.answers[existingAnswerIndex].selectedAnswers = selectedAnswers;
      } else {
        attempt.answers.push({
          questionId,
          selectedAnswers,
          timeSpent: 0
        });
      }

      updates.answers = attempt.answers;
    }

    if (body.action === 'flag_question') {
      // Toggle question flag
      const { questionId } = body;
      const flaggedSet = new Set(attempt.flaggedQuestions);
      
      if (flaggedSet.has(questionId)) {
        flaggedSet.delete(questionId);
      } else {
        flaggedSet.add(questionId);
      }

      updates.flaggedQuestions = Array.from(flaggedSet);
    }

    if (body.action === 'update_time') {
      // Update remaining time
      updates.timeRemaining = body.timeRemaining;
    }

    await QuizAttempt.findByIdAndUpdate(attemptId, updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating quiz attempt:', error);
    return NextResponse.json(
      { error: 'Failed to update quiz attempt' },
      { status: 500 }
    );
  }
}

// POST - Submit quiz attempt
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    await dbConnect();
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    const studentId = decoded.id;
    const { attemptId } = await params;

    // Get attempt and verify ownership
    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      studentId,
      status: 'in_progress'
    });

    if (!attempt) {
      return NextResponse.json({ 
        error: 'Quiz attempt not found or already submitted' 
      }, { status: 404 });
    }

    // Get the quiz to calculate score
    const quiz = await Quiz.findById(attempt.quizId);
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Calculate score
    let totalScore = 0;
    const results = [];

    for (const question of quiz.questions) {
      const studentAnswer = attempt.answers.find(a => a.questionId === question.id);
      let questionScore = 0;
      let isCorrect = false;

      if (studentAnswer) {
        // Compare answers based on question type
        if (question.type === 'multiple_choice' || question.type === 'true_false') {
          // Single correct answer
          const correctAnswer = question.correctAnswers[0];
          const studentSelection = studentAnswer.selectedAnswers[0];
          
          if (studentSelection === correctAnswer) {
            questionScore = question.points;
            isCorrect = true;
          }
        } else if (question.type === 'multiple_select') {
          // Multiple correct answers - all must match
          const correctAnswers = [...question.correctAnswers].sort();
          const studentAnswers = [...studentAnswer.selectedAnswers].sort();
          
          if (JSON.stringify(correctAnswers) === JSON.stringify(studentAnswers)) {
            questionScore = question.points;
            isCorrect = true;
          }
        }
        // Add more question types as needed
      }

      totalScore += questionScore;
      results.push({
        questionId: question.id,
        correct: isCorrect,
        score: questionScore,
        maxScore: question.points
      });
    }

    const percentage = (totalScore / quiz.totalPoints) * 100;

    // Update attempt with final results
    await QuizAttempt.findByIdAndUpdate(attemptId, {
      endTime: new Date(),
      submittedAt: new Date(),
      score: totalScore,
      percentage: Math.round(percentage * 100) / 100,
      status: 'submitted'
    });

    console.log(`Quiz submitted - Score: ${totalScore}/${quiz.totalPoints} (${percentage}%)`);

    // Return results (with or without correct answers based on quiz settings)
    const response: any = {
      score: totalScore,
      totalPoints: quiz.totalPoints,
      percentage: Math.round(percentage * 100) / 100,
      submittedAt: new Date()
    };

    if (quiz.showCorrectAnswers) {
      response.results = results;
      response.questions = quiz.questions.map(q => ({
        id: q.id,
        question: q.question,
        correctAnswers: q.correctAnswers,
        feedback: q.feedback
      }));
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    return NextResponse.json(
      { error: 'Failed to submit quiz attempt' },
      { status: 500 }
    );
  }
}
