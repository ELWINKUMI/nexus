import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { User, Announcement, Class, Subject } from '@/models';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

interface DecodedToken {
  id: string;
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Get all announcements for a teacher
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get teacher ID from JWT token
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as DecodedToken;
    const teacherId = decoded.id;

    const announcements = await Announcement.find({ teacherId })
      .populate('classId', 'name studentCount')
      .populate('subjectId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // Add recipient count and format response
    const formattedAnnouncements = announcements.map((announcement: any) => ({
      ...announcement,
      className: announcement.classId?.name,
      subjectName: announcement.subjectId?.name,
      totalRecipients: announcement.classId?.studentCount || 0,
      priority: announcement.priority || 'normal',
      status: announcement.status || 'draft'
    }));

    return NextResponse.json(formattedAnnouncements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

// Create new announcement
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Get teacher ID from JWT token
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as DecodedToken;
    const teacherId = decoded.id;

    const body = await request.json();
    console.log('Received announcement data:', body);
    
    const {
      title,
      content,
      classId,
      subjectId,
      priority = 'normal',
      scheduledDate,
      status = 'draft',
      sentDate
    } = body;

    console.log('Extracted status:', status);
    console.log('Extracted priority:', priority);

    // Validation
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Create announcement
    const announcement = new Announcement({
      title,
      content,
      classId: classId || undefined,
      subjectId: subjectId || undefined,
      priority,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      sentDate: sentDate ? new Date(sentDate) : undefined,
      status,
      teacherId,
      readBy: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedAnnouncement = await announcement.save();

    // Populate the response
    await savedAnnouncement.populate('classId', 'name studentCount');
    await savedAnnouncement.populate('subjectId', 'name');

    const response = {
      ...savedAnnouncement.toObject(),
      className: savedAnnouncement.classId?.name,
      subjectName: savedAnnouncement.subjectId?.name,
      totalRecipients: savedAnnouncement.classId?.studentCount || 0
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    );
  }
}
