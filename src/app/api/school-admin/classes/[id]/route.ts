import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Class, UserRole } from '@/models';
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
    
    const { name } = await request.json();
    
    if (!name) {
      return NextResponse.json(
        { error: 'Class name is required' },
        { status: 400 }
      );
    }
    
    // Update class
    const updatedClass = await Class.findOneAndUpdate(
      { _id: params.id, schoolId: authUser.schoolId },
      { name },
      { new: true }
    );
    
    if (!updatedClass) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Class updated successfully',
      class: {
        id: updatedClass._id,
        name: updatedClass.name,
        schoolId: updatedClass.schoolId,
        updatedAt: updatedClass.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Update class error:', error);
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
    
    // Delete class
    const deletedClass = await Class.findOneAndDelete({
      _id: params.id,
      schoolId: authUser.schoolId
    });
    
    if (!deletedClass) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Class deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete class error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
