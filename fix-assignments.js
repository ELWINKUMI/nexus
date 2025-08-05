// Quick fix script to update assignment status
const mongoose = require('mongoose');

async function fixAssignmentStatus() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexus-lms');
    
    // Define Assignment schema (simplified)
    const assignmentSchema = new mongoose.Schema({
      title: String,
      teacherId: String,
      status: String,
    }, { collection: 'assignments' });
    
    const Assignment = mongoose.model('Assignment', assignmentSchema);
    
    // Update all assignments that don't have a status or have undefined status
    const result = await Assignment.updateMany(
      { 
        $or: [
          { status: { $exists: false } },
          { status: undefined },
          { status: null }
        ]
      },
      { $set: { status: 'active' } }
    );
    
    console.log('Updated assignments:', result);
    
    // Verify the fix
    const assignments = await Assignment.find({});
    console.log('All assignments after fix:', assignments.map(a => ({
      id: a._id,
      title: a.title,
      teacherId: a.teacherId,
      status: a.status
    })));
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixAssignmentStatus();
