import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { User, Class, TeacherAssignment, Subject, Assignment, Quiz, Announcement } from '@/models';
import { Resource } from '@/models/Resource';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token.value, JWT_SECRET) as any;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const teacher = await User.findOne({ 
      id: decoded.id, 
      role: 'teacher' 
    });
    
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Get teacher assignments
    const assignments = await TeacherAssignment.find({ teacherId: teacher.id }).lean();

    // Get unique class and subject IDs
    const classIds = [...new Set(assignments.map(a => a.classId))];
    const subjectIds = [...new Set(assignments.map(a => a.subjectId))];

    // Fetch classes and subjects separately
    const classes = await Class.find({ _id: { $in: classIds } }).lean();
    const subjectDocuments = await Subject.find({ _id: { $in: subjectIds } }).lean();

    // Create lookup maps
    const classMap = new Map(classes.map(c => [c._id?.toString(), c]));
    const subjectMap = new Map(subjectDocuments.map(s => [s._id?.toString(), s]));

    // Group assignments by subject
    const subjectsMap = new Map();
    
    for (const assignment of assignments) {
      // Get subject data from the map
      const subjectData = subjectMap.get(assignment.subjectId);
      const subjectName = subjectData?.name || 'Unknown Subject';
      
      if (!subjectsMap.has(subjectName)) {
        subjectsMap.set(subjectName, {
          id: subjectName.toLowerCase().replace(/\s+/g, '-'),
          name: subjectName,
          subjectId: assignment.subjectId, // Store subjectId for content queries
          classes: [],
          totalStudents: 0,
          assignmentCount: 0,
          quizCount: 0,
          announcementCount: 0,
          resourceCount: 0
        });
      }

      const subjectInfo = subjectsMap.get(subjectName);

      // Add class information
      const classData = classMap.get(assignment.classId);
      if (classData) {
        // Get student count for this class
        const studentCount = await User.countDocuments({ 
          classId: assignment.classId,
          role: 'student' 
        });

        const classInfo = {
          id: classData._id,
          name: classData.name,
          grade: classData.grade || 'N/A',
          studentCount: studentCount
        };
        
        subjectInfo.classes.push(classInfo);
        subjectInfo.totalStudents += studentCount;
      }
    }

    // Now fetch real content counts for each subject
    for (const [subjectName, subjectInfo] of subjectsMap) {
      // Get real assignment count
      const assignmentCount = await Assignment.countDocuments({
        teacherId: teacher.id,
        subjectId: subjectInfo.subjectId,
        isActive: true
      });

      // Get real quiz count
      const quizCount = await Quiz.countDocuments({
        teacherId: teacher.id,
        subjectId: subjectInfo.subjectId,
        isActive: true
      });

      // Get real announcement count
      const announcementCount = await Announcement.countDocuments({
        teacherId: teacher.id,
        subjectId: subjectInfo.subjectId,
        isActive: true
      });

      // Get real resource count
      const resourceCount = await Resource.countDocuments({
        teacherId: teacher.id,
        subjectId: subjectInfo.subjectId,
        isActive: true
      });

      // Update with real counts
      subjectInfo.assignmentCount = assignmentCount;
      subjectInfo.quizCount = quizCount;
      subjectInfo.announcementCount = announcementCount;
      subjectInfo.resourceCount = resourceCount;

      // Keep subjectId as _id for frontend compatibility
      subjectInfo._id = subjectInfo.subjectId;
      // Remove the original subjectId field
      delete subjectInfo.subjectId;
    }

    const subjects = Array.from(subjectsMap.values());

    return NextResponse.json(subjects);

  } catch (error) {
    console.error('Error fetching teacher subjects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
