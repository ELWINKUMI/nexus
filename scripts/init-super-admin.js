// scripts/init-super-admin.js
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexus-lms';

// User Schema (simplified for script)
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  pin: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, required: true }
}, {
  timestamps: true
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function initSuperAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'superAdmin' });
    
    if (existingSuperAdmin) {
      console.log('Super Admin already exists:', existingSuperAdmin.id);
      console.log('Name:', existingSuperAdmin.name);
      console.log('Email:', existingSuperAdmin.email);
      process.exit(0);
    }

    // Generate auto ID and PIN for super admin
    const superAdminId = 'SA' + Date.now().toString().slice(-6); // SA + 6 digits from timestamp
    const superAdminPin = Math.floor(10000 + Math.random() * 90000).toString(); // 5-digit PIN
    const hashedPin = await bcryptjs.hash(superAdminPin, 12);

    const superAdmin = new User({
      id: superAdminId,
      pin: hashedPin,
      name: 'Elwin Kumi Obrempong',
      email: 'brempongkumi1@gmail.com',
      role: 'superAdmin'
    });

    await superAdmin.save();

    console.log('✅ Super Admin created successfully!');
    console.log('================================');
    console.log('Name: Elwin Kumi Obrempong');
    console.log('Email: brempongkumi1@gmail.com');
    console.log('ID:', superAdminId);
    console.log('PIN:', superAdminPin);
    console.log('================================');
    console.log('');
    console.log('🔒 Please save these credentials securely!');
    console.log('💡 You can now login to NEXUS LMS with these credentials.');

  } catch (error) {
    console.error('Error creating Super Admin:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

initSuperAdmin();
