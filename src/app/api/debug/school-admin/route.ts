import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;
    
    console.log('DEBUG: Token found:', !!token);
    console.log('DEBUG: Token value:', token ? token.substring(0, 20) + '...' : 'none');
    
    if (!token) {
      return NextResponse.json({
        debug: 'No token found',
        cookies: Object.fromEntries(request.cookies.entries())
      });
    }
    
    // Verify token
    const authUser = verifyToken(token);
    console.log('DEBUG: Auth user:', authUser);
    
    if (!authUser) {
      return NextResponse.json({
        debug: 'Token verification failed',
        token: token ? token.substring(0, 20) + '...' : 'none'
      });
    }
    
    // Check role
    const isSchoolAdmin = authUser.role === UserRole.SCHOOL_ADMIN;
    console.log('DEBUG: User role:', authUser.role);
    console.log('DEBUG: Expected role:', UserRole.SCHOOL_ADMIN);
    console.log('DEBUG: Is school admin:', isSchoolAdmin);
    
    return NextResponse.json({
      debug: 'Authentication check complete',
      authUser: {
        id: authUser.id,
        name: authUser.name,
        role: authUser.role,
        schoolId: authUser.schoolId
      },
      userRoleEnum: UserRole.SCHOOL_ADMIN,
      isSchoolAdmin,
      allUserRoles: Object.values(UserRole)
    });
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      debug: 'Error occurred',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
