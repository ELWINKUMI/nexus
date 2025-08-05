import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  instructions: { type: String },
  teacherId: { type: String, required: true },
  subjectId: { type: String, required: true },
  classId: { type: String, required: true },
  schoolId: { type: String, required: true },
  timeLimit: { type: Number, default: 30 }, // in minutes
  attemptsAllowed: { type: Number, default: 1 },
  startDate: { type: Date },
  endDate: { type: Date },
  randomizeQuestions: { type: Boolean, default: false },
  randomizeAnswers: { type: Boolean, default: false },
  showCorrectAnswers: { type: Boolean, default: true },
  showScoreImmediately: { type: Boolean, default: true },
  oneQuestionAtTime: { type: Boolean, default: false },
  passwordProtected: { type: Boolean, default: false },
  password: { type: String },
  questions: [{
    id: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['multiple_choice', 'multiple_select', 'true_false', 'short_answer', 'essay', 'fill_blank', 'matching', 'ordering'],
      required: true 
    },
    question: { type: String, required: true },
    options: [{ type: String }],
    correctAnswers: [{ type: mongoose.Schema.Types.Mixed }], // Can be strings or numbers
    points: { type: Number, default: 1 },
    feedback: { type: String },
    tags: [{ type: String }],
    required: { type: Boolean, default: true }
  }],
  status: { 
    type: String, 
    enum: ['draft', 'published', 'active', 'inactive'], 
    default: 'draft' 
  },
  totalPoints: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);
