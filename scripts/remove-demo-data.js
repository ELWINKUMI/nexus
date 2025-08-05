// scripts/remove-demo-data.js
const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexus-lms';

// Schemas (simplified for script)
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  pin: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, required: true },
  schoolId: { type: String },
  classId: { type: String }
}, { timestamps: true });

const SchoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  adminId: { type: String, required: true, unique: true }
}, { timestamps: true });

const ClassSchema = new mongoose.Schema({
  name: { type: String, required: true },
  schoolId: { type: String, required: true }
}, { timestamps: true });

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  schoolId: { type: String, required: true },
  description: { type: String }
}, { timestamps: true });

const TeacherAssignmentSchema = new mongoose.Schema({
  teacherId: { type: String, required: true },
  classId: { type: String, required: true },
  subjectId: { type: String, required: true },
  schoolId: { type: String, required: true }
}, { timestamps: true });

const StudentAssignmentSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  classId: { type: String, required: true },
  schoolId: { type: String, required: true }
}, { timestamps: true });

const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  teacherId: { type: String, required: true },
  subjectId: { type: String, required: true },
  classId: { type: String, required: true },
  schoolId: { type: String, required: true }
}, { timestamps: true });

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  teacherId: { type: String, required: true },
  subjectId: { type: String, required: true },
  classId: { type: String, required: true },
  schoolId: { type: String, required: true }
}, { timestamps: true });

const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  teacherId: { type: String, required: true },
  subjectId: { type: String, required: true },
  schoolId: { type: String, required: true }
}, { timestamps: true });

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  teacherId: { type: String, required: true },
  schoolId: { type: String, required: true }
}, { timestamps: true });

// Models
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const School = mongoose.models.School || mongoose.model('School', SchoolSchema);
const Class = mongoose.models.Class || mongoose.model('Class', ClassSchema);
const Subject = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
const TeacherAssignment = mongoose.models.TeacherAssignment || mongoose.model('TeacherAssignment', TeacherAssignmentSchema);
const StudentAssignment = mongoose.models.StudentAssignment || mongoose.model('StudentAssignment', StudentAssignmentSchema);
const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema);
const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);
const Resource = mongoose.models.Resource || mongoose.model('Resource', ResourceSchema);
const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);

async function removeDemoData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    console.log('🗑️  REMOVING ALL DEMO DATA...\n');

    // Get counts before deletion
    const userCount = await User.countDocuments();
    const schoolCount = await School.countDocuments();
    const classCount = await Class.countDocuments();
    const subjectCount = await Subject.countDocuments();
    const teacherAssignmentCount = await TeacherAssignment.countDocuments();
    const studentAssignmentCount = await StudentAssignment.countDocuments();
    const assignmentCount = await Assignment.countDocuments();
    const quizCount = await Quiz.countDocuments();
    const resourceCount = await Resource.countDocuments();
    const announcementCount = await Announcement.countDocuments();

    console.log('📊 Current Database Counts:');
    console.log(`- Users: ${userCount}`);
    console.log(`- Schools: ${schoolCount}`);
    console.log(`- Classes: ${classCount}`);
    console.log(`- Subjects: ${subjectCount}`);
    console.log(`- Teacher Assignments: ${teacherAssignmentCount}`);
    console.log(`- Student Assignments: ${studentAssignmentCount}`);
    console.log(`- Assignments: ${assignmentCount}`);
    console.log(`- Quizzes: ${quizCount}`);
    console.log(`- Resources: ${resourceCount}`);
    console.log(`- Announcements: ${announcementCount}`);
    console.log('');

    // Delete all collections
    console.log('🗑️  Deleting all data...');
    
    const userResult = await User.deleteMany({});
    console.log(`✅ Deleted ${userResult.deletedCount} users`);
    
    const schoolResult = await School.deleteMany({});
    console.log(`✅ Deleted ${schoolResult.deletedCount} schools`);
    
    const classResult = await Class.deleteMany({});
    console.log(`✅ Deleted ${classResult.deletedCount} classes`);
    
    const subjectResult = await Subject.deleteMany({});
    console.log(`✅ Deleted ${subjectResult.deletedCount} subjects`);
    
    const teacherAssignmentResult = await TeacherAssignment.deleteMany({});
    console.log(`✅ Deleted ${teacherAssignmentResult.deletedCount} teacher assignments`);
    
    const studentAssignmentResult = await StudentAssignment.deleteMany({});
    console.log(`✅ Deleted ${studentAssignmentResult.deletedCount} student assignments`);
    
    const assignmentResult = await Assignment.deleteMany({});
    console.log(`✅ Deleted ${assignmentResult.deletedCount} assignments`);
    
    const quizResult = await Quiz.deleteMany({});
    console.log(`✅ Deleted ${quizResult.deletedCount} quizzes`);
    
    const resourceResult = await Resource.deleteMany({});
    console.log(`✅ Deleted ${resourceResult.deletedCount} resources`);
    
    const announcementResult = await Announcement.deleteMany({});
    console.log(`✅ Deleted ${announcementResult.deletedCount} announcements`);

    // Verify deletion
    const remainingUsers = await User.countDocuments();
    const remainingSchools = await School.countDocuments();
    const remainingClasses = await Class.countDocuments();
    const remainingSubjects = await Subject.countDocuments();
    const remainingTeacherAssignments = await TeacherAssignment.countDocuments();
    const remainingStudentAssignments = await StudentAssignment.countDocuments();
    const remainingAssignments = await Assignment.countDocuments();
    const remainingQuizzes = await Quiz.countDocuments();
    const remainingResources = await Resource.countDocuments();
    const remainingAnnouncements = await Announcement.countDocuments();

    console.log('\n📊 Database After Cleanup:');
    console.log(`- Users: ${remainingUsers}`);
    console.log(`- Schools: ${remainingSchools}`);
    console.log(`- Classes: ${remainingClasses}`);
    console.log(`- Subjects: ${remainingSubjects}`);
    console.log(`- Teacher Assignments: ${remainingTeacherAssignments}`);
    console.log(`- Student Assignments: ${remainingStudentAssignments}`);
    console.log(`- Assignments: ${remainingAssignments}`);
    console.log(`- Quizzes: ${remainingQuizzes}`);
    console.log(`- Resources: ${remainingResources}`);
    console.log(`- Announcements: ${remainingAnnouncements}`);

    console.log('\n🎉 ALL DEMO DATA REMOVED SUCCESSFULLY!');
    console.log('💡 The database is now completely clean.');
    console.log('💡 You can run "npm run seed-demo" again if you need demo data later.');

  } catch (error) {
    console.error('❌ Error removing demo data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the cleanup function
removeDemoData();
