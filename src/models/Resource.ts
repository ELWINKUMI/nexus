import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: String,
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: false
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: false
  },
  visibility: {
    type: String,
    enum: ['public', 'class', 'subject'],
    default: 'public'
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
resourceSchema.index({ uploadedBy: 1, uploadedAt: -1 });
resourceSchema.index({ classId: 1, visibility: 1 });
resourceSchema.index({ subjectId: 1, visibility: 1 });
resourceSchema.index({ tags: 1 });
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const Resource = mongoose.models.Resource || mongoose.model('Resource', resourceSchema);
