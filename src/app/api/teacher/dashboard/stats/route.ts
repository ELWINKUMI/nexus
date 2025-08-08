import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { User, Class, Subject, Assignment, AssignmentSubmission, Quiz, QuizAttempt } from '@/models';

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

    console.log('GET Dashboard Stats - Teacher ID from token:', teacherId);

    // Get teacher to find schoolId
    const teacher = await User.findOne({ 
      id: teacherId, 
      role: 'teacher' 
    });
    
    if (!teacher) {
      console.log('GET Dashboard Stats - Teacher not found for ID:', teacherId);
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }
<<<<<<< HEAD
=======
    // Get school name
    let schoolName = '';
    if (teacher.schoolId) {
      const school = await (await import('@/models')).School.findOne({ _id: teacher.schoolId });
      schoolName = school?.name || '';
    }
>>>>>>> 99ca4a1 (Initial commit)

    // Get all data in parallel for efficiency
    const [classes, subjects, assignments, students, assignmentSubmissions, quizzes, quizAttempts] = await Promise.all([
      Class.find({ schoolId: teacher.schoolId }),
      Subject.find({ schoolId: teacher.schoolId }),
      Assignment.find({ teacherId, schoolId: teacher.schoolId }),
      User.find({ role: 'student', schoolId: teacher.schoolId }),
      AssignmentSubmission.find({ schoolId: teacher.schoolId }),
      Quiz.find({ teacherId, schoolId: teacher.schoolId }),
      QuizAttempt.find({ schoolId: teacher.schoolId })
    ]);

    // Calculate class performance metrics
    const totalStudents = students.length;
    const totalAssignments = assignments.length;
    const totalSubmissions = assignmentSubmissions.length;
    const completedSubmissions = assignmentSubmissions.filter(sub => sub.status === 'submitted').length;
    
    // Assignment completion rate
    const assignmentCompletionRate = totalAssignments > 0 && totalStudents > 0 
      ? Math.round((completedSubmissions / (totalAssignments * totalStudents)) * 100)
      : 0;

    // Average grade calculation
    const gradedSubmissions = assignmentSubmissions.filter(sub => sub.grade !== undefined && sub.grade !== null);
    const averageGrade = gradedSubmissions.length > 0
      ? gradedSubmissions.reduce((sum, sub) => sum + (sub.grade || 0), 0) / gradedSubmissions.length
      : 0;
    
    // Convert average grade to letter grade
    const getLetterGrade = (avg: number) => {
      if (avg >= 90) return 'A';
      if (avg >= 85) return 'A-';
      if (avg >= 80) return 'B+';
      if (avg >= 75) return 'B';
      if (avg >= 70) return 'B-';
      if (avg >= 65) return 'C+';
      if (avg >= 60) return 'C';
      return 'D';
    };

    // Attendance rate (simulated based on assignment activity)
    // In a real system, you'd have attendance records
    const attendanceRate = Math.min(95, Math.max(75, 
      assignmentCompletionRate + Math.floor(Math.random() * 10) - 5
    ));

    // Quiz performance
    const completedQuizAttempts = quizAttempts.filter(attempt => 
      attempt.status === 'completed' || attempt.status === 'submitted'
    );
    const averageQuizScore = completedQuizAttempts.length > 0
      ? completedQuizAttempts.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0) / completedQuizAttempts.length
      : 0;

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentAssignments = assignments.filter(assignment => 
      new Date(assignment.createdAt) > thirtyDaysAgo
    ).length;

    const recentQuizzes = quizzes.filter(quiz => 
      new Date(quiz.createdAt) > thirtyDaysAgo
    ).length;

    // Classes with student counts
    const classesWithStudents = await Promise.all(
      classes.map(async (cls) => {
        const studentCount = await User.countDocuments({ 
          role: 'student', 
          classId: cls._id.toString(),
          schoolId: teacher.schoolId 
        });
        
        // Get class assignments for grade calculation
        const classAssignments = assignments.filter(a => a.classId === cls._id.toString());
        const classSubmissions = assignmentSubmissions.filter(sub => 
          classAssignments.some(a => a._id.toString() === sub.assignmentId)
        );
        const classGradedSubmissions = classSubmissions.filter(sub => sub.grade !== undefined);
        const classAverageGrade = classGradedSubmissions.length > 0
          ? classGradedSubmissions.reduce((sum, sub) => sum + (sub.grade || 0), 0) / classGradedSubmissions.length
          : 0;

        return {
          id: cls._id.toString(),
          name: cls.name,
          students: studentCount,
          grade: getLetterGrade(classAverageGrade),
          averageGrade: Math.round(classAverageGrade)
        };
      })
    );

    // Subjects with class counts
    const subjectsWithCounts = subjects.map(subject => ({
      id: subject._id.toString(),
      name: subject.name,
      classes: classes.filter(cls => 
        assignments.some(a => a.subjectId === subject._id.toString() && a.classId === cls._id.toString())
      ).length
    }));

    // Recent assignments with enhanced data
    const recentAssignmentsData = assignments
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(assignment => {
        const subject = subjects.find(s => s._id.toString() === assignment.subjectId);
        const submissionsForAssignment = assignmentSubmissions.filter(sub => 
          sub.assignmentId === assignment._id.toString()
        );
        const submittedCount = submissionsForAssignment.filter(sub => sub.status === 'submitted').length;
        const totalStudentsForAssignment = students.filter(s => s.classId === assignment.classId).length;
        
        let status = 'active';
        if (new Date(assignment.dueDate) < new Date()) {
          status = 'overdue';
        }
        if (submittedCount === totalStudentsForAssignment && totalStudentsForAssignment > 0) {
          status = 'completed';
        }

        return {
          id: assignment._id.toString(),
          title: assignment.title,
          subject: subject?.name || 'Unknown Subject',
          dueDate: assignment.dueDate,
          status,
          submissionRate: totalStudentsForAssignment > 0 
            ? Math.round((submittedCount / totalStudentsForAssignment) * 100)
            : 0
        };
      });

    const dashboardStats = {
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email
      },
      stats: {
        classes: classes.length,
        subjects: subjects.length,
        students: totalStudents,
        assignments: totalAssignments,
        quizzes: quizzes.length
      },
      performance: {
        assignmentCompletionRate,
        averageGrade: Math.round(averageGrade),
        letterGrade: getLetterGrade(averageGrade),
        attendanceRate,
        averageQuizScore: Math.round(averageQuizScore),
        activeProjects: assignments.filter(a => a.status === 'active').length
      },
      activity: {
        recentAssignments: recentAssignments,
        recentQuizzes: recentQuizzes,
        totalSubmissions: completedSubmissions
      },
      classes: classesWithStudents,
      subjects: subjectsWithCounts,
      recentAssignments: recentAssignmentsData
    };

    console.log('Dashboard stats calculated:', {
      assignmentCompletion: assignmentCompletionRate,
      averageGrade: Math.round(averageGrade),
      attendanceRate,
      activeProjects: assignments.filter(a => a.status === 'active').length
    });

<<<<<<< HEAD
    return NextResponse.json(dashboardStats);
=======
    return NextResponse.json({ ...dashboardStats, schoolName });
>>>>>>> 99ca4a1 (Initial commit)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
