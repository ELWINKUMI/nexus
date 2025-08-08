<<<<<<< HEAD
=======
// PATCH - Autosave quiz progress or submit quiz attempt
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { id: quizId } = await params;

    // Find the latest in_progress attempt for this student and quiz
    const attempt = await QuizAttempt.findOne({
      quizId,
      studentId,
      status: 'in_progress'
    }).sort({ createdAt: -1 });

    if (!attempt) {
      return NextResponse.json({ error: 'No active attempt found' }, { status: 404 });
    }

    // Parse answers and other fields from request body
    const body = await request.json();
    const { answers, flaggedQuestions, currentQuestion, autosave, endTime } = body;

    // If autosave, just update progress fields
    if (autosave) {
      if (answers) attempt.answers = answers;
      if (flaggedQuestions) attempt.flaggedQuestions = flaggedQuestions;
      if (typeof currentQuestion === 'number') attempt.currentQuestion = currentQuestion;
      await attempt.save();
      return NextResponse.json({ success: true });
    }

    // Otherwise, treat as submission
    // Fetch the quiz to get correct answers and points
    const quiz = await Quiz.findOne({ _id: quizId });
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Grade the quiz
    let totalScore = 0;
    let totalPossible = 0;
    const gradedAnswers = [];
    for (const q of quiz.questions) {
      totalPossible += q.points || 1;
      const studentAnsObj = answers.find((a: any) => a.questionId === q.id);
      let studentAnswer = studentAnsObj ? studentAnsObj.selectedAnswers : [];
      if (!Array.isArray(studentAnswer)) studentAnswer = [studentAnswer];
      let isCorrect = false;
      // Compare answers based on type
      if (q.type === 'multiple_choice' || q.type === 'multiple_select') {
        // Compare as sets of strings
        const correct = (q.correctAnswers || []).map(String).sort();
        const student = (studentAnswer || []).map(String).sort();
        isCorrect = JSON.stringify(correct) === JSON.stringify(student);
      } else if (q.type === 'true_false' || q.type === 'short_answer' || q.type === 'fill_blank') {
        isCorrect = (q.correctAnswers && q.correctAnswers[0] && studentAnswer[0]) && (String(q.correctAnswers[0]).trim().toLowerCase() === String(studentAnswer[0]).trim().toLowerCase());
      } else {
        // For other types, skip grading or add custom logic
        isCorrect = false;
      }
      if (isCorrect) totalScore += q.points || 1;
      gradedAnswers.push({
        questionId: q.id,
        studentAnswer,
        correctAnswer: q.correctAnswers,
        isCorrect,
        points: q.points || 1
      });
    }
    const percentage = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;

    // Save answers and mark as completed
    attempt.answers = gradedAnswers;
    attempt.totalPoints = totalScore;
    attempt.percentage = percentage;
    if (endTime) attempt.endTime = new Date(endTime);
    attempt.status = 'completed';
    attempt.submittedAt = new Date();
    await attempt.save();

        return NextResponse.json({ message: 'Quiz submitted successfully', score: totalScore }, { status: 200 });
  } catch (error) {
    console.error('Error in PATCH quiz attempt:', error);
    return NextResponse.json(
      { error: 'Failed to process quiz attempt' },
      { status: 500 }
    );
  }
}
>>>>>>> 99ca4a1 (Initial commit)
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { User, Quiz, QuizAttempt } from '@/models';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// GET specific quiz for student
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { id: quizId } = await params;

    console.log('GET Quiz - Student ID:', studentId, 'Quiz ID:', quizId);

    // Get student to verify access
    const student = await User.findOne({ 
      id: studentId, 
      role: 'student' 
    });
    
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Try to get real quiz from teacher API first
    let quiz = null;
    let isTeacherQuiz = false;
    
    try {
      // Fetch from teacher quizzes API
      const teacherResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/teacher/quiz`, {
        headers: {
          'Cookie': `auth-token=${token.value}`
        }
      });
      
      if (teacherResponse.ok) {
        const allTeacherQuizzes = await teacherResponse.json();
        // Find the specific quiz for this student's class and published status
        const teacherQuiz = allTeacherQuizzes.find((q: any) => 
          q.id === quizId &&
          (q.classId === student.classId || q.schoolId === student.schoolId) &&
          q.status === 'published'
        );
        
        if (teacherQuiz) {
          quiz = teacherQuiz;
          isTeacherQuiz = true;
          console.log('Found quiz in teacher API:', quizId);
        }
      }
    } catch (error) {
      console.log('Could not fetch from teacher API, falling back to database:', error);
    }

    // Fallback to database quiz
    if (!quiz) {
      const dbQuiz = await Quiz.findOne({
        _id: quizId,
        classId: student.classId,
        schoolId: student.schoolId,
        status: 'published'
      });
      
      if (dbQuiz) {
        quiz = dbQuiz;
        console.log('Found quiz in database:', quizId);
      }
    }

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found or not accessible' }, { status: 404 });
    }

    // Check if quiz is available (time restrictions)
    const now = new Date();
    const startDate = isTeacherQuiz ? quiz.startDate : quiz.startDate;
    const endDate = isTeacherQuiz ? quiz.dueDate : quiz.endDate;
    
    if (startDate && now < new Date(startDate)) {
      return NextResponse.json({ 
        error: 'Quiz not yet available',
        availableAt: startDate 
      }, { status: 403 });
    }

    if (endDate && now > new Date(endDate)) {
      return NextResponse.json({ 
        error: 'Quiz deadline has passed',
        deadlineWas: endDate 
      }, { status: 403 });
    }

    // Get student's attempts for this quiz
    const attempts = await QuizAttempt.find({
      quizId: isTeacherQuiz ? quizId : quiz._id.toString(),
      studentId,
      schoolId: student.schoolId
    }).sort({ createdAt: -1 });

    // Check attempt limits
    const completedAttempts = attempts.filter(a => 
      a.status === 'completed' || a.status === 'submitted'
    );

    const attemptsAllowed = isTeacherQuiz ? (quiz.maxAttempts || quiz.attemptsAllowed || 0) : quiz.attemptsAllowed;
    if (attemptsAllowed > 0 && completedAttempts.length >= attemptsAllowed) {
      return NextResponse.json({ 
        error: 'Maximum attempts reached',
        attempts: completedAttempts.length,
        maxAttempts: attemptsAllowed
      }, { status: 403 });
    }

    // Check for active attempt
    const activeAttempt = attempts.find(a => a.status === 'in_progress');

    // Prepare quiz data for student (without correct answers)
    const questions = isTeacherQuiz ? quiz.questions : quiz.questions;
<<<<<<< HEAD
    const questionsForStudent = questions.map((q: any) => ({
      id: q.id,
      type: q.type,
=======
    // Map backend types to frontend expected types
    const typeMap: Record<string, string> = {
      'multiple_choice': 'multiple-choice',
      'multiple_select': 'multiple-select',
      'true_false': 'true-false',
    };
    const questionsForStudent = questions.map((q: any) => ({
      id: q.id,
      type: typeMap[q.type] || q.type,
>>>>>>> 99ca4a1 (Initial commit)
      question: q.question,
      options: q.options,
      points: q.points,
      required: q.required
    }));

    console.log('Quiz questions for student:', questionsForStudent);
    console.log('First question options:', questionsForStudent[0]?.options);

<<<<<<< HEAD
=======
    // Calculate timeRemaining based on scheduled start time
    const scheduledStart = quiz.startDate ? new Date(quiz.startDate) : null;
    const nowTime = new Date();
    let timeRemaining = (quiz.timeLimit || 30) * 60; // default in seconds
    if (scheduledStart) {
      const elapsed = Math.floor((nowTime.getTime() - scheduledStart.getTime()) / 1000);
      timeRemaining = Math.max(0, ((quiz.timeLimit || 30) * 60) - elapsed);
    }

>>>>>>> 99ca4a1 (Initial commit)
    const quizData = {
      id: isTeacherQuiz ? quiz.id : quiz._id.toString(),
      title: quiz.title,
      description: quiz.description,
      instructions: quiz.instructions,
      timeLimit: quiz.timeLimit,
      totalQuestions: questions.length,
      totalPoints: isTeacherQuiz ? quiz.totalPoints : quiz.totalPoints,
      attemptsAllowed: isTeacherQuiz ? (quiz.maxAttempts || quiz.attemptsAllowed || 0) : quiz.attemptsAllowed,
      attemptsUsed: completedAttempts.length,
      passwordProtected: quiz.passwordProtected,
      randomizeQuestions: quiz.randomizeQuestions,
      randomizeAnswers: quiz.randomizeAnswers,
      oneQuestionAtTime: quiz.oneQuestionAtTime,
      showCorrectAnswers: quiz.showCorrectAnswers,
      showScoreImmediately: quiz.showScoreImmediately,
      questions: questionsForStudent,
<<<<<<< HEAD
      activeAttempt: activeAttempt ? {
        id: activeAttempt._id.toString(),
        startTime: activeAttempt.startTime,
        timeRemaining: activeAttempt.timeRemaining,
=======
      scheduledStart: scheduledStart ? scheduledStart.toISOString() : null,
      activeAttempt: activeAttempt ? {
        id: activeAttempt._id.toString(),
        startTime: activeAttempt.startTime,
        timeRemaining,
>>>>>>> 99ca4a1 (Initial commit)
        answers: activeAttempt.answers,
        flaggedQuestions: activeAttempt.flaggedQuestions
      } : null
    };

    return NextResponse.json(quizData);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    );
  }
}

// POST - Start a new quiz attempt
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
<<<<<<< HEAD
    
=======
>>>>>>> 99ca4a1 (Initial commit)
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    const studentId = decoded.id;
    const { id: quizId } = await params;
<<<<<<< HEAD
    const body = await request.json();
=======

    // No request body expected for starting quiz attempt
    // console.log('[BACKEND POST BODY]', requestBody);
>>>>>>> 99ca4a1 (Initial commit)

    console.log('START Quiz Attempt - Student ID:', studentId, 'Quiz ID:', quizId);

    // Get student
    const student = await User.findOne({ 
      id: studentId, 
      role: 'student' 
    });
<<<<<<< HEAD
    
=======
>>>>>>> 99ca4a1 (Initial commit)
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Try to get real quiz from teacher API first
    let quiz = null;
    let isTeacherQuiz = false;
<<<<<<< HEAD
    
=======
>>>>>>> 99ca4a1 (Initial commit)
    try {
      // Fetch from teacher quizzes API
      const teacherResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/teacher/quiz`, {
        headers: {
          'Cookie': `auth-token=${token.value}`
        }
      });
