import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '@/models';

const JWT_SECRET = process.env.JWT_SECRET || 'nexus-lms-secret-key';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId?: string;
}

// Generate sequential ID for school admins
export async function generateSchoolAdminId(): Promise<string> {
  const lastAdmin = await User.findOne({ role: UserRole.SCHOOL_ADMIN })
    .sort({ createdAt: -1 });
  
  if (!lastAdmin) {
    return '10000001'; // First school admin ID
  }
  
  const lastId = parseInt(lastAdmin.id);
  return (lastId + 1).toString().padStart(8, '0');
}

// Generate sequential ID for teachers (8 digits starting with T)
export async function generateTeacherId(): Promise<string> {
  const lastTeacher = await User.findOne({ role: UserRole.TEACHER })
    .sort({ createdAt: -1 });
  
  if (!lastTeacher) {
    return 'T0000001'; // First teacher ID
  }
  
  const lastId = parseInt(lastTeacher.id.substring(1)); // Remove 'T' prefix
  const newId = (lastId + 1).toString().padStart(7, '0');
  return `T${newId}`;
}

// Generate sequential ID for students (8 digits starting with ST)
export async function generateStudentId(): Promise<string> {
  const lastStudent = await User.findOne({ role: UserRole.STUDENT })
    .sort({ createdAt: -1 });
  
  if (!lastStudent) {
    return 'ST000001'; // First student ID
  }
  
  const lastId = parseInt(lastStudent.id.substring(2)); // Remove 'ST' prefix
  const newId = (lastId + 1).toString().padStart(6, '0');
  return `ST${newId}`;
}

// Generate 5-digit PIN
export function generatePin(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

// Hash PIN
export async function hashPin(pin: string): Promise<string> {
  const saltRounds = 12;
  return await bcryptjs.hash(pin, saltRounds);
}

// Compare PIN
export async function comparePin(pin: string, hashedPin: string): Promise<boolean> {
  return await bcryptjs.compare(pin, hashedPin);
}

// Generate JWT token
export function generateToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
}

// Verify JWT token
export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch (error) {
    return null;
  }
}

// Generate student/teacher IDs based on school (DEPRECATED - use generateTeacherId/generateStudentId instead)
export async function generateUserIdForSchool(schoolId: string, role: UserRole): Promise<string> {
  if (role === UserRole.TEACHER) {
    return await generateTeacherId();
  } else if (role === UserRole.STUDENT) {
    return await generateStudentId();
  }
  
  // Fallback to old method for compatibility
  const prefix = role === UserRole.TEACHER ? 'T' : 'S';
  const lastUser = await User.findOne({ 
    role: role,
    id: new RegExp(`^${prefix}${schoolId}`)
  }).sort({ createdAt: -1 });
  
  if (!lastUser) {
    return `${prefix}${schoolId}001`; // First user for this school
  }
  
  const lastSequence = parseInt(lastUser.id.slice(-3));
  const newSequence = (lastSequence + 1).toString().padStart(3, '0');
  return `${prefix}${schoolId}${newSequence}`;
}
