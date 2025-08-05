import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  grade: { type: String },
  teacherId: { type: String, required: true },
  students: { type: Number, default: 0 },
  subjectIds: [{ type: String }],
  schoolId: { type: String, required: true }
}, {
  timestamps: true
});

export default mongoose.models.Class || mongoose.model('Class', classSchema);
