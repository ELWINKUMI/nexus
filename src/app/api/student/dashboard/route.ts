import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { User, Class, Subject, Assignment, Quiz, TeacherAssignment } from '@/models';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  id: string;
  role: string;
  iat?: number;
  exp?: number;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    if (decoded.role !== 'student') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await dbConnect();

    // Get student information
    const student = await User.findOne({ 
      id: decoded.id, 
      role: 'student' 
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

<<<<<<< HEAD
=======
    // Get school name
    let schoolName = '';
    if (student.schoolId) {
      const school = await (await import('@/models')).School.findOne({ _id: student.schoolId });
      schoolName = school?.name || '';
    }

>>>>>>> 99ca4a1 (Initial commit)
    let studentClass = null;
    let subjects = [];
    let assignments = [];
    let quizzes = [];
    let teachers = [];
<<<<<<< HEAD
    let teacherAssignments = []; // Declare here so it's accessible in the subjects.map() later

    if (student.classId) {
      // Get student's class
      studentClass = await Class.findById(student.classId);

      // Get all teacher assignments for this specific class
      // This finds which teachers are assigned to teach which subjects in this class
      teacherAssignments = await TeacherAssignment.find({ 
        classId: student.classId 
      });

      // Extract unique subject IDs that teachers are assigned to teach in this class
      // This ensures we only count subjects that actually have teachers assigned
      const subjectIds = [...new Set(teacherAssignments.map(ta => ta.subjectId))];
      const teacherIds = [...new Set(teacherAssignments.map(ta => ta.teacherId))];

      // Get only the subjects that have teachers assigned to this class
      subjects = await Subject.find({ 
        _id: { $in: subjectIds }
      });

      // Get assignments for the student's class
      assignments = await Assignment.find({ 
        classId: student.classId
      });

      // Get quizzes for the student's class
      quizzes = await Quiz.find({ 
        classId: student.classId
      });

      // Get teacher information for subjects in this class
      teachers = await User.find({ 
        id: { $in: teacherIds },
        role: 'teacher'
      });
=======
    let teacherAssignments = [];

    if (student.classId) {
      studentClass = await Class.findById(student.classId);
      teacherAssignments = await TeacherAssignment.find({ classId: student.classId });
      const subjectIds = [...new Set(teacherAssignments.map(ta => ta.subjectId))];
      const teacherIds = [...new Set(teacherAssignments.map(ta => ta.teacherId))];
      subjects = await Subject.find({ _id: { $in: subjectIds } });
      assignments = await Assignment.find({ classId: student.classId });
      quizzes = await Quiz.find({ classId: student.classId });
      teachers = await User.find({ id: { $in: teacherIds }, role: 'teacher' });
>>>>>>> 99ca4a1 (Initial commit)
    }

    // Format data for dashboard (without statistics)
    const dashboardData = {
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
<<<<<<< HEAD
        className: studentClass?.name || 'Not assigned'
=======
        className: studentClass?.name || 'Not assigned',
        schoolName: schoolName
>>>>>>> 99ca4a1 (Initial commit)
      },
      subjects: subjects.map(subject => {
        // Find the teacher assigned to teach this subject in this class
        const teacherAssignment = teacherAssignments.find(ta => ta.subjectId === subject._id.toString());
        const teacher = teacherAssignment ? teachers.find(t => t.id === teacherAssignment.teacherId) : null;
        
        const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
        
        return {
          id: subject._id.toString(),
          name: subject.name,
          teacher: teacher?.name || 'No Teacher Assigned',
          color: colors[Math.floor(Math.random() * colors.length)]
        };
      }),
      assignments: assignments.map(assignment => {
        const subject = subjects.find(s => s._id.toString() === assignment.subjectId);
        return {
          id: assignment._id.toString(),
          title: assignment.title,
          subject: subject?.name || 'Unknown Subject',
          dueDate: assignment.dueDate ? assignment.dueDate.toISOString() : null,
          status: assignment.isActive ? 'pending' : 'completed'
        };
      }),
      quizzes: quizzes.map(quiz => {
        const subject = subjects.find(s => s._id.toString() === quiz.subjectId);
        return {
          id: quiz._id.toString(),
          title: quiz.title,
          subject: subject?.name || 'Unknown Subject',
          timeLimit: quiz.timeLimit || 30,
          questions: quiz.questions?.length || 0
        };
      })
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Student dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
