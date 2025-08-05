import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { Announcement } from '@/models';

interface DecodedToken {
  id: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Update announcement
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Get teacher ID from JWT token
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    const teacherId = decoded.id;

    const body = await request.json();
    const {
      title,
      content,
      classId,
      subjectId,
      priority,
      scheduledDate,
      status,
      sentDate
    } = body;

    // Find and update announcement
    const announcement = await Announcement.findOneAndUpdate(
      { _id: params.id, teacherId },
      {
        title,
        content,
        classId: classId || undefined,
        subjectId: subjectId || undefined,
        priority,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        sentDate: sentDate ? new Date(sentDate) : undefined,
        status,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!announcement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    // Populate the response
    await announcement.populate('classId', 'name studentCount');
    await announcement.populate('subjectId', 'name');

    const response = {
      ...announcement.toObject(),
      className: announcement.classId?.name,
      subjectName: announcement.subjectId?.name,
      totalRecipients: announcement.classId?.studentCount || 0
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating announcement:', error);
    return NextResponse.json(
      { error: 'Failed to update announcement' },
      { status: 500 }
    );
  }
}

// Delete announcement
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Get teacher ID from JWT token
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const teacherId = decoded.id;

    // Find and delete announcement
    const announcement = await Announcement.findOneAndDelete({
      _id: params.id,
      teacherId
    });

    if (!announcement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json(
      { error: 'Failed to delete announcement' },
      { status: 500 }
    );
  }
}
