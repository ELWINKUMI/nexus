import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Quiz from '@/models/Quiz';
import { Types } from 'mongoose';

interface QuizDocument {
  _id: Types.ObjectId;
  title: string;
  status?: string;
  questions?: QuestionDocument[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface QuestionDocument {
  id: string;
  type: string;
  question: string;
  options?: string[];
  correctAnswers?: string[];
  points?: number;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get all quizzes with full question data
    const quizzes = await Quiz.find({}).lean() as QuizDocument[];
    
    console.log('DEBUG: Total quizzes found:', quizzes.length);
    
    // Log detailed info about each quiz
    quizzes.forEach((quiz, index) => {
      console.log(`\nDEBUG Quiz ${index + 1}:`, {
        id: quiz._id.toString(),
        title: quiz.title,
        questionsCount: quiz.questions?.length || 0,
        questions: quiz.questions?.map((q: QuestionDocument, qIndex: number) => ({
          index: qIndex,
          id: q.id,
          type: q.type,
          question: q.question,
          optionsCount: q.options?.length || 0,
          options: q.options, // Show actual options
          correctAnswers: q.correctAnswers,
          points: q.points
        })) || []
      });
    });

    // Return formatted data for easy inspection
    const debugData = quizzes.map((quiz: QuizDocument) => ({
      _id: quiz._id.toString(),
      title: quiz.title,
      status: quiz.status,
      questionsCount: quiz.questions?.length || 0,
      questions: quiz.questions?.map((q: QuestionDocument) => ({
        id: q.id,
        type: q.type,
        question: q.question,
        optionsCount: q.options?.length || 0,
        options: q.options || [],
        correctAnswers: q.correctAnswers || [],
        points: q.points || 1
      })) || [],
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt
    }));

    return NextResponse.json({
      success: true,
      count: quizzes.length,
      quizzes: debugData
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch quiz data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
