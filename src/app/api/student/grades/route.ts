import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { User, Assignment, Quiz, QuizAttempt, Subject, Class } from '@/models';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const co<<<<<<< HEAD
    const cookieStore = await cookies();
=======
    const cookieStore = cookies();
>>>>>>> 99ca4a1 (Initial commit)
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    const studentId = decoded.id;

    console.log('GET Student Grades - Student ID from token:', studentId);

    // Get student to find classId and schoolId
    const student = await User.findOne({ 
      id: studentId, 
      role: 'student' 
    });
    
    if (!student) {
      console.log('GET Student Grades - Student not found for ID:', studentId);
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get assignments, quizzes and attempts directly from database instead of teacher APIs
    const [assignments, quizzes, quizAttempts, subjects, classes, teachers] = await Promise.all([
      Assignment.find({ 
        $or: [
          { classId: student.classId },
          { schoolId: student.schoolId }
        ]
      }),
      Quiz.find({ 
        $or: [
          { classId: student.classId },
          { schoolId: student.schoolId }
        ]
      }),
      QuizAttempt.find({
        studentId,
        schoolId: student.schoolId,
        status: { $in: ['completed', 'submitted'] }
      }),
      Subject.find({ schoolId: student.schoolId }),
      Class.find({ schoolId: student.schoolId }),
      User.find({ schoolId: student.schoolId, role: 'teacher' })
    ]);

    console.log('GET Student Grades - Found assignments:', assignments.length);
    console.log('GET Student Grades - Found quizzes:', quizzes.length);
    console.log('GET Student Grades - Found quiz attempts:', quizAttempts.length);

    if (assignments.length > 0) {
      console.log('GET Student Grades - Sample assignment:', {
        id: assignments[0]._id,
        title: assignments[0].title,
        totalMarks: assignments[0].totalMarks,
        teacherId: assignments[0].teacherId,
        hasSubmissions: assignments[0].submissions?.length || 0
<<<<<<< HEAD
      });
=======
      })
