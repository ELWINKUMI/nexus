import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  teacherId: { type: String, required: true },
  subjectId: { type: String, required: true },
  classId: { type: String, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'completed', 'overdue'], default: 'active' },
  schoolId: { type: String, required: true }
}, {
  timestamps: true
});

export default mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema);
