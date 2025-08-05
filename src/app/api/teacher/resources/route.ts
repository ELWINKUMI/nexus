import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { User, Class, Subject } from '@/models';
import { Resource } from '@/models/Resource';
import { writeFile } from 'fs/promises';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Get all resources for a teacher
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get teacher ID from JWT token
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    const teacherId = decoded.id;

    const resources = await Resource.find({ uploadedBy: teacherId })
      .sort({ uploadedAt: -1 })
      .lean();

    // Get class and subject information for resources
    const classIds = [...new Set(resources.map(r => r.classId).filter(Boolean))];
    const subjectIds = [...new Set(resources.map(r => r.subjectId).filter(Boolean))];

    const [classes, subjects] = await Promise.all([
      classIds.length > 0 ? Class.find({ _id: { $in: classIds } }).lean() : [],
      subjectIds.length > 0 ? Subject.find({ _id: { $in: subjectIds } }).lean() : []
    ]);

    const classMap = new Map(classes.map(c => [c._id.toString(), c]));
    const subjectMap = new Map(subjects.map(s => [s._id.toString(), s]));

    // Format response
    const formattedResources = resources.map((resource: any) => {
      const classInfo = resource.classId ? classMap.get(resource.classId.toString()) : null;
      const subjectInfo = resource.subjectId ? subjectMap.get(resource.subjectId.toString()) : null;
      
      return {
        ...resource,
        className: classInfo?.name,
        subjectName: subjectInfo?.name
      };
    });

    return NextResponse.json(formattedResources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

// Upload new resource
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Get teacher ID from JWT token
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    const teacherId = decoded.id;

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const classId = formData.get('classId') as string;
    const subjectId = formData.get('subjectId') as string;
    const visibility = formData.get('visibility') as string;
    const tagsString = formData.get('tags') as string;

    if (!file || !title) {
      return NextResponse.json(
        { error: 'File and title are required' },
        { status: 400 }
      );
    }

    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Maximum 100MB allowed.' },
        { status: 400 }
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'resources');
    const filePath = path.join(uploadDir, filename);

    // Ensure upload directory exists
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Parse tags
    let tags = [];
    try {
      tags = tagsString ? JSON.parse(tagsString) : [];
    } catch (e) {
      tags = [];
    }

    // Create resource record
    const resource = new Resource({
      title,
      description: description || '',
      filename,
      originalName: file.name,
      fileUrl: `/uploads/resources/${filename}`,
      fileType: file.name.split('.').pop()?.toLowerCase() || '',
      fileSize: file.size,
      mimeType: file.type,
      classId: classId || undefined,
      subjectId: subjectId || undefined,
      visibility: visibility || 'public',
      downloadCount: 0,
      uploadedBy: teacherId,
      uploadedAt: new Date(),
      tags
    });

    const savedResource = await resource.save();

    // Get class and subject information for response
    const [classInfo, subjectInfo] = await Promise.all([
      savedResource.classId ? Class.findById(savedResource.classId).lean() : null,
      savedResource.subjectId ? Subject.findById(savedResource.subjectId).lean() : null
    ]);

    const response = {
      ...savedResource.toObject(),
      className: classInfo?.name,
      subjectName: subjectInfo?.name
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error uploading resource:', error);
    return NextResponse.json(
      { error: 'Failed to upload resource' },
      { status: 500 }
    );
  }
}
