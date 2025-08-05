import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teacherId: { type: String, required: true },
  classIds: [{ type: String }],
  color: { type: String, default: '#3b82f6' },
  schoolId: { type: String, required: true }
}, {
  timestamps: true
});

export default mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
