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
    const questionsForStudent = questions.map((q: any) => ({
      id: q.id,
      type: q.type,
      question: q.question,
      options: q.options,
      points: q.points,
      required: q.required
    }));

    console.log('Quiz questions for student:', questionsForStudent);
    console.log('First question options:', questionsForStudent[0]?.options);

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
      activeAttempt: activeAttempt ? {
        id: activeAttempt._id.toString(),
        startTime: activeAttempt.startTime,
        timeRemaining: activeAttempt.timeRemaining,
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
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    const studentId = decoded.id;
    const { id: quizId } = await params;
    const body = await request.json();

    console.log('START Quiz Attempt - Student ID:', studentId, 'Quiz ID:', quizId);

    // Get student
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
      }
    }

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Verify password if required
    if (quiz.passwordProtected && body.password !== quiz.password) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

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
    
    const newAttempt = new QuizAttempt({
      quizId,
      studentId,
      studentName: student.name,
      classId: student.classId,
      schoolId: student.schoolId,
      startTime: new Date(),
      totalPoints: totalPoints,
      timeRemaining: timeLimit * 60, // Convert to seconds
      answers: [],
      flaggedQuestions: [],
      status: 'in_progress'
    });

    await newAttempt.save();

    console.log('Created new quiz attempt:', newAttempt._id);

    return NextResponse.json({
      attemptId: newAttempt._id.toString(),
      startTime: newAttempt.startTime,
      timeRemaining: newAttempt.timeRemaining
    });
  } catch (error) {
    console.error('Error starting quiz attempt:', error);
    return NextResponse.json(
      { error: 'Failed to start quiz attempt' },
      { status: 500 }
    );
  }
}