>>>>>>> 99ca4a1 (Initial commit)
    }

    // Create lookup maps
    const subjectMap = subjects.reduce((acc: Record<string, any>, subject: any) => {
      acc[subject._id.toString()] = subject;
      return acc;
    }, {});

    const classMap = classes.reduce((acc: Record<string, any>, classItem: any) => {
      acc[classItem._id.toString()] = classItem;
      return acc;
    }, {});

    const teacherMap = teachers.reduce((acc: Record<string, any>, teacher: any) => {
      acc[teacher.id] = teacher;
      return acc;
    }, {});

    const attemptMap = quizAttempts.reduce((acc: Record<string, any>, attempt: any) => {
      acc[attempt.quizId] = attempt;
      return acc;
    }, {});

    // Transform assignments to grades (including ungraded ones)
    const assignmentGrades = assignments
      .map((assignment: any) => {
        const submission = assignment.submissions?.find((sub: any) => sub.studentId === studentId);
        const subject = subjectMap[assignment.subjectId?.toString()];
        const classInfo = classMap[assignment.classId?.toString()];
        const teacher = teacherMap[assignment.teacherId];
        
        if (!submission) {
          // No submission - show as missing work
          return {
            id: `assignment_${assignment._id}_missing`,
            title: assignment.title,
            type: 'assignment',
            subject: subject?.name || 'Unknown Subject',
            subjectColor: subject?.color || '#2196F3',
            teacher: teacher?.name || `Teacher ${assignment.teacherId?.slice(-4) || 'Unknown'}`,
            score: null,
            maxPoints: assignment.totalMarks || assignment.maxPoints || 100,
            percentage: 0,
            letterGrade: 'Missing',
            submittedAt: null,
            gradedAt: null,
            feedback: 'Assignment not submitted',
            status: 'missing'
          };
        }
        
        if (!submission.grade) {
          // Submitted but not graded yet
          return {
            id: `assignment_${assignment._id}_${submission._id}`,
            title: assignment.title,
            type: 'assignment',
            subject: subject?.name || 'Unknown Subject',
            subjectColor: subject?.color || '#2196F3',
            teacher: teacher?.name || `Teacher ${assignment.teacherId?.slice(-4) || 'Unknown'}`,
            score: null,
            maxPoints: assignment.totalMarks || assignment.maxPoints || 100,
            percentage: null,
            letterGrade: '-',
            submittedAt: submission.submittedAt,
            gradedAt: null,
            feedback: 'Pending grading',
            status: 'pending'
          };
        }

        // Graded assignment
        return {
          id: `assignment_${assignment._id}_${submission._id}`,
          title: assignment.title,
          type: 'assignment',
          subject: subject?.name || 'Unknown Subject',
          subjectColor: subject?.color || '#2196F3',
          teacher: teacher?.name || `Teacher ${assignment.teacherId?.slice(-4) || 'Unknown'}`,
          score: submission.grade.score || 0,
          maxPoints: submission.grade.maxPoints || assignment.totalMarks || assignment.maxPoints || 100,
          percentage: submission.grade.percentage || Math.round((submission.grade.score / (submission.grade.maxPoints || assignment.totalMarks || assignment.maxPoints || 100)) * 100),
          letterGrade: submission.grade.letterGrade || getLetterGrade(submission.grade.percentage || 0),
          submittedAt: submission.submittedAt,
          gradedAt: submission.grade.gradedAt || submission.grade.createdAt,
          feedback: submission.grade.feedback,
          status: 'graded'
        };
<<<<<<< HEAD
      });

    // Transform quiz attempts to grades (including ungraded ones)
    const quizGrades = quizzes
      .map((quiz: any) => {
=======
      })

    // Transform quiz attempts to grades (including ungraded ones)
    const quizGrades = await Promise.all(
      quizzes.map(async (quiz: any) => {
>>>>>>> 99ca4a1 (Initial commit)
        const attempt = attemptMap[quiz._id.toString()];
        const subject = subjectMap[quiz.subjectId?.toString()];
        const classInfo = classMap[quiz.classId?.toString()];
        const teacher = teacherMap[quiz.teacherId];
<<<<<<< HEAD
        
        if (!attempt) {
          // No attempt - show as missing work
=======
        const now = new Date();
        const quizEnd = quiz.endDate ? new Date(quiz.endDate) : null;
        if (!attempt) {
          // If quiz is overdue, auto-grade as 0 and create a QuizAttempt record
          if (quizEnd && now > quizEnd) {
            // Only create if not already created (double-check)
            const existing = await QuizAttempt.findOne({ quizId: quiz._id.toString(), studentId, status: 'completed' });
            let autoAttempt = existing;
            if (!existing) {
              autoAttempt = await QuizAttempt.create({
                quizId: quiz._id.toString(),
                studentId,
                studentName: student.name,
                classId: student.classId,
                schoolId: student.schoolId,
                startTime: quizEnd,
                endTime: quizEnd,
                submittedAt: quizEnd,
                totalPoints: 0,
                percentage: 0,
                status: 'completed',
                answers: [],
                flaggedQuestions: [],
                feedback: 'Missed quiz deadline',
              });
            }
            return {
              id: `quiz_${quiz._id}_${autoAttempt._id}`,
              title: quiz.title,
              type: 'quiz',
              subject: subject?.name || 'Unknown Subject',
              subjectColor: subject?.color || '#2196F3',
              teacher: teacher?.name || `Teacher ${quiz.teacherId?.slice(-4) || 'Unknown'}`,
              score: 0,
              maxPoints: quiz.totalPoints || 100,
              percentage: 0,
              letterGrade: 'F',
              submittedAt: quizEnd.toISOString(),
              gradedAt: quizEnd.toISOString(),
              feedback: 'Missed quiz deadline',
              status: 'graded'
            };
          }
          // Not overdue yet, show as missing
>>>>>>> 99ca4a1 (Initial commit)
          return {
            id: `quiz_${quiz._id}_missing`,
            title: quiz.title,
            type: 'quiz',
            subject: subject?.name || 'Unknown Subject',
            subjectColor: subject?.color || '#2196F3',
            teacher: teacher?.name || `Teacher ${quiz.teacherId?.slice(-4) || 'Unknown'}`,
            score: null,
            maxPoints: quiz.totalPoints || 100,
            percentage: 0,
            letterGrade: 'Missing',
            submittedAt: null,
            gradedAt: null,
            feedback: 'Quiz not taken',
            status: 'missing'
          };
        }

        // Quiz completed
        return {
          id: `quiz_${quiz._id}_${attempt._id}`,
          title: quiz.title,
          type: 'quiz',
          subject: subject?.name || 'Unknown Subject',
          subjectColor: subject?.color || '#2196F3',
          teacher: teacher?.name || `Teacher ${quiz.teacherId?.slice(-4) || 'Unknown'}`,
<<<<<<< HEAD
          score: attempt.score || 0,
          maxPoints: attempt.maxPoints || quiz.totalPoints || 100,
          percentage: attempt.percentage || Math.round((attempt.score / (attempt.maxPoints || quiz.totalPoints || 100)) * 100),
          letterGrade: attempt.letterGrade || getLetterGrade(attempt.percentage || 0),
=======
          score: typeof attempt.totalPoints === 'number' ? attempt.totalPoints : 0,
          maxPoints: typeof quiz.totalPoints === 'number' ? quiz.totalPoints : 100,
          percentage: typeof attempt.percentage === 'number' ? attempt.percentage : (quiz.totalPoints ? Math.round((attempt.totalPoints / quiz.totalPoints) * 100) : 0),
          letterGrade: getLetterGrade(typeof attempt.percentage === 'number' ? attempt.percentage : 0),
>>>>>>> 99ca4a1 (Initial commit)
          submittedAt: attempt.submittedAt || attempt.endTime,
          gradedAt: attempt.submittedAt || attempt.endTime,
          feedback: attempt.feedback,
          status: 'graded'
        };
<<<<<<< HEAD
      });
=======
      })
    );
