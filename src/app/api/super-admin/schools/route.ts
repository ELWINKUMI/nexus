import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User, School, UserRole } from '@/models';
import { generateSchoolAdminId, generatePin, hashPin, verifyToken } from '@/lib/auth';

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
    if (!authUser || authUser.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Forbidden: Super Admin access required' },
        { status: 403 }
      );
    }
    
    const { schoolName, adminName, adminEmail } = await request.json();
    
    if (!schoolName || !adminName || !adminEmail) {
      return NextResponse.json(
        { error: 'School name, admin name, and admin email are required' },
        { status: 400 }
      );
    }
    
    // Generate sequential ID and PIN for school admin
    const adminId = await generateSchoolAdminId();
    const adminPin = generatePin();
    const hashedPin = await hashPin(adminPin);
    
    // Create school admin user
    const schoolAdmin = new User({
      id: adminId,
      pin: hashedPin,
      name: adminName,
      email: adminEmail,
      role: UserRole.SCHOOL_ADMIN
    });
    
    await schoolAdmin.save();
    
    // Create school
    const school = new School({
      name: schoolName,
      adminId: adminId
    });
    
    await school.save();
    
    // Update school admin with schoolId
    schoolAdmin.schoolId = school._id.toString();
    await schoolAdmin.save();
    
    return NextResponse.json({
      message: 'School and admin created successfully',
      school: {
        id: school._id,
        name: school.name,
        admin: {
          id: adminId,
          pin: adminPin, // Return plain PIN for initial setup
          name: adminName,
          email: adminEmail
        }
      }
    });
    
  } catch (error) {
    console.error('Create school error:', error);
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
    if (!authUser || authUser.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Forbidden: Super Admin access required' },
        { status: 403 }
      );
    }
    
    // Get all schools with admin details
    const schools = await School.find().sort({ createdAt: -1 });
    const schoolsWithAdmins = await Promise.all(
      schools.map(async (school) => {
        const admin = await User.findOne({ id: school.adminId });
        return {
          id: school._id,
          name: school.name,
          createdAt: school.createdAt,
          admin: admin ? {
            id: admin.id,
            name: admin.name,
            email: admin.email
          } : null
        };
      })
    );
    
    return NextResponse.json({ schools: schoolsWithAdmins });
    
  } catch (error) {
    console.error('Get schools error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
