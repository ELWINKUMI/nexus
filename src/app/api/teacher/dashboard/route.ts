import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { User, Class, Subject, Assignment, TeacherAssignment } from '@/models';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.role !== 'teacher') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await dbConnect();

    // Get teacher information
    const teacher = await User.findOne({ 
      id: decoded.id, 
      role: 'teacher' 
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Get teacher assignments to find classes and subjects
    const teacherAssignments = await TeacherAssignment.find({ 
      teacherId: teacher.id 
    });

    const classIds = [...new Set(teacherAssignments.map(ta => ta.classId))];
    const subjectIds = [...new Set(teacherAssignments.map(ta => ta.subjectId))];

    // Get classes assigned to this teacher
    const classes = await Class.find({ 
      _id: { $in: classIds }
    });

    // Get subjects taught by this teacher
    const subjects = await Subject.find({ 
      _id: { $in: subjectIds }
    });

    // Get assignments created by this teacher
    const assignments = await Assignment.find({ 
      teacherId: teacher.id 
    });

    // Convert ObjectIds to strings for proper comparison with User.classId
    const classIdStrings = classIds.map(id => id.toString());

    // Get real count of students in the classes this teacher is assigned to
    const students = await User.find({ 
      classId: { $in: classIdStrings }, 
      role: 'student' 
    });

    // Group students by class for individual class student counts
    const studentsByClass: { [key: string]: number } = {};
    students.forEach(student => {
      if (!studentsByClass[student.classId]) {
        studentsByClass[student.classId] = 0;
      }
      studentsByClass[student.classId]++;
    });

    // Format data for dashboard
    const dashboardData = {
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email
      },
      stats: {
        classes: classes.length,
        subjects: subjects.length,
        students: students.length, // Real count of students in teacher's classes
        assignments: assignments.length
      },
      classes: classes.map(cls => ({
        id: cls._id.toString(),
        name: cls.name,
        students: studentsByClass[cls._id.toString()] || 0, // Real student count per class
        grade: 'Grade 8' // This could be made dynamic based on class data
      })),
      subjects: subjects.map(subject => ({
        id: subject._id.toString(),
        name: subject.name,
        classes: teacherAssignments.filter(ta => ta.subjectId === subject._id.toString()).length
      })),
      recentAssignments: assignments.slice(-5).map(assignment => ({
        id: assignment._id.toString(),
        title: assignment.title,
        subject: subjects.find(s => s._id.toString() === assignment.subjectId)?.name || 'Unknown',
        dueDate: assignment.dueDate,
        status: assignment.isActive ? 'active' : 'inactive'
      }))
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Teacher dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
