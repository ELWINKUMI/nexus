import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { User, Announcement, Subject } from '@/models';

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

    console.log('GET Student Announcements - Student ID from token:', studentId);

    // Get student to find classId and schoolId
    const student = await User.findOne({ 
      id: studentId, 
      role: 'student' 
    });
    
    if (!student) {
      console.log('GET Student Announcements - Student not found for ID:', studentId);
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Try to get real announcements from teacher APIs first
    let teacherAnnouncements = [];
    try {
      // Fetch from teacher announcements API
      const teacherResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/teacher/announcements`, {
        headers: {
          'Cookie': `auth-token=${token.value}`
        }
      });
      
      if (teacherResponse.ok) {
        const allTeacherAnnouncements = await teacherResponse.json();
        // Filter announcements for this student's class or school-wide
        teacherAnnouncements = allTeacherAnnouncements.filter((announcement: any) => 
          announcement.classId === student.classId || 
          announcement.schoolId === student.schoolId ||
          announcement.isSchoolWide
        );
      }
    } catch (error) {
      console.log('Could not fetch from teacher API, falling back to database:', error);
    }

    // If we have real teacher announcements, use them
    if (teacherAnnouncements.length > 0) {
      const transformedAnnouncements = teacherAnnouncements.map((announcement: any) => ({
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        subject: announcement.subject || (announcement.isSchoolWide ? 'School Wide' : 'General'),
        subjectColor: announcement.subjectColor || (announcement.isSchoolWide ? '#1976D2' : '#6B7280'),
        teacher: announcement.teacher || announcement.author || `Teacher ${announcement.teacherId?.slice(-4) || 'Unknown'}`,
        teacherId: announcement.teacherId,
        priority: announcement.priority || 'normal',
        isSchoolWide: announcement.isSchoolWide || false,
        attachments: announcement.attachments || [],
        tags: announcement.tags || [],
        readBy: announcement.readBy || [],
        isRead: announcement.readBy?.includes(studentId) || false,
        createdAt: announcement.createdAt,
        updatedAt: announcement.updatedAt || announcement.createdAt
      }));

      return NextResponse.json(transformedAnnouncements);
    }

    // Fallback to database announcements
    const [announcements, subjects, teachers] = await Promise.all([
      Announcement.find({ 
        $or: [
          { classId: student.classId },
          { schoolId: student.schoolId, isSchoolWide: true }
        ],
        isActive: true
      }).sort({ createdAt: -1 }),
      Subject.find({ schoolId: student.schoolId }),
      User.find({ schoolId: student.schoolId, role: 'teacher' })
    ]);

    console.log('GET Student Announcements - Found database announcements:', announcements.length);

    // If no real announcements, return empty array instead of mockup data
    if (announcements.length === 0) {
      return NextResponse.json([]);
    }

    // Create lookup maps
    const subjectMap = subjects.reduce((acc, subject) => {
      acc[subject._id.toString()] = subject;
      return acc;
    }, {} as Record<string, any>);

    const teacherMap = teachers.reduce((acc, teacher) => {
      acc[teacher.id] = teacher;
      return acc;
    }, {} as Record<string, any>);

    // Transform real announcements for student view
    const transformedAnnouncements = announcements.map(announcement => {
      const subject = subjectMap[announcement.subjectId];
      const teacher = teacherMap[announcement.teacherId];

      return {
        id: announcement._id.toString(),
        title: announcement.title,
        content: announcement.content,
        subject: subject?.name || (announcement.isSchoolWide ? 'School Wide' : 'General'),
        subjectColor: subject?.color || (announcement.isSchoolWide ? '#1976D2' : '#6B7280'),
        teacher: teacher?.name || announcement.author || `Teacher ${announcement.teacherId?.slice(-4) || 'Unknown'}`,
        teacherId: announcement.teacherId,
        priority: announcement.priority || 'normal',
        isSchoolWide: announcement.isSchoolWide || false,
        attachments: announcement.attachments || [],
        tags: announcement.tags || [],
        readBy: announcement.readBy || [],
        isRead: announcement.readBy?.includes(studentId) || false,
        createdAt: announcement.createdAt.toISOString(),
        updatedAt: announcement.updatedAt.toISOString()
      };
    });

    return NextResponse.json(transformedAnnouncements);
  } catch (error) {
    console.error('Error fetching student announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}
