import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Quiz from '@/models/Quiz';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get quiz ID from query params
    const url = new URL(request.url);
    const quizId = url.searchParams.get('id');
    
    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID required' }, { status: 400 });
    }
    
    const quiz = await Quiz.findById(quizId).lean();
    
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Transform questions for student view
    const questionsForStudent = quiz.questions.map((q, index) => ({
      id: q.id,
      type: q.type,
      question: q.question,
      options: q.options || [],
      points: q.points || 1,
      index: index
    }));

    console.log('TEST QUIZ DATA:');
    console.log('Quiz ID:', quizId);
    console.log('Questions count:', questionsForStudent.length);
    
    questionsForStudent.forEach((q, index) => {
      console.log(`Question ${index + 1}:`, {
        type: q.type,
        question: q.question,
        optionsCount: q.options.length,
        options: q.options
      });
    });

    return NextResponse.json({
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        questions: questionsForStudent
      }
    });

  } catch (error) {
    console.error('Test quiz error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch quiz',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
