import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { User, Assignment, Subject, AssignmentSubmission } from '@/models';

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

    console.log('GET Student Assignments - Student ID from token:', studentId);

    // Get student to find classId and schoolId
    const student = await User.findOne({ 
      id: studentId, 
      role: 'student' 
    });
    
    if (!student) {
      console.log('GET Student Assignments - Student not found for ID:', studentId);
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    console.log('Student found:', { classId: student.classId, schoolId: student.schoolId });

    // Get all assignments for the student's class and school
    const assignments = await Assignment.find({
      classId: student.classId,
      schoolId: student.schoolId,
      status: 'active'
    })
    .sort({ createdAt: -1 });

    console.log('Found assignments:', assignments.length);

    // Manually fetch teachers and subjects since Assignment model uses string IDs
    const teacherIds = [...new Set(assignments.map(a => a.teacherId))];
    const subjectIds = [...new Set(assignments.map(a => a.subjectId))];
    
    const teachers = await User.find({ 
      id: { $in: teacherIds },
      role: 'teacher' 
    });
    
    const subjects = await Subject.find({ 
      _id: { $in: subjectIds }
    });

    // Create lookup maps
    const teacherMap = new Map();
    teachers.forEach(teacher => {
      teacherMap.set(teacher.id, teacher);
    });

    const subjectMap = new Map();
    subjects.forEach(subject => {
      subjectMap.set(subject._id.toString(), subject);
    });

    // Get all submissions for this student
    const submissions = await AssignmentSubmission.find({
      studentId: studentId
    });

    // Create a map of submissions by assignment ID
    const submissionMap = new Map();
    submissions.forEach(sub => {
      submissionMap.set(sub.assignmentId, sub);
    });

    // Format assignments for frontend
    const formattedAssignments = assignments.map(assignment => {
      const submission = submissionMap.get(assignment._id.toString());
      const teacher = teacherMap.get(assignment.teacherId);
      const subject = subjectMap.get(assignment.subjectId);
      
      // Determine assignment status
      let status = 'not-started';
      let submissionStatus = undefined;
      let score = undefined;
      let feedback = undefined;

      if (submission) {
        if (submission.status === 'submitted') {
          // Check if submission has a valid grade with actual score
          const hasValidGrade = submission.grade && 
                               typeof submission.grade === 'object' && 
                               submission.grade.score !== undefined && 
                               submission.grade.score !== null;
          
          status = hasValidGrade ? 'graded' : 'submitted';
          submissionStatus = 'submitted';
          
          // If graded, include the grade object, otherwise just set score as undefined
          if (hasValidGrade) {
            score = submission.grade; // Pass the entire grade object
          } else {
            score = undefined;
          }
          
          feedback = submission.feedback;
        } else if (submission.status === 'draft') {
          status = 'in-progress';
          submissionStatus = 'draft';
        }
      }

      // Check if overdue
      if (assignment.dueDate && new Date() > assignment.dueDate && status === 'not-started') {
        status = 'overdue';
      }

      return {
        id: assignment._id.toString(),
        title: assignment.title,
        description: assignment.description,
        subject: subject?.name || 'Unknown Subject',
        subjectColor: subject?.color || '#2196F3',
        teacher: teacher?.name || `Teacher ${assignment.teacherId?.slice(-4) || 'Unknown'}`,
        teacherAvatar: undefined,
        dueDate: assignment.dueDate?.toISOString() || null,
        createdDate: assignment.createdAt.toISOString(),
        maxPoints: 100,
        status,
        submissionStatus,
        score,
        feedback,
        attachments: assignment.attachments?.map((att, index) => ({
          id: `attachment_${index}`,
          name: att.name,
          type: att.type,
          url: att.fileName ? `/uploads/${att.fileName}` : '#'
        })).filter(att => att.url !== '#') || [],
        allowLateSubmission: true,
        submissionTypes: ['text', 'file'],
        instructions: assignment.description,
        estimatedTime: '2-3 hours',
        category: 'homework'
      };
    });

    return NextResponse.json({
      assignments: formattedAssignments,
      total: formattedAssignments.length,
      student: {
        id: student.id,
        name: student.name,
        classId: student.classId,
        schoolId: student.schoolId
      }
    });

  } catch (error) {
    console.error('Error fetching student assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    const studentId = decoded.id;
    
    const body = await request.json();
    const { assignmentId, content, attachments, isDraft = true } = body;

    // Get student
    const student = await User.findOne({ 
      id: studentId, 
      role: 'student' 
    });
    
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Verify assignment exists and belongs to student's class
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      classId: student.classId,
      schoolId: student.schoolId
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Check if submission already exists
    let submission = await AssignmentSubmission.findOne({
      assignmentId,
      studentId
    });

    if (submission) {
      // Update existing submission
      submission.content = content;
      submission.files = Array.isArray(attachments) ? attachments.map(att => {
        if (typeof att === 'string') return att;
        if (typeof att === 'object' && att.url) return att.url;
        if (typeof att === 'object' && att.fileName) return att.fileName;
        return att;
      }) : [];
      submission.status = isDraft ? 'draft' : 'submitted';
      submission.submittedAt = isDraft ? undefined : new Date();
      submission.updatedAt = new Date();
      
      await submission.save();
    } else {
      // Create new submission
      submission = new AssignmentSubmission({
        assignmentId,
        studentId,
        studentName: student.name,
        content,
        files: Array.isArray(attachments) ? attachments.map(att => {
          if (typeof att === 'string') return att;
          if (typeof att === 'object' && att.url) return att.url;
          if (typeof att === 'object' && att.fileName) return att.fileName;
          return att;
        }) : [],
        status: isDraft ? 'draft' : 'submitted',
        submittedAt: isDraft ? undefined : new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await submission.save();
    }

    return NextResponse.json({
      success: true,
      submission: {
        id: submission._id.toString(),
        status: submission.status,
        submittedAt: submission.submittedAt?.toISOString(),
        updatedAt: submission.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error saving assignment submission:', error);
    return NextResponse.json(
      { error: 'Failed to save submission' }, 
      { status: 500 }
    );
  }
}
