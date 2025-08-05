import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { unlink } from 'fs/promises';
import path from 'path';
import { Resource } from '@/models/Resource';

// Update resource
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Get teacher ID from JWT token
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const teacherId = decoded.userId;

    const body = await request.json();
    const {
      title,
      description,
      classId,
      subjectId,
      visibility,
      tags
    } = body;

    // Find and update resource
    const resource = await Resource.findOneAndUpdate(
      { _id: params.id, uploadedBy: teacherId },
      {
        title,
        description,
        classId: classId || undefined,
        subjectId: subjectId || undefined,
        visibility,
        tags: tags || []
      },
      { new: true }
    );

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Populate the response
    await resource.populate('classId', 'name studentCount');
    await resource.populate('subjectId', 'name');

    const response = {
      ...resource.toObject(),
      className: resource.classId?.name,
      subjectName: resource.subjectId?.name
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating resource:', error);
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    );
  }
}

// Delete resource
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Get teacher ID from JWT token
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const teacherId = decoded.userId;

    // Find and delete resource
    const resource = await Resource.findOneAndDelete({
      _id: params.id,
      uploadedBy: teacherId
    });

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Delete the physical file
    try {
      const filePath = path.join(process.cwd(), 'public', 'uploads', 'resources', resource.filename);
      await unlink(filePath);
    } catch (fileError) {
      console.warn('Could not delete physical file:', fileError);
      // Continue even if file deletion fails
    }

    return NextResponse.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    );
  }
}

// Track download
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    // Dynamically import the Resource model
    if (!Resource) {
      const { Resource: ResourceModel } = await import('@/models/Resource');
      Resource = ResourceModel;
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'download') {
      // Increment download count
      const resource = await Resource.findByIdAndUpdate(
        params.id,
        { $inc: { downloadCount: 1 } },
        { new: true }
      );

      if (!resource) {
        return NextResponse.json(
          { error: 'Resource not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ downloadCount: resource.downloadCount });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating resource:', error);
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    );
  }
}
