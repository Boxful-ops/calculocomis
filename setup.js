const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'admin', 'seller'], default: 'seller' },
  permissions: [{
    module: String,
    canCreate: Boolean,
    canRead: Boolean,
    canUpdate: Boolean,
    canDelete: Boolean
  }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createSuperAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/commission_system');
    console.log('Conectado a MongoDB');

    // Check if super admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@demo.com' });
    if (existingAdmin) {
      console.log('El super administrador ya existe');
      return;
    }

    // Create super admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const superAdmin = new User({
      username: 'admin',
      email: 'admin@demo.com',
      password: hashedPassword,
      role: 'super_admin',
      permissions: [
        {
          module: 'users',
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true
        },
        {
          module: 'commissions',
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true
        },
        {
          module: 'leads',
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true
        }
      ]
    });

    await superAdmin.save();
    console.log('✅ Super administrador creado exitosamente');
    console.log('📧 Email: admin@demo.com');
    console.log('🔑 Contraseña: admin123');
    
  } catch (error) {
    console.error('❌ Error al crear super administrador:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createSuperAdmin();
