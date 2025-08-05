import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User, TeacherAssignment, Class, Subject, UserRole } from '@/models';
import { verifyToken, generateTeacherId, generatePin, hashPin } from '@/lib/auth';

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
    
    const { name, email, subjectIds, classIds } = await request.json();
    
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Teacher name and email are required' },
        { status: 400 }
      );
    }
    
    // Validate that provided class and subject IDs exist and belong to the school
    if (classIds && classIds.length > 0) {
      const validClasses = await Class.find({
        _id: { $in: classIds },
        schoolId: authUser.schoolId
      });
      
      if (validClasses.length !== classIds.length) {
        return NextResponse.json(
          { error: 'Some selected classes are invalid' },
          { status: 400 }
        );
      }
    }
    
    if (subjectIds && subjectIds.length > 0) {
      const validSubjects = await Subject.find({
        _id: { $in: subjectIds },
        schoolId: authUser.schoolId
      });
      
      if (validSubjects.length !== subjectIds.length) {
        return NextResponse.json(
          { error: 'Some selected subjects are invalid' },
          { status: 400 }
        );
      }
    }
    
    // Generate teacher ID and PIN
    const teacherId = await generateTeacherId();
    const teacherPin = generatePin();
    const hashedPin = await hashPin(teacherPin);
    
    // Create teacher user
    const teacher = new User({
      id: teacherId,
      pin: hashedPin,
      name,
      email,
      role: UserRole.TEACHER,
      schoolId: authUser.schoolId
    });
    
    await teacher.save();
    
    // Create teacher assignments for each class-subject combination
    const assignments = [];
    if (classIds && classIds.length > 0 && subjectIds && subjectIds.length > 0) {
      for (const classId of classIds) {
        for (const subjectId of subjectIds) {
          const assignment = new TeacherAssignment({
            teacherId,
            classId,
            subjectId,
            schoolId: authUser.schoolId
          });
          await assignment.save();
          assignments.push(assignment);
        }
      }
    }
    
    return NextResponse.json({
      message: 'Teacher created successfully',
      teacher: {
        id: teacherId,
        pin: teacherPin, // Return plain PIN for initial setup
        name,
        email,
        role: UserRole.TEACHER,
        assignments: assignments.length
      }
    });
    
  } catch (error) {
    console.error('Create teacher error:', error);
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
    
    // Get all teachers for the school via assignments
    const assignments = await TeacherAssignment.find({ schoolId: authUser.schoolId });
    const teacherIds = [...new Set(assignments.map(a => a.teacherId))];
    
    // Also get teachers who might not have assignments yet but were created for this school
    // We'll use a different approach - get all teachers and filter by assignments
    const allTeachers = await User.find({ role: UserRole.TEACHER }).sort({ createdAt: -1 });
    
    // Filter teachers that either have assignments in this school
    const schoolTeachers = allTeachers.filter(teacher => 
      teacherIds.includes(teacher.id)
    );
    
    // Get assignment details for each teacher
    const teachersWithAssignments = await Promise.all(
      schoolTeachers.map(async (teacher) => {
        const teacherAssignments = assignments.filter(a => a.teacherId === teacher.id);
        const classIds = [...new Set(teacherAssignments.map(a => a.classId))];
        const subjectIds = [...new Set(teacherAssignments.map(a => a.subjectId))];
        
        return {
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          pin: '****', // Hide PIN for security
          createdAt: teacher.createdAt,
          classIds: classIds,
          subjectIds: subjectIds,
          assignmentCount: teacherAssignments.length
        };
      })
    );
    
    return NextResponse.json({ teachers: teachersWithAssignments });
    
  } catch (error) {
    console.error('Get teachers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
