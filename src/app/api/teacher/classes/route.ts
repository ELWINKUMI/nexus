import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { User, Class, TeacherAssignment } from '@/models';

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

    // Get teacher assignments to find classes
    const teacherAssignments = await TeacherAssignment.find({ 
      teacherId: teacher.id 
    });

    const classIds = [...new Set(teacherAssignments.map(ta => ta.classId))];

    // Get classes assigned to this teacher
    const classes = await Class.find({ 
      _id: { $in: classIds }
    });

    // Get students for each class
    const classesWithStudents = await Promise.all(
      classes.map(async (classItem) => {
        const students = await User.find({ 
          classId: classItem._id.toString(), 
          role: 'student' 
        });

        return {
          id: classItem._id.toString(),
          name: classItem.name,
          grade: 'Grade 8', // This could be made dynamic based on class data
          students: students.map(student => ({
            id: student.id,
            name: student.name,
            email: student.email,
            status: 'active' // This could be dynamic based on student data
          })),
          studentCount: students.length
        };
      })
    );

    return NextResponse.json(classesWithStudents);
  } catch (error) {
    console.error('Teacher classes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
