import { Document } from 'mongoose';

export interface IResource extends Document {
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  classId?: string;
  subjectId?: string;
  tags: string[];
  downloadCount: number;
  visibility: 'public' | 'private' | 'class' | 'subject';
  uploadedAt: Date;
  updatedAt: Date;
}

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  teacherId: string;
  classId?: string;
  subjectId?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'published' | 'scheduled';
  scheduledDate?: Date;
  readBy: Array<{
    studentId: string;
    readAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
