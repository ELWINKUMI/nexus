import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Subject, UserRole } from '@/models';
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
    
    const { name, description } = await request.json();
    
    if (!name) {
      return NextResponse.json(
        { error: 'Subject name is required' },
        { status: 400 }
      );
    }
    
    // Create new subject
    const newSubject = new Subject({
      name,
      description,
      schoolId: authUser.schoolId
    });
    
    await newSubject.save();
    
    return NextResponse.json({
      message: 'Subject created successfully',
      subject: {
        id: newSubject._id,
        name: newSubject.name,
        description: newSubject.description,
        schoolId: newSubject.schoolId,
        createdAt: newSubject.createdAt
      }
    });
    
  } catch (error) {
    console.error('Create subject error:', error);
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
    
    // Get all subjects for the school
    const subjects = await Subject.find({ schoolId: authUser.schoolId })
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ 
      subjects: subjects.map(s => ({
        id: s._id.toString(),
        name: s.name,
        description: s.description,
        schoolId: s.schoolId,
        createdAt: s.createdAt
      }))
    });
    
  } catch (error) {
    console.error('Get subjects error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
