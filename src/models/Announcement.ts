import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
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
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sent'],
    default: 'draft'
  },
  scheduledDate: {
    type: Date,
    required: false
  },
  sentDate: {
    type: Date,
    required: false
  },
  readBy: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    type: String
  }]
}, {
  timestamps: true
});

// Index for efficient queries
announcementSchema.index({ teacherId: 1, createdAt: -1 });
announcementSchema.index({ classId: 1, status: 1 });
announcementSchema.index({ scheduledDate: 1, status: 1 });

export const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);
