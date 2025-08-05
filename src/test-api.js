// Test the API responses to verify field mapping
async function testAPIs() {
  try {
    // Test classes API
    const classesResponse = await fetch('/api/teacher/classes');
    const classesData = await classesResponse.json();
    console.log('Classes API response:', classesData);
    
    // Test subjects API
    const subjectsResponse = await fetch('/api/teacher/subjects');
    const subjectsData = await subjectsResponse.json();
    console.log('Subjects API response:', subjectsData);
    
    return { classesData, subjectsData };
  } catch (error) {
    console.error('API test error:', error);
  }
}

// Call this from browser console to test
window.testAPIs = testAPIs;
