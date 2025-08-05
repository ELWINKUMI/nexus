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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as DecodedToken;
    const teacherId = decoded.id;

    // Verify teacher exists
    const teacher = await User.findOne({ 
      id: teacherId, 
      role: 'teacher' 
    });
    
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const { id: assignmentId } = await params;
    const body = await request.json();
    const { studentId, score, feedback, maxPoints } = body;

    console.log('POST Grade - Request data:', { assignmentId, studentId, score, feedback, maxPoints });

    // Find the assignment and verify ownership
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      teacherId: teacherId
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found or unauthorized' }, { status: 404 });
    }

    // Find the submission for this student
    let submission = assignment.submissions?.find((sub: any) => sub.studentId === studentId);
    
    if (!submission) {
      // If no submission exists, create one
      submission = {
        studentId,
        submittedAt: new Date(),
        status: 'submitted',
        content: 'No submission found - graded directly by teacher',
        attachments: []
      };
      
      if (!assignment.submissions) {
        assignment.submissions = [];
      }
      assignment.submissions.push(submission);
    }

    // Calculate percentage
    const totalMarks = maxPoints || assignment.totalMarks || 100;
    const percentage = Math.round((score / totalMarks) * 100);
    
    // Determine letter grade
    const getLetterGrade = (percentage: number): string => {
      if (percentage >= 90) return 'A';
      if (percentage >= 80) return 'B';
      if (percentage >= 70) return 'C';
      if (percentage >= 60) return 'D';
      return 'F';
    };

    // Create grade object
    const gradeData = {
      score: parseInt(score),
      maxPoints: totalMarks,
      percentage,
      letterGrade: getLetterGrade(percentage),
      feedback: feedback || '',
      gradedAt: new Date(),
      gradedBy: teacherId
    };

    // Add or update grade in assignment's submissions array
    submission.grade = gradeData;

    // Also update the separate AssignmentSubmission document
    const separateSubmission = await AssignmentSubmission.findOne({
      assignmentId: assignmentId,
      studentId: studentId
    });

    if (separateSubmission) {
      separateSubmission.grade = gradeData;
      await separateSubmission.save();
      console.log('POST Grade - Separate submission updated:', separateSubmission._id);
    } else {
      console.log('POST Grade - No separate submission found for student:', studentId);
    }

    // Save the assignment with updated submission
    const updatedAssignment = await assignment.save();

    console.log('POST Grade - Assignment updated:', {
      id: updatedAssignment._id,
      submissionCount: updatedAssignment.submissions?.length || 0
    });

    return NextResponse.json({ 
      message: 'Assignment graded successfully',
      grade: gradeData
    });

  } catch (error) {
    console.error('Error grading assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
