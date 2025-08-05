import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User, StudentAssignment, UserRole } from '@/models';
import { verifyToken, generateStudentId, generatePin, hashPin } from '@/lib/auth';

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
    
    const { name, email, classId } = await request.json();
    
    if (!name || !email || !classId) {
      return NextResponse.json(
        { error: 'Name, email, and class are required' },
        { status: 400 }
      );
    }
    
    // Generate student ID and PIN
    const studentId = await generateStudentId();
    const studentPin = generatePin();
    const hashedPin = await hashPin(studentPin);
    
    // Create student user
    const student = new User({
      id: studentId,
      pin: hashedPin,
      name,
      email,
      role: UserRole.STUDENT,
      schoolId: authUser.schoolId,
      classId: classId
    });
    
    await student.save();
    
    // Create student assignment to class
    const assignment = new StudentAssignment({
      studentId,
      classId,
      schoolId: authUser.schoolId
    });
    
    await assignment.save();
    
    return NextResponse.json({
      message: 'Student created successfully',
      student: {
        id: studentId,
        pin: studentPin, // Return plain PIN for initial setup
        name,
        email,
        role: UserRole.STUDENT,
        classId
      }
    });
    
  } catch (error) {
    console.error('Create student error:', error);
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
    
    // Get all students for the school via assignments
    const assignments = await StudentAssignment.find({ schoolId: authUser.schoolId });
    const studentIds = assignments.map(a => a.studentId);
    
    const students = await User.find({ 
      id: { $in: studentIds },
      role: UserRole.STUDENT 
    }).sort({ createdAt: -1 });
    
    // Get assignment details for each student
    const studentsWithClasses = await Promise.all(
      students.map(async (student) => {
        const assignment = assignments.find(a => a.studentId === student.id);
        
        return {
          id: student.id,
          name: student.name,
          email: student.email,
          pin: '****', // Hide PIN for security
          createdAt: student.createdAt,
          classId: assignment ? assignment.classId : null
        };
      })
    );
    
    return NextResponse.json({ students: studentsWithClasses });
    
  } catch (error) {
    console.error('Get students error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