<<<<<<< HEAD
      
=======
>>>>>>> 99ca4a1 (Initial commit)
      if (teacherResponse.ok) {
        const allTeacherQuizzes = await teacherResponse.json();
        // Find the specific quiz for this student's class and published status
        const teacherQuiz = allTeacherQuizzes.find((q: any) => 
          q.id === quizId &&
          (q.classId === student.classId || q.schoolId === student.schoolId) &&
          q.status === 'published'
        );
<<<<<<< HEAD
        
=======
>>>>>>> 99ca4a1 (Initial commit)
        if (teacherQuiz) {
          quiz = teacherQuiz;
          isTeacherQuiz = true;
        }
      }
    } catch (error) {
      console.log('Could not fetch from teacher API, falling back to database:', error);
    }

    // Fallback to database quiz
    if (!quiz) {
      const dbQuiz = await Quiz.findOne({
        _id: quizId,
        classId: student.classId,
        schoolId: student.schoolId,
        status: 'published'
      });
<<<<<<< HEAD
      
=======
>>>>>>> 99ca4a1 (Initial commit)
      if (dbQuiz) {
        quiz = dbQuiz;
      }
    }

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

<<<<<<< HEAD
    // Verify password if required
    if (quiz.passwordProtected && body.password !== quiz.password) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
