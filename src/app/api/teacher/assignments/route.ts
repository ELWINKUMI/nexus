import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { User, Assignment, AssignmentSubmission } from '@/models';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

interface DecodedToken {
  id: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Force recompilation after UTF-8 fix - Status fixed in database

export async function GET() {
  try {
    await dbConnect();
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as DecodedToken;
    const teacherId = decoded.id;

    console.log('GET Assignments - Teacher ID from token:', teacherId);

    // Debug: Check all assignments in database
    const allAssignments = await Assignment.find({});
    console.log('GET Assignments - All assignments in DB:', allAssignments.length);
    console.log('GET Assignments - All assignments:', allAssignments.map((a: Record<string, unknown>) => ({ id: a._id, title: a.title, teacherId: a.teacherId, status: a.status })));

        // Fetch assignments with active status - force recompile 2
    const assignments = await Assignment.find({ 
      teacherId,
      status: 'active'
    }).sort({ createdAt: -1 });

    console.log('GET Assignments - Found assignments:', assignments.length);
    console.log('GET Assignments - Assignment data:', assignments.map(a => ({ id: a._id, title: a.title, teacherId: a.teacherId })));

    // Get subject and class data for mapping
    const { Subject, Class } = await import('@/models');
    const subjects = await Subject.find({});
    const classes = await Class.find({});

    // Create lookup maps
    const subjectMap = new Map(subjects.map(s => [s._id.toString(), s.name]));
    const classMap = new Map(classes.map(c => [c._id.toString(), c.name]));

    // Fetch real submission data for each assignment
    const assignmentsWithSubmissions = await Promise.all(
      assignments.map(async (assignment) => {
        // Get all submissions for this assignment
        const submissions = await AssignmentSubmission.find({
          assignmentId: assignment._id.toString()
        }).sort({ submittedAt: -1 });

        // If no submissions exist, get all students from the class to show "not_submitted" status
        let studentsInClass = [];
        if (submissions.length === 0) {
          studentsInClass = await User.find({
            role: 'student',
            classId: assignment.classId,
            schoolId: assignment.schoolId
          }).select('id name');
        }

        // Prepare submission data
        const submissionData = submissions.length > 0 
          ? submissions.map(sub => ({
              studentId: sub.studentId,
              studentName: sub.studentName,
              status: sub.status,
              submittedAt: sub.submittedAt,
              grade: sub.grade,
              content: sub.content,
              files: sub.files || []
            }))
          : studentsInClass.map(student => ({
              studentId: student.id,
              studentName: student.name,
              status: 'not_submitted',
              submittedAt: null,
              grade: null,
              content: null,
              files: []
            }));

        return {
          id: assignment._id.toString(),
          title: assignment.title,
          description: assignment.description,
          subject: subjectMap.get(assignment.subjectId) || 'Unknown Subject',
          class: classMap.get(assignment.classId) || 'Unknown Class',
          dueDate: assignment.dueDate,
          status: assignment.status,
          createdAt: assignment.createdAt,
          totalMarks: assignment.totalMarks,
          attachments: assignment.attachments || [],
          submissions: submissionData
        };
      })
    );

    return NextResponse.json(assignmentsWithSubmissions);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as DecodedToken;
    const teacherId = decoded.id;

    console.log('POST Assignment - Teacher ID from token:', teacherId);

    // Get teacher to find schoolId
    const teacher = await User.findOne({ 
      id: teacherId, 
      role: 'teacher' 
    });
    
    if (!teacher) {
      console.log('POST Assignment - Teacher not found for ID:', teacherId);
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    console.log('POST Assignment - Teacher found:', { id: teacher.id, schoolId: teacher.schoolId });

    const body = await request.json();
    const {
      title,
      description,
      subject,
      class: className,
      dueDate,
      instructions,
      attachments,
      totalMarks
    } = body;

    console.log('Request body:', body);

    // Validation
    if (!title || !subject || !className || !dueDate) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, subject, class, and dueDate are required' 
      }, { status: 400 });
    }

    // Get subject and class IDs
    const { Subject, Class } = await import('@/models');
    
    const subjectDoc = await Subject.findOne({ name: subject, schoolId: teacher.schoolId });
    const classDoc = await Class.findOne({ name: className, schoolId: teacher.schoolId });

    const subjectId = subjectDoc?._id?.toString();
    const classId = classDoc?._id?.toString();

    if (!subjectId) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 400 });
    }

    if (!classId) {
      return NextResponse.json({ error: 'Class not found' }, { status: 400 });
    }

    // Combine description and instructions
    const finalDescription = description + (instructions ? '\n\nInstructions:\n' + instructions : '');

    // Create new assignment with the correct schema
    const assignment = new Assignment({
      title,
      description: finalDescription,
      teacherId,
      subjectId,
      classId: classId,
      dueDate: new Date(dueDate),
      totalMarks: totalMarks || 100,
      schoolId: teacher.schoolId,
      status: 'active',
      attachments: attachments || []
    });

    console.log('POST Assignment - Creating assignment with data:', {
      title,
      teacherId,
      subjectId,
      classId,
      schoolId: teacher.schoolId
    });

    const savedAssignment = await assignment.save();
    console.log('POST Assignment - Saved assignment:', {
      id: savedAssignment._id,
      title: savedAssignment.title,
      teacherId: savedAssignment.teacherId
    });

    return NextResponse.json({ 
      message: 'Assignment created successfully',
      assignmentId: savedAssignment._id 
    });
  } catch (error: unknown) {
    console.error('Error creating assignment:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      const validationError = error as { errors: Record<string, { message: string }> };
      const validationErrors = Object.values(validationError.errors).map((err: { message: string }) => err.message);
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationErrors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
