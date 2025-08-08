import mongoose, { Schema, Document, models } from 'mongoose';

export interface IQuizAttempt extends Document {
  quizId: string;
  studentName: string;
  studentId: string;
  totalPoints: number;
  submittedAt: Date;
  status: string;
  // Add more fields as needed (e.g., answers, feedback, etc.)
}

const QuizAttemptSchema = new Schema<IQuizAttempt>({
  quizId: { type: String, required: true },
  studentName: { type: String, required: true },
  studentId: { type: String, required: true },
  totalPoints: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, required: true },
  answers: [
    {
      question: { type: String, required: true },
      studentAnswer: { type: Schema.Types.Mixed, required: true },
      correctAnswer: { type: Schema.Types.Mixed, required: true },
      isCorrect: { type: Boolean, required: true },
      points: { type: Number, required: true },
    }
  ],
});

export default models.QuizAttempt || mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);
