import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { User, Quiz, Subject, Class } from '@/models';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    const teacherId = decoded.id;

    console.log('GET Quizzes - Teacher ID from token:', teacherId);

    // Get teacher to find schoolId
    const teacher = await User.findOne({ 
      id: teacherId, 
      role: 'teacher' 
    });
    
    if (!teacher) {
      console.log('GET Quizzes - Teacher not found for ID:', teacherId);
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Get subjects and classes for the teacher
    const [subjects, classes] = await Promise.all([
      Subject.find({ schoolId: teacher.schoolId }),
      Class.find({ schoolId: teacher.schoolId })
    ]);

    // Fetch quizzes for this teacher
    const quizzes = await Quiz.find({ 
      teacherId,
      schoolId: teacher.schoolId
    }).sort({ createdAt: -1 });

    console.log('GET Quizzes - Found quizzes:', quizzes.length);

    // Create lookup maps
    const subjectMap = new Map(subjects.map(s => [s._id.toString(), s.name]));
    const classMap = new Map(classes.map(c => [c._id.toString(), c.name]));

    // Format quiz data with subject and class names
    const quizzesWithDetails = quizzes.map(quiz => ({
      _id: quiz._id.toString(),
      title: quiz.title,
      description: quiz.description,
      subjectName: subjectMap.get(quiz.subjectId) || 'Unknown Subject',
      className: classMap.get(quiz.classId) || 'Unknown Class',
      timeLimit: quiz.timeLimit,
      questionCount: quiz.questions.length,
      totalPoints: quiz.totalPoints || quiz.questions.reduce((sum, q) => sum + q.points, 0),
      status: quiz.status,
      attemptsAllowed: quiz.attemptsAllowed,
      startDate: quiz.startDate,
      endDate: quiz.endDate,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt
    }));

    return NextResponse.json(quizzesWithDetails);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    const teacherId = decoded.id;

    console.log('POST Quiz - Teacher ID from token:', teacherId);

    // Get teacher to find schoolId
    const teacher = await User.findOne({ 
      id: teacherId, 
      role: 'teacher' 
    });
    
    if (!teacher) {
      console.log('POST Quiz - Teacher not found for ID:', teacherId);
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    console.log('POST Quiz - Teacher found:', { id: teacher.id, schoolId: teacher.schoolId });

    const body = await request.json();
    const {
      title,
      description,
      instructions,
      classId,
      subjectId,
      timeLimit,
      attemptsAllowed,
      startDate,
      endDate,
      randomizeQuestions,
      randomizeAnswers,
      showCorrectAnswers,
      showScoreImmediately,
      oneQuestionAtTime,
      passwordProtected,
      password,
      questions,
      status
    } = body;

    console.log('Request body:', {
      title,
      classId,
      subjectId,
      questionsCount: questions?.length || 0,
      questions: questions, // Log the full questions array
      status
    });

    // Validation
    if (!title || !classId || !subjectId || !timeLimit) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, class, subject, and timeLimit are required' 
      }, { status: 400 });
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json({ 
        error: 'At least one question is required' 
      }, { status: 400 });
    }

    // Verify subject and class belong to the teacher's school
    const [subjectDoc, classDoc] = await Promise.all([
      Subject.findOne({ _id: subjectId, schoolId: teacher.schoolId }),
      Class.findOne({ _id: classId, schoolId: teacher.schoolId })
    ]);

    if (!subjectDoc) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 400 });
    }

    if (!classDoc) {
      return NextResponse.json({ error: 'Class not found' }, { status: 400 });
    }

    // Calculate total points
    const totalPoints = questions.reduce((sum: number, q: any) => sum + (q.points || 1), 0);

    // Create new quiz
    const quiz = new Quiz({
      title,
      description,
      instructions,
      teacherId,
      classId,
      subjectId,
      schoolId: teacher.schoolId,
      timeLimit,
      attemptsAllowed: attemptsAllowed || 1,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      randomizeQuestions: randomizeQuestions || false,
      randomizeAnswers: randomizeAnswers || false,
      showCorrectAnswers: showCorrectAnswers !== false,
      showScoreImmediately: showScoreImmediately !== false,
      oneQuestionAtTime: oneQuestionAtTime || false,
      passwordProtected: passwordProtected || false,
      password: passwordProtected ? password : undefined,
      questions: questions.map((q: any, index: number) => ({
        id: q.id || Date.now().toString() + index,
        type: q.type,
        question: q.question,
        options: q.options || [],
        correctAnswers: q.correctAnswers || [],
        points: q.points || 1,
        feedback: q.feedback,
        tags: q.tags || [],
        required: q.required !== false
      })),
      status: status || 'draft',
      totalPoints
    });

    console.log('POST Quiz - Creating quiz with data:', {
      title,
      teacherId,
      subjectId,
      classId,
      schoolId: teacher.schoolId,
      questionsCount: quiz.questions.length,
      totalPoints
    });

    const savedQuiz = await quiz.save();
    console.log('POST Quiz - Saved quiz:', {
      id: savedQuiz._id,
      title: savedQuiz.title,
      status: savedQuiz.status
    });

    return NextResponse.json({ 
      message: 'Quiz created successfully',
      quizId: savedQuiz._id,
      status: savedQuiz.status
    });
  } catch (error: any) {
    console.error('Error creating quiz:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationErrors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
