// Script to update existing quizzes and quiz attempts to use option strings for correctAnswers and student answers
// Run with: node scripts/fix-quiz-attempts-answers.js

const mongoose = require('mongoose');
const Quiz = require('../src/models/Quiz').default || require('../src/models/Quiz');
const QuizAttempt = require('../src/models/QuizAttempt').default || require('../src/models/QuizAttempt');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nexus';

async function fixQuizzes() {
  const quizzes = await Quiz.find({ 'questions.type': { $in: ['multiple_choice', 'multiple_select'] } });
  let updated = 0;
  for (const quiz of quizzes) {
    let changed = false;
    for (const q of quiz.questions) {
      if ((q.type === 'multiple_choice' || q.type === 'multiple_select') && Array.isArray(q.correctAnswers)) {
        // If correctAnswers are indices, convert to option strings
        if (typeof q.correctAnswers[0] === 'number') {
          q.correctAnswers = q.correctAnswers.map(idx => q.options[idx]);
          changed = true;
        }
      }
    }
    if (changed) {
      await quiz.save();
      updated++;
    }
  }
  console.log(`Updated ${updated} quizzes.`);
}

async function fixQuizAttempts() {
  const attempts = await QuizAttempt.find({ 'answers': { $exists: true, $ne: [] } });
  let updated = 0;
  for (const attempt of attempts) {
    let changed = false;
    for (const ans of attempt.answers) {
      // If correctAnswer is an index, convert to string using options from quiz
      if ((ans.question && typeof ans.correctAnswer?.[0] === 'number') || typeof ans.correctAnswer === 'number') {
        const quiz = await Quiz.findOne({ 'questions.id': ans.question });
        if (quiz) {
          const q = quiz.questions.find(q => q.id === ans.question);
          if (q && q.options) {
            if (Array.isArray(ans.correctAnswer)) {
              ans.correctAnswer = ans.correctAnswer.map(idx => q.options[idx]);
            } else {
              ans.correctAnswer = [q.options[ans.correctAnswer]];
            }
            changed = true;
          }
        }
      }
      // If studentAnswer is an index, convert to string using options from quiz
      if ((ans.question && typeof ans.studentAnswer?.[0] === 'number') || typeof ans.studentAnswer === 'number') {
        const quiz = await Quiz.findOne({ 'questions.id': ans.question });
        if (quiz) {
          const q = quiz.questions.find(q => q.id === ans.question);
          if (q && q.options) {
            if (Array.isArray(ans.studentAnswer)) {
              ans.studentAnswer = ans.studentAnswer.map(idx => q.options[idx]);
            } else {
              ans.studentAnswer = [q.options[ans.studentAnswer]];
            }
            changed = true;
          }
        }
      }
    }
    if (changed) {
      await attempt.save();
      updated++;
    }
  }
  console.log(`Updated ${updated} quiz attempts.`);
}

async function main() {
  await mongoose.connect(MONGO_URI);
  await fixQuizzes();
  await fixQuizAttempts();
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
