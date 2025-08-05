// scripts/seed-demo-data.js
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

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

// Models
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const School = mongoose.models.School || mongoose.model('School', SchoolSchema);
const Class = mongoose.models.Class || mongoose.model('Class', ClassSchema);
const Subject = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
const TeacherAssignment = mongoose.models.TeacherAssignment || mongoose.model('TeacherAssignment', TeacherAssignmentSchema);
const StudentAssignment = mongoose.models.StudentAssignment || mongoose.model('StudentAssignment', StudentAssignmentSchema);

async function hashPin(pin) {
  return await bcryptjs.hash(pin, 12);
}

async function seedDemoData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing demo data (optional - comment out if you want to keep existing data)
    // await User.deleteMany({ id: { $regex: /^(SA|AD|ST|TC)/ } });
    // await School.deleteMany({});
    // await Class.deleteMany({});
    // await Subject.deleteMany({});
    // await TeacherAssignment.deleteMany({});
    // await StudentAssignment.deleteMany({});

    console.log('Creating demo data...');

    // 1. Create Super Admin (if doesn't exist)
    const existingSuperAdmin = await User.findOne({ role: 'superAdmin' });
    let superAdmin;
    
    if (!existingSuperAdmin) {
      superAdmin = new User({
        id: 'SA000001',
        pin: await hashPin('12345'),
        name: 'Super Administrator',
        email: 'superadmin@nexus.edu',
        role: 'superAdmin'
      });
      await superAdmin.save();
      console.log('Created Super Admin: SA000001 (PIN: 12345)');
    } else {
      console.log('Super Admin already exists:', existingSuperAdmin.id);
    }

    // 2. Create School
    const existingSchool = await School.findOne({ adminId: 'AD000001' });
    let school;
    
    if (!existingSchool) {
      school = new School({
        name: 'Demo High School',
        adminId: 'AD000001'
      });
      await school.save();
      console.log('Created School:', school.name);
    } else {
      school = existingSchool;
      console.log('School already exists:', school.name);
    }

    // 3. Create School Admin
    const existingAdmin = await User.findOne({ id: 'AD000001' });
    
    if (!existingAdmin) {
      const schoolAdmin = new User({
        id: 'AD000001',
        pin: await hashPin('12345'),
        name: 'School Administrator',
        email: 'admin@demoschool.edu',
        role: 'schoolAdmin',
        schoolId: school._id.toString()
      });
      await schoolAdmin.save();
      console.log('Created School Admin: AD000001 (PIN: 12345)');
    } else {
      console.log('School Admin already exists:', existingAdmin.id);
    }

    // 4. Create Classes
    const classNames = ['Grade 10A', 'Grade 10B', 'Grade 11A', 'Grade 11B'];
    const classes = [];
    
    for (const className of classNames) {
      const existingClass = await Class.findOne({ name: className, schoolId: school._id.toString() });
      
      if (!existingClass) {
        const newClass = new Class({
          name: className,
          schoolId: school._id.toString()
        });
        await newClass.save();
        classes.push(newClass);
        console.log('Created Class:', className);
      } else {
        classes.push(existingClass);
        console.log('Class already exists:', className);
      }
    }

    // 5. Create Subjects
    const subjectData = [
      { name: 'Mathematics', description: 'Advanced mathematics including algebra and calculus' },
      { name: 'English Literature', description: 'Classic and modern literature analysis' },
      { name: 'Chemistry', description: 'Organic and inorganic chemistry' },
      { name: 'Physics', description: 'Classical and modern physics concepts' },
      { name: 'Biology', description: 'Life sciences and biological systems' },
      { name: 'History', description: 'World and local history studies' }
    ];
    
    const subjects = [];
    
    for (const subjectInfo of subjectData) {
      const existingSubject = await Subject.findOne({ name: subjectInfo.name, schoolId: school._id.toString() });
      
      if (!existingSubject) {
        const newSubject = new Subject({
          name: subjectInfo.name,
          description: subjectInfo.description,
          schoolId: school._id.toString()
        });
        await newSubject.save();
        subjects.push(newSubject);
        console.log('Created Subject:', subjectInfo.name);
      } else {
        subjects.push(existingSubject);
        console.log('Subject already exists:', subjectInfo.name);
      }
    }

    // 6. Create Teachers
    const teacherData = [
      { id: 'ST000001', name: 'John Smith', email: 'j.smith@demoschool.edu', subjects: ['Mathematics', 'Physics'] },
      { id: 'ST000002', name: 'Sarah Johnson', email: 's.johnson@demoschool.edu', subjects: ['English Literature', 'History'] },
      { id: 'ST000003', name: 'Michael Brown', email: 'm.brown@demoschool.edu', subjects: ['Chemistry', 'Biology'] }
    ];
    
    const teachers = [];
    
    for (const teacherInfo of teacherData) {
      const existingTeacher = await User.findOne({ id: teacherInfo.id });
      
      if (!existingTeacher) {
        const teacher = new User({
          id: teacherInfo.id,
          pin: await hashPin('12345'),
          name: teacherInfo.name,
          email: teacherInfo.email,
          role: 'teacher',
          schoolId: school._id.toString()
        });
        await teacher.save();
        teachers.push(teacher);
        console.log('Created Teacher:', teacherInfo.name, '(' + teacherInfo.id + ')');
      } else {
        teachers.push(existingTeacher);
        console.log('Teacher already exists:', teacherInfo.name, '(' + teacherInfo.id + ')');
      }
    }

    // 7. Create Students
    const studentData = [
      { id: 'ST100001', name: 'Alice Cooper', email: 'alice.cooper@student.edu', className: 'Grade 10A' },
      { id: 'ST100002', name: 'Bob Wilson', email: 'bob.wilson@student.edu', className: 'Grade 10A' },
      { id: 'ST100003', name: 'Carol Davis', email: 'carol.davis@student.edu', className: 'Grade 10B' },
      { id: 'ST100004', name: 'David Miller', email: 'david.miller@student.edu', className: 'Grade 11A' },
      { id: 'ST100005', name: 'Emma Taylor', email: 'emma.taylor@student.edu', className: 'Grade 11B' }
    ];
    
    const students = [];
    
    for (const studentInfo of studentData) {
      const existingStudent = await User.findOne({ id: studentInfo.id });
      const studentClass = classes.find(c => c.name === studentInfo.className);
      
      if (!existingStudent && studentClass) {
        const student = new User({
          id: studentInfo.id,
          pin: await hashPin('12345'),
          name: studentInfo.name,
          email: studentInfo.email,
          role: 'student',
          schoolId: school._id.toString(),
          classId: studentClass._id.toString()
        });
        await student.save();
        students.push(student);
        console.log('Created Student:', studentInfo.name, '(' + studentInfo.id + ')');
      } else if (existingStudent) {
        students.push(existingStudent);
        console.log('Student already exists:', studentInfo.name, '(' + studentInfo.id + ')');
      }
    }

    // 8. Create Teacher Assignments
    for (const teacherInfo of teacherData) {
      const teacher = teachers.find(t => t.id === teacherInfo.id);
      if (!teacher) continue;
      
      for (const subjectName of teacherInfo.subjects) {
        const subject = subjects.find(s => s.name === subjectName);
        if (!subject) continue;
        
        for (const cls of classes) {
          const existingAssignment = await TeacherAssignment.findOne({
            teacherId: teacher.id,
            classId: cls._id.toString(),
            subjectId: subject._id.toString()
          });
          
          if (!existingAssignment) {
            const assignment = new TeacherAssignment({
              teacherId: teacher.id,
              classId: cls._id.toString(),
              subjectId: subject._id.toString(),
              schoolId: school._id.toString()
            });
            await assignment.save();
            console.log('Created Teacher Assignment:', teacher.name, '->', subjectName, 'in', cls.name);
          }
        }
      }
    }

    // 9. Create Student Assignments
    for (const student of students) {
      if (!student.classId) continue;
      
      const existingAssignment = await StudentAssignment.findOne({
        studentId: student.id,
        classId: student.classId
      });
      
      if (!existingAssignment) {
        const assignment = new StudentAssignment({
          studentId: student.id,
          classId: student.classId,
          schoolId: school._id.toString()
        });
        await assignment.save();
        console.log('Created Student Assignment for:', student.name);
      }
    }

    console.log('\n=== DEMO DATA CREATED SUCCESSFULLY ===');
    console.log('\nLogin Credentials (All PINs are: 12345):');
    console.log('Super Admin: SA000001');
    console.log('School Admin: AD000001');
    console.log('Teachers: ST000001, ST000002, ST000003');
    console.log('Students: ST100001, ST100002, ST100003, ST100004, ST100005');
    console.log('\nYou can now log in with any of these IDs using PIN: 12345');

  } catch (error) {
    console.error('Error seeding demo data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seeding function
seedDemoData();
