import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { User, Subject } from '@/models';
import { Resource } from '@/models/Resource';

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

    console.log('GET Student Resources - Student ID from token:', studentId);

    // Get student to find classId and schoolId
    const student = await User.findOne({ 
      id: studentId, 
      role: 'student' 
    });
    
    if (!student) {
      console.log('GET Student Resources - Student not found for ID:', studentId);
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Try to get real resources first
    const [resources, subjects, teachers] = await Promise.all([
      Resource.find({ 
        $or: [
          { classId: student.classId },
          { schoolId: student.schoolId, isPublic: true }
        ]
      }).sort({ createdAt: -1 }),
      Subject.find({ schoolId: student.schoolId }),
      User.find({ schoolId: student.schoolId, role: 'teacher' })
    ]);

    console.log('GET Student Resources - Found resources:', resources.length);

    // Create lookup maps
    const subjectMap = subjects.reduce((acc, subject) => {
      acc[subject._id.toString()] = subject;
      return acc;
    }, {} as Record<string, any>);

    const teacherMap = teachers.reduce((acc, teacher) => {
      acc[teacher.id] = teacher;
      return acc;
    }, {} as Record<string, any>);

    // Transform real resources for student view
    const transformedResources = resources.map(resource => {
      const subject = subjectMap[resource.subjectId];
      const teacher = teacherMap[resource.uploadedBy];

      return {
        id: resource._id.toString(),
        title: resource.title,
        description: resource.description || '',
        subject: subject?.name || 'General',
        subjectColor: subject?.color || '#6B7280',
        teacher: teacher?.name || `Teacher ${resource.uploadedBy?.slice(-4) || 'Unknown'}`,
        teacherId: resource.uploadedBy,
        type: resource.fileType || 'document',
        url: resource.fileUrl,
        fileSize: resource.fileSize,
        downloadCount: resource.downloadCount || 0,
        tags: resource.tags || [],
        isPublic: resource.visibility === 'public',
        createdAt: resource.createdAt.toISOString(),
        updatedAt: resource.updatedAt.toISOString()
      };
    });

    return NextResponse.json(transformedResources);
  } catch (error) {
    console.error('Error fetching student resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}
