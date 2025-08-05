import mongoose, { Document, Schema } from 'mongoose';

// User Role Types
export enum UserRole {
  SUPER_ADMIN = 'superAdmin',
  SCHOOL_ADMIN = 'schoolAdmin',
  TEACHER = 'teacher',
  STUDENT = 'student'
}

// Base User Interface
export interface IUser extends Document {
  id: string;
  pin: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId?: string; // For all users except super admin
  classId?: string; // For students
  createdAt: Date;
  updatedAt: Date;
}

// School Interface
export interface ISchool extends Document {
  name: string;
  adminId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Class Interface
export interface IClass extends Document {
  name: string;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Subject Interface
export interface ISubject extends Document {
  name: string;
  schoolId: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Teacher Assignment Interface
export interface ITeacherAssignment extends Document {
  teacherId: string;
  classId: string;
  subjectId: string;
  schoolId: string;
  createdAt: Date;
}

// Student Assignment Interface
export interface IStudentAssignment extends Document {
  studentId: string;
  classId: string;
  schoolId: string;
  createdAt: Date;
}

// Quiz Interface
export interface IQuiz extends Document {
  title: string;
  description?: string;
  instructions?: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  schoolId: string;
  timeLimit: number; // in minutes
  attemptsAllowed: number; // 0 = unlimited, 1 = single, n = custom
  startDate?: Date;
  endDate?: Date;
  randomizeQuestions: boolean;
  randomizeAnswers: boolean;
  showCorrectAnswers: boolean;
  showScoreImmediately: boolean;
  oneQuestionAtTime: boolean;
  passwordProtected: boolean;
  password?: string;
  questions: Array<{
    id: string;
    type: 'multiple_choice' | 'multiple_select' | 'true_false' | 'short_answer' | 'essay' | 'fill_blank' | 'matching' | 'ordering';
    question: string;
    options?: string[];
    correctAnswers: string[] | number[]; // Support multiple correct answers
    points: number;
    feedback?: string;
    tags?: string[];
    required: boolean;
  }>;
  status: 'draft' | 'published' | 'archived';
  totalPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

// Quiz Attempt Interface
export interface IQuizAttempt extends Document {
  quizId: string;
  studentId: string;
  studentName: string;
  classId: string;
  schoolId: string;
  startTime: Date;
  endTime?: Date;
  submittedAt?: Date;
  answers: Array<{
    questionId: string;
    selectedAnswers: string[] | number[];
    timeSpent?: number;
  }>;
  score?: number;
  totalPoints: number;
  percentage?: number;
  status: 'in_progress' | 'completed' | 'submitted' | 'timed_out';
  timeRemaining?: number;
  flaggedQuestions: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Assignment Interface
export interface IAssignment extends Document {
  title: string;
  description: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  dueDate?: Date;
  totalMarks?: number;
  attachments?: {
    name: string;
    fileName: string;
    size: number;
    type: string;
    uploadedAt: Date;
  }[];
  status: string;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Assignment Submission Interface
export interface IAssignmentSubmission extends Document {
  assignmentId: string;
  studentId: string;
  studentName: string;
  content?: string;
  files: string[];
  status: 'draft' | 'submitted' | 'not_submitted' | 'late';
  submittedAt?: Date;
  grade?: {
    score: number;
    maxPoints: number;
    percentage: number;
    letterGrade: string;
    feedback?: string;
    gradedAt: Date;
    gradedBy: string;
  };
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Announcement Interface
export interface IAnnouncement extends Document {
  title: string;
  content: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'draft' | 'scheduled' | 'sent';
  scheduledDate?: Date;
  sentDate?: Date;
  readBy: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Resource Interface
export interface IResource extends Document {
  title: string;
  description?: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  fileUrl: string;
  fileType: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// User Schema
const UserSchema = new Schema<IUser>({
  id: { type: String, required: true, unique: true },
  pin: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), required: true },
  schoolId: { type: String }, // For all users except super admin
  classId: { type: String } // For students
}, {
  timestamps: true
});

// School Schema
const SchoolSchema = new Schema<ISchool>({
  name: { type: String, required: true },
  adminId: { type: String, required: true, unique: true }
}, {
  timestamps: true
});

// Class Schema
const ClassSchema = new Schema<IClass>({
  name: { type: String, required: true },
  schoolId: { type: String, required: true }
}, {
  timestamps: true
});

// Subject Schema
const SubjectSchema = new Schema<ISubject>({
  name: { type: String, required: true },
  schoolId: { type: String, required: true },
  description: { type: String }
}, {
  timestamps: true
});

// Teacher Assignment Schema
const TeacherAssignmentSchema = new Schema<ITeacherAssignment>({
  teacherId: { type: String, required: true },
  classId: { type: String, required: true },
  subjectId: { type: String, required: true },
  schoolId: { type: String, required: true }
}, {
  timestamps: true
});

// Student Assignment Schema
const StudentAssignmentSchema = new Schema<IStudentAssignment>({
  studentId: { type: String, required: true },
  classId: { type: String, required: true },
  schoolId: { type: String, required: true }
}, {
  timestamps: true
});

// Quiz Schema
const QuizSchema = new Schema<IQuiz>({
  title: { type: String, required: true },
  description: { type: String },
  instructions: { type: String },
  teacherId: { type: String, required: true },
  classId: { type: String, required: true },
  subjectId: { type: String, required: true },
  schoolId: { type: String, required: true },
  timeLimit: { type: Number, required: true },
  attemptsAllowed: { type: Number, default: 1 },
  startDate: { type: Date },
  endDate: { type: Date },
  randomizeQuestions: { type: Boolean, default: false },
  randomizeAnswers: { type: Boolean, default: false },
  showCorrectAnswers: { type: Boolean, default: true },
  showScoreImmediately: { type: Boolean, default: true },
  oneQuestionAtTime: { type: Boolean, default: false },
  passwordProtected: { type: Boolean, default: false },
  password: { type: String },
  questions: [{
    id: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['multiple_choice', 'multiple_select', 'true_false', 'short_answer', 'essay', 'fill_blank', 'matching', 'ordering'],
      required: true 
    },
    question: { type: String, required: true },
    options: [{ type: String }],
    correctAnswers: [{ type: Schema.Types.Mixed }],
    points: { type: Number, required: true, default: 1 },
    feedback: { type: String },
    tags: [{ type: String }],
    required: { type: Boolean, default: true }
  }],
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  totalPoints: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Quiz Attempt Schema
const QuizAttemptSchema = new Schema<IQuizAttempt>({
  quizId: { type: String, required: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  classId: { type: String, required: true },
  schoolId: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  submittedAt: { type: Date },
  answers: [{
    questionId: { type: String, required: true },
    selectedAnswers: [{ type: Schema.Types.Mixed }],
    timeSpent: { type: Number }
  }],
  score: { type: Number },
  totalPoints: { type: Number, required: true },
  percentage: { type: Number },
  status: { 
    type: String, 
    enum: ['in_progress', 'completed', 'submitted', 'timed_out'], 
    default: 'in_progress' 
  },
  timeRemaining: { type: Number },
  flaggedQuestions: [{ type: String }]
}, {
  timestamps: true
});

// Assignment Schema
const AssignmentSchema = new Schema<IAssignment>({
  title: { type: String, required: true },
  description: { type: String },
  teacherId: { type: String, required: true },
  classId: { type: String, required: true },
  subjectId: { type: String, required: true },
  dueDate: { type: Date, required: true },
  totalMarks: { type: Number },
  attachments: [{
    name: { type: String, required: true },
    fileName: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String, required: true },
    uploadedAt: { type: Date, required: true }
  }],
  status: { type: String, enum: ['active', 'completed', 'overdue'], default: 'active' },
  schoolId: { type: String, required: true }
}, {
  timestamps: true
});

// Assignment Submission Schema
const AssignmentSubmissionSchema = new Schema<IAssignmentSubmission>({
  assignmentId: { type: String, required: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  content: { type: String },
  files: [{ type: String }],
  status: { type: String, enum: ['draft', 'submitted', 'not_submitted', 'late'], default: 'not_submitted' },
  submittedAt: { type: Date },
  grade: {
    score: { type: Number },
    maxPoints: { type: Number },
    percentage: { type: Number },
    letterGrade: { type: String },
    feedback: { type: String },
    gradedAt: { type: Date },
    gradedBy: { type: String }
  },
  feedback: { type: String }
}, {
  timestamps: true
});

// Announcement Schema
const AnnouncementSchema = new Schema<IAnnouncement>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  teacherId: { type: String, required: true },
  classId: { type: String, required: true },
  subjectId: { type: String, required: true },
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  status: { type: String, enum: ['draft', 'scheduled', 'sent'], default: 'draft' },
  scheduledDate: { type: Date },
  sentDate: { type: Date },
  readBy: { type: [String], default: [] },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Resource Schema
const ResourceSchema = new Schema<IResource>({
  title: { type: String, required: true },
  description: { type: String },
  teacherId: { type: String, required: true },
  classId: { type: String, required: true },
  subjectId: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Export Models
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const School = mongoose.models.School || mongoose.model<ISchool>('School', SchoolSchema);
export const Class = mongoose.models.Class || mongoose.model<IClass>('Class', ClassSchema);
export const Subject = mongoose.models.Subject || mongoose.model<ISubject>('Subject', SubjectSchema);
export const TeacherAssignment = mongoose.models.TeacherAssignment || mongoose.model<ITeacherAssignment>('TeacherAssignment', TeacherAssignmentSchema);
export const StudentAssignment = mongoose.models.StudentAssignment || mongoose.model<IStudentAssignment>('StudentAssignment', StudentAssignmentSchema);
export const Quiz = mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);
export const QuizAttempt = mongoose.models.QuizAttempt || mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);
export const Assignment = mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema);
export const AssignmentSubmission = mongoose.models.AssignmentSubmission || mongoose.model<IAssignmentSubmission>('AssignmentSubmission', AssignmentSubmissionSchema);
export const Announcement = mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
