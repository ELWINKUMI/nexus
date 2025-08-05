import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { User, Quiz, QuizAttempt, Subject, Class } from '@/models';

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
    const studentId = decoded.id;

    console.log('GET Student Quizzes - Student ID from token:', studentId);

    // Get student to find classId and schoolId
    const student = await User.findOne({ 
      id: studentId, 
      role: 'student' 
    });
    
    if (!student) {
      console.log('GET Student Quizzes - Student not found for ID:', studentId);
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Try to get real quizzes from teacher APIs first
    let teacherQuizzes = [];
    try {
      // Fetch from teacher quizzes API
      const teacherResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/teacher/quiz`, {
        headers: {
          'Cookie': `auth-token=${token.value}`
        }
      });
      
      if (teacherResponse.ok) {
        const allTeacherQuizzes = await teacherResponse.json();
        // Filter quizzes for this student's class and published status
        teacherQuizzes = allTeacherQuizzes.filter((quiz: any) => 
          (quiz.classId === student.classId || quiz.schoolId === student.schoolId) &&
          quiz.status === 'published'
        );
      }
    } catch (error) {
      console.log('Could not fetch from teacher API, falling back to database:', error);
    }

    // If we have real teacher quizzes, use them
    if (teacherQuizzes.length > 0) {
      // Get quiz attempts for this student
      const attempts = await QuizAttempt.find({
        studentId,
        schoolId: student.schoolId
      });

      const attemptMap = attempts.reduce((acc: Record<string, any[]>, attempt: any) => {
        if (!acc[attempt.quizId]) {
          acc[attempt.quizId] = [];
        }
        acc[attempt.quizId].push(attempt);
        return acc;
      }, {} as Record<string, any[]>);

      const transformedQuizzes = teacherQuizzes.map((quiz: any) => {
        const quizAttempts = attemptMap[quiz.id] || [];
        
        // Calculate quiz status
        let status = 'available';
        const now = new Date();
        
        if (quiz.startDate && now < new Date(quiz.startDate)) {
          status = 'upcoming';
        } else if (quiz.dueDate && now > new Date(quiz.dueDate)) {
          status = 'overdue';
        } else if (quizAttempts.length > 0) {
          const completedAttempts = quizAttempts.filter((a: any) => a.status === 'completed' || a.status === 'submitted');
          if (completedAttempts.length >= (quiz.maxAttempts || quiz.attemptsAllowed) && (quiz.maxAttempts || quiz.attemptsAllowed) > 0) {
            status = 'completed';
          }
        }

        // Get best/latest attempt
        const latestAttempt = quizAttempts
          .filter((a: any) => a.status === 'completed' || a.status === 'submitted')
          .sort((a: any, b: any) => new Date(b.submittedAt || b.endTime || b.createdAt).getTime() - 
                        new Date(a.submittedAt || a.endTime || a.createdAt).getTime())[0];

        return {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description || '',
          subject: quiz.subject || 'Unknown Subject',
          subjectColor: quiz.subjectColor || '#1976d2',
          teacher: quiz.teacher || `Teacher ${quiz.teacherId?.slice(-4) || 'Unknown'}`,
          teacherId: quiz.teacherId,
          dueDate: quiz.dueDate,
          timeLimit: quiz.timeLimit,
          totalQuestions: quiz.totalQuestions || quiz.questions?.length || 0,
          totalPoints: quiz.totalPoints,
          attempts: quizAttempts.length,
          maxAttempts: quiz.maxAttempts || quiz.attemptsAllowed,
          status,
          score: latestAttempt?.score,
          percentage: latestAttempt?.percentage,
          difficulty: (quiz.totalQuestions || 0) <= 10 ? 'easy' : (quiz.totalQuestions || 0) <= 20 ? 'medium' : 'hard',
          tags: quiz.tags || [],
          lastAttempt: latestAttempt?.submittedAt || latestAttempt?.endTime,
          instructions: quiz.instructions,
          passwordProtected: quiz.passwordProtected,
          showCorrectAnswers: quiz.showCorrectAnswers,
          oneQuestionAtTime: quiz.oneQuestionAtTime,
          createdAt: quiz.createdAt,
          isActive: quiz.status === 'published'
        };
      });

      return NextResponse.json(transformedQuizzes);
    }

    // Fallback to database quizzes
    // Get subjects and classes for the student's school
    const [subjects, classes] = await Promise.all([
      Subject.find({ schoolId: student.schoolId }),
      Class.find({ schoolId: student.schoolId })
    ]);

    // Fetch published quizzes for the student's class
    const quizzes = await Quiz.find({ 
      classId: student.classId,
      schoolId: student.schoolId,
      status: 'published'
    }).sort({ createdAt: -1 });

    // Get quiz attempts for this student
    const attempts = await QuizAttempt.find({
      studentId,
      schoolId: student.schoolId
    });

    console.log('GET Student Quizzes - Found database quizzes:', quizzes.length);

    // If no database quizzes either, return empty array (no mockup for quizzes since we found 1 real quiz)
    if (quizzes.length === 0) {
      return NextResponse.json([]);
    }

    // Create lookup maps
    const subjectMap = subjects.reduce((acc: Record<string, any>, subject: any) => {
      acc[subject._id.toString()] = subject;
      return acc;
    }, {} as Record<string, any>);

    const classMap = classes.reduce((acc: Record<string, any>, cls: any) => {
      acc[cls._id.toString()] = cls;
      return acc;
    }, {} as Record<string, any>);

    const attemptMap = attempts.reduce((acc: Record<string, any[]>, attempt: any) => {
      if (!acc[attempt.quizId]) {
        acc[attempt.quizId] = [];
      }
      acc[attempt.quizId].push(attempt);
      return acc;
    }, {} as Record<string, any[]>);

    // Transform quizzes for student view
    const transformedQuizzes = quizzes.map((quiz: any) => {
      const subject = subjectMap[quiz.subjectId];
      const cls = classMap[quiz.classId];
      const quizAttempts = attemptMap[quiz._id.toString()] || [];
      
      // Calculate quiz status
      let status = 'available';
      const now = new Date();
      
      if (quiz.startDate && now < quiz.startDate) {
        status = 'upcoming';
      } else if (quiz.endDate && now > quiz.endDate) {
        status = 'overdue';
      } else if (quizAttempts.length > 0) {
        const completedAttempts = quizAttempts.filter((a: any) => a.status === 'completed' || a.status === 'submitted');
        if (completedAttempts.length >= quiz.attemptsAllowed && quiz.attemptsAllowed > 0) {
          status = 'completed';
        }
      }

      // Get best/latest attempt
      const latestAttempt = quizAttempts
        .filter((a: any) => a.status === 'completed' || a.status === 'submitted')
        .sort((a: any, b: any) => new Date(b.submittedAt || b.endTime || b.createdAt).getTime() - 
                      new Date(a.submittedAt || a.endTime || a.createdAt).getTime())[0];

      // Get teacher name for display
      const teacherName = quiz.teacherId ? `Teacher ${quiz.teacherId.slice(-4)}` : 'Unknown Teacher';

      return {
        id: quiz._id.toString(),
        title: quiz.title,
        description: quiz.description || '',
        subject: subject?.name || 'Unknown Subject',
        subjectColor: subject?.color || '#1976d2',
        teacher: teacherName,
        teacherId: quiz.teacherId,
        dueDate: quiz.endDate ? quiz.endDate.toISOString() : null,
        timeLimit: quiz.timeLimit,
        totalQuestions: quiz.questions.length,
        totalPoints: quiz.totalPoints,
        attempts: quizAttempts.length,
        maxAttempts: quiz.attemptsAllowed,
        status,
        score: latestAttempt?.score,
        percentage: latestAttempt?.percentage,
        difficulty: quiz.questions.length <= 10 ? 'easy' : quiz.questions.length <= 20 ? 'medium' : 'hard',
        tags: quiz.questions.flatMap((q: any) => q.tags || []).filter((tag: string, index: number, arr: string[]) => arr.indexOf(tag) === index),
        lastAttempt: latestAttempt?.submittedAt || latestAttempt?.endTime,
        instructions: quiz.instructions,
        passwordProtected: quiz.passwordProtected,
        showCorrectAnswers: quiz.showCorrectAnswers,
        oneQuestionAtTime: quiz.oneQuestionAtTime,
        createdAt: quiz.createdAt,
        isActive: quiz.status === 'published'
      };
    });

    return NextResponse.json(transformedQuizzes);
  } catch (error) {
    console.error('Error fetching student quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    );
  }
}
