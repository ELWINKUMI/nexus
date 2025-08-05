// scripts/fix-school-admin-schoolid.js
const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexus-lms';

// Schemas
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  pin: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, required: true },
  schoolId: { type: String }
}, {
  timestamps: true
});

const SchoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  adminId: { type: String, required: true }
}, {
  timestamps: true
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const School = mongoose.models.School || mongoose.model('School', SchoolSchema);

async function fixSchoolAdminSchoolIds() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all school admins without schoolId
    const schoolAdmins = await User.find({ 
      role: 'schoolAdmin',
      $or: [
        { schoolId: { $exists: false } },
        { schoolId: null },
        { schoolId: '' }
      ]
    });

    console.log(`Found ${schoolAdmins.length} school admins without schoolId`);

    for (const admin of schoolAdmins) {
      // Find the school for this admin
      const school = await School.findOne({ adminId: admin.id });
      
      if (school) {
        // Update the admin with the schoolId
        admin.schoolId = school._id.toString();
        await admin.save();
        console.log(`✅ Updated admin ${admin.id} (${admin.name}) with schoolId: ${school._id}`);
      } else {
        console.log(`⚠️  No school found for admin ${admin.id} (${admin.name})`);
      }
    }

    console.log('✅ School admin schoolId fix completed!');

  } catch (error) {
    console.error('Error fixing school admin schoolIds:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fixSchoolAdminSchoolIds();
