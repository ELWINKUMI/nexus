import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import { User, Subject, TeacherAssignment } from '@/models';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.role !== 'student') {
      return NextResponse.json({ error: 'Access denied. Students only.' }, { status: 403 });
    }

    await connectDB();

    // Find the student using the custom id field
    const student = await User.findOne({ id: decoded.id });
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get teacher assignments for this class to find which subjects have teachers
    const teacherAssignments = await TeacherAssignment.find({ 
      classId: student.classId 
    }).populate('teacherId', 'name email');

    // Extract subject IDs that have teachers assigned to this class
    const subjectIdsWithTeachers = teacherAssignments.map(assignment => assignment.subjectId);

    // Get only the subjects that have teachers assigned to this class
    const subjects = await Subject.find({ 
      _id: { $in: subjectIdsWithTeachers } 
    }).lean();

    // Create a map of subject ID to teacher info
    const subjectTeacherMap = {};
    teacherAssignments.forEach(assignment => {
      subjectTeacherMap[assignment.subjectId] = {
        teacherId: assignment.teacherId._id,
        teacherName: assignment.teacherId.name,
        teacherEmail: assignment.teacherId.email
      };
    });

    // Enrich subjects with teacher information
    const enrichedSubjects = subjects.map(subject => {
      const teacherInfo = subjectTeacherMap[subject._id.toString()];
      return {
        id: subject._id,
        name: subject.name,
        description: subject.description || '',
        code: subject.name, // Use name as code since code field doesn't exist in schema
        teacher: teacherInfo ? {
          id: teacherInfo.teacherId,
          name: teacherInfo.teacherName,
          email: teacherInfo.teacherEmail
        } : null,
        className: student.className || 'N/A'
      };
    });

    return NextResponse.json({
      success: true,
      subjects: enrichedSubjects,
      totalSubjects: enrichedSubjects.length,
      className: student.className
    });

  } catch (error) {
    console.error('Error fetching student subjects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subjects' }, 
      { status: 500 }
    );
  }
}
