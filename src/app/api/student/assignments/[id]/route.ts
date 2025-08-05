import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { User, Assignment, Subject, AssignmentSubmission } from '@/models';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    const studentId = decoded.id;
    const { id: assignmentId } = await params;

    console.log('GET Single Assignment - Student ID:', studentId, 'Assignment ID:', assignmentId);

    // Get student to verify class/school access
    const student = await User.findOne({ 
      id: studentId, 
      role: 'student' 
    });
    
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get assignment and verify access
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      classId: student.classId,
      schoolId: student.schoolId,
      status: 'active'
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Manually fetch teacher and subject data
    const teacher = await User.findOne({ 
      id: assignment.teacherId,
      role: 'teacher' 
    });
    
    const subject = await Subject.findOne({ 
      _id: assignment.subjectId
    });

    // Get student's submission for this assignment
    const submission = await AssignmentSubmission.findOne({
      assignmentId: assignmentId,
      studentId: studentId
    });

    // Format assignment for frontend
    const formattedAssignment = {
      id: assignment._id.toString(),
      title: assignment.title,
      description: assignment.description,
      subject: subject?.name || 'Unknown Subject',
      subjectColor: subject?.color || '#2196F3',
      teacher: teacher?.name || `Teacher ${assignment.teacherId?.slice(-4) || 'Unknown'}`,
      teacherAvatar: undefined,
      dueDate: assignment.dueDate?.toISOString() || null,
      createdDate: assignment.createdAt.toISOString(),
      maxPoints: assignment.totalMarks || 100,
      instructions: assignment.description,
      attachments: assignment.attachments?.map((att, index) => ({
        id: `attachment_${index}`,
        name: att.name,
        type: att.type,
        url: att.fileName ? `/uploads/${att.fileName}` : '#' // Use fileName if it exists, otherwise show placeholder
      })).filter(att => att.url !== '#') || [], // Filter out attachments without actual files
      allowLateSubmission: true,
      submissionTypes: ['text', 'file'],
      estimatedTime: '2-3 hours',
      category: 'homework',
      submission: submission ? {
        id: submission._id.toString(),
        content: submission.content || '',
        attachments: submission.attachments || [],
        status: submission.status,
        submittedAt: submission.submittedAt?.toISOString(),
        grade: submission.grade,
        feedback: submission.feedback,
        updatedAt: submission.updatedAt?.toISOString()
      } : null
    };

    return NextResponse.json(formattedAssignment);

  } catch (error) {
    console.error('Error fetching assignment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignment' }, 
      { status: 500 }
    );
  }
}
