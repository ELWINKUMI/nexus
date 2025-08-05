import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Class, UserRole } from '@/models';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
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
    
    // Create new class
    const newClass = new Class({
      name,
      schoolId: authUser.schoolId
    });
    
    await newClass.save();
    
    return NextResponse.json({
      message: 'Class created successfully',
      class: {
        id: newClass._id,
        name: newClass.name,
        schoolId: newClass.schoolId,
        createdAt: newClass.createdAt
      }
    });
    
  } catch (error) {
    console.error('Create class error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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
    
    // Get all classes for the school
    const classes = await Class.find({ schoolId: authUser.schoolId })
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ 
      classes: classes.map(c => ({
        id: c._id.toString(),
        name: c.name,
        schoolId: c.schoolId,
        createdAt: c.createdAt
      }))
    });
    
  } catch (error) {
    console.error('Get classes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
