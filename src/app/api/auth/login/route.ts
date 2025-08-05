import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User, School } from '@/models';
import { comparePin, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { id, pin } = await request.json();
    
    if (!id || !pin) {
      return NextResponse.json(
        { error: 'ID and PIN are required' },
        { status: 400 }
      );
    }
    
    // Find user by ID
    const user = await User.findOne({ id });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Verify PIN
    const isValidPin = await comparePin(pin, user.pin);
    
    if (!isValidPin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Get school information for school admins
    let schoolId = undefined;
    let schoolName = undefined;
    
    if (user.role === 'schoolAdmin') {
      const school = await School.findOne({ adminId: user.id });
      if (school) {
        schoolId = school._id.toString();
        schoolName = school.name;
      }
    }
    
    // Generate JWT token
    const authUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolId
    };
    
    const token = generateToken(authUser);
    
    // Create response
    const response = NextResponse.json({
      user: {
        ...authUser,
        schoolName
      },
      token
    });
    
    // Set cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400 // 24 hours
    });
    
    return response;
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