=======
    // Password protection removed: no password check
>>>>>>> 99ca4a1 (Initial commit)

    // Check for existing active attempt
    const activeAttempt = await QuizAttempt.findOne({
      quizId,
      studentId,
      status: 'in_progress'
    });

    if (activeAttempt) {
      return NextResponse.json({ 
        error: 'Quiz already in progress',
        attemptId: activeAttempt._id.toString()
      }, { status: 409 });
    }

    // Create new attempt
    const totalPoints = isTeacherQuiz ? quiz.totalPoints : quiz.totalPoints;
    const timeLimit = quiz.timeLimit;
<<<<<<< HEAD
    
=======
    // Use scheduled start time for timer
    const scheduledStart = quiz.startDate ? new Date(quiz.startDate) : new Date();
    const nowTime = new Date();
    let timeRemaining = (quiz.timeLimit || 30) * 60;
    if (scheduledStart) {
      const elapsed = Math.floor((nowTime.getTime() - scheduledStart.getTime()) / 1000);
      timeRemaining = Math.max(0, ((quiz.timeLimit || 30) * 60) - elapsed);
    }
>>>>>>> 99ca4a1 (Initial commit)
    const newAttempt = new QuizAttempt({
      quizId,
      studentId,
      studentName: student.name,
      classId: student.classId,
      schoolId: student.schoolId,
<<<<<<< HEAD
      startTime: new Date(),
      totalPoints: totalPoints,
      timeRemaining: timeLimit * 60, // Convert to seconds
=======
      startTime: scheduledStart,
      totalPoints: totalPoints,
>>>>>>> 99ca4a1 (Initial commit)
      answers: [],
      flaggedQuestions: [],
      status: 'in_progress'
    });

    await newAttempt.save();

    console.log('Created new quiz attempt:', newAttempt._id);

    return NextResponse.json({
      attemptId: newAttempt._id.toString(),
      startTime: newAttempt.startTime,
<<<<<<< HEAD
      timeRemaining: newAttempt.timeRemaining
=======
      timeRemaining
>>>>>>> 99ca4a1 (Initial commit)
    });
  } catch (error) {
    console.error('Error starting quiz attempt:', error);
    return NextResponse.json(
      { error: 'Failed to start quiz attempt' },
      { status: 500 }
    );
  }
}
