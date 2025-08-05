import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Subject, UserRole } from '@/models';
import { verifyToken } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const authUser = verifyToken(token);
    if (!authUser || authUser.role !== UserRole.SCHOOL_ADMIN) {
      return NextResponse.json(
        { error: 'Forbidden: School Admin access required' },
        { status: 403 }
      );
    }
    
    const { name, description } = await request.json();
    
    if (!name) {
      return NextResponse.json(
        { error: 'Subject name is required' },
        { status: 400 }
      );
    }
    
    // Update subject
    const updatedSubject = await Subject.findOneAndUpdate(
      { _id: params.id, schoolId: authUser.schoolId },
      { name, description },
      { new: true }
    );
    
    if (!updatedSubject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Subject updated successfully',
      subject: {
        id: updatedSubject._id,
        name: updatedSubject.name,
        description: updatedSubject.description,
        schoolId: updatedSubject.schoolId,
        updatedAt: updatedSubject.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Update subject error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const authUser = verifyToken(token);
    if (!authUser || authUser.role !== UserRole.SCHOOL_ADMIN) {
      return NextResponse.json(
        { error: 'Forbidden: School Admin access required' },
        { status: 403 }
      );
    }
    
    // Delete subject
    const deletedSubject = await Subject.findOneAndDelete({
      _id: params.id,
      schoolId: authUser.schoolId
    });
    
    if (!deletedSubject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Subject deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete subject error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