>>>>>>> 99ca4a1 (Initial commit)
;
      }
      acc[grade.subject].push(grade);
      return acc;
    }, {});

    const subjectGrades = Object.keys(subjectGradeMap).map(subject => {
      const grades = subjectGradeMap[subject];
      const gradedItems = grades.filter(g => g.status === 'graded');
      const totalPoints = gradedItems.reduce((sum, grade) => sum + grade.maxPoints, 0);
      const earnedPoints = gradedItems.reduce((sum, grade) => sum + grade.score, 0);
      const currentGrade = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
      
      const assignments = grades.filter(g => g.type === 'assignment').length;
      const quizzes = grades.filter(g => g.type === 'quiz').length;

      return {
        subject,
        subjectColor: grades[0]?.subjectColor || '#1976d2',
        teacher: grades[0]?.teacher || 'Unknown Teacher',
        currentGrade,
        letterGrade: getLetterGrade(currentGrade),
        totalPoints,
        earnedPoints,
        assignments,
        quizzes,
        trend: 'stable'
      };
    });

    return NextResponse.json({
      grades: allGrades.sort((a, b) => {
        const aDate = a.gradedAt ? new Date(a.gradedAt).getTime() : 0;
        const bDate = b.gradedAt ? new Date(b.gradedAt).getTime() : 0;
        return bDate - aDate;
      }),
      subjectGrades: subjectGrades
    });

  } catch (error) {
    console.error('Error fetching student grades:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grades' },
      { status: 500 }
    );
  }
}

function getLetterGrade(percentage: number): string {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}
