import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { User, Assignment } from '@/models';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

interface DecodedToken {
  id: string;
  role: string;
  iat?: number;
  exp?: number;
}

export async function PUT(
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

    const assignmentId = params.id;
    const body = await request.json();

    // Find the assignment and verify ownership
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      teacherId: teacherId
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found or unauthorized' }, { status: 404 });
    }

    // Update the assignment
    const {
      title,
      description,
      dueDate,
      totalMarks,
      submissionType,
      allowResubmission,
      maxSubmissions,
      instructions
    } = body;

    assignment.title = title || assignment.title;
    assignment.description = description || assignment.description;
    assignment.dueDate = dueDate || assignment.dueDate;
    assignment.totalMarks = totalMarks || assignment.totalMarks;
    assignment.submissionType = submissionType || assignment.submissionType;
    assignment.allowResubmission = allowResubmission !== undefined ? allowResubmission : assignment.allowResubmission;
    assignment.maxSubmissions = maxSubmissions || assignment.maxSubmissions;
    assignment.instructions = instructions || assignment.instructions;
    assignment.updatedAt = new Date();

    const updatedAssignment = await assignment.save();

    console.log('PUT Assignment - Updated assignment:', {
      id: updatedAssignment._id,
      title: updatedAssignment.title,
      teacherId: updatedAssignment.teacherId
    });

    return NextResponse.json({ 
      message: 'Assignment updated successfully',
      assignment: updatedAssignment
    });

  } catch (error) {
    console.error('Error updating assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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

    const assignmentId = params.id;

    // Find the assignment and verify ownership
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      teacherId: teacherId
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found or unauthorized' }, { status: 404 });
    }

    // Soft delete by setting status to 'deleted'
    assignment.status = 'deleted';
    assignment.updatedAt = new Date();
    await assignment.save();

    return NextResponse.json({ 
      message: 'Assignment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
