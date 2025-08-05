// Test script to validate our API fixes
// Run this with: node test-api.js

const testQuizAPI = async () => {
  try {
    console.log('Testing Student Quiz API...');
    
    // Test the quiz API endpoint
    const response = await fetch('http://localhost:3001/api/student/quizzes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: In real test, you'd need proper authentication cookies
      }
    });
    
    console.log('Quiz API Status:', response.status);
    
    if (response.ok) {
      const quizzes = await response.json();
      console.log('Quiz API Response Sample:', quizzes.slice(0, 1));
      
      // Check if dates are properly handled
      if (quizzes.length > 0) {
        const firstQuiz = quizzes[0];
        console.log('First quiz dueDate:', firstQuiz.dueDate);
        console.log('Is dueDate null or valid:', firstQuiz.dueDate === null || !isNaN(new Date(firstQuiz.dueDate).getTime()));
      }
    }
  } catch (error) {
    console.error('Quiz API Test Error:', error.message);
  }
};

const testAssignmentAPI = async () => {
  try {
    console.log('\nTesting Student Assignment API...');
    
    // Test the assignment API endpoint
    const response = await fetch('http://localhost:3001/api/student/assignments', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: In real test, you'd need proper authentication cookies
      }
    });
    
    console.log('Assignment API Status:', response.status);
    
    if (response.ok) {
      const assignments = await response.json();
      console.log('Assignment API Response Sample:', assignments.slice(0, 1));
      
      // Check if assignments have proper structure
      if (assignments.length > 0) {
        const firstAssignment = assignments[0];
        console.log('First assignment structure:', {
          id: firstAssignment.id,
          title: firstAssignment.title,
          status: firstAssignment.status,
          dueDate: firstAssignment.dueDate
        });
      }
    }
  } catch (error) {
    console.error('Assignment API Test Error:', error.message);
  }
};

// Only run if this file is executed directly
if (require.main === module) {
  testQuizAPI();
  testAssignmentAPI();
}

module.exports = { testQuizAPI, testAssignmentAPI };
