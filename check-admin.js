const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Admin Schema
const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true, select: false },
  image: { type: String, default: '' },
  role: { type: String, default: 'admin' }
}, { timestamps: true });

const Admin = mongoose.model('admins', adminSchema);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ Connected to MongoDB');
  
  // Check if admin exists
  const adminCount = await Admin.countDocuments();
  console.log(`\n📊 Total admins in database: ${adminCount}`);
  
  // Find all admins (without password)
  const admins = await Admin.find({});
  console.log('\n👥 Admin users:');
  admins.forEach((admin, index) => {
    console.log(`\n${index + 1}. Admin:`);
    console.log(`   ID: ${admin._id}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Created: ${admin.createdAt}`);
  });
  
  // Check if admin@gmail.com exists
  const targetAdmin = await Admin.findOne({ email: 'admin@gmail.com' }).select('+password');
  
  if (targetAdmin) {
    console.log('\n✅ Admin with email "admin@gmail.com" EXISTS!');
    console.log(`   ID: ${targetAdmin._id}`);
    console.log(`   Name: ${targetAdmin.name}`);
    console.log(`   Email: ${targetAdmin.email}`);
    console.log(`   Role: ${targetAdmin.role}`);
    console.log(`   Password Hash: ${targetAdmin.password.substring(0, 20)}...`);
    
    // Test password
    const testPassword = '123456';
    const isMatch = await bcrypt.compare(testPassword, targetAdmin.password);
    console.log(`\n🔐 Password test for "${testPassword}": ${isMatch ? '✅ CORRECT' : '❌ INCORRECT'}`);
    
    if (!isMatch) {
      console.log('\n⚠️  Password does not match! Creating new admin with correct password...');
      
      // Hash the correct password
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      // Update the admin password
      await Admin.updateOne(
        { email: 'admin@gmail.com' },
        { password: hashedPassword }
      );
      
      console.log('✅ Admin password updated successfully!');
      
      // Verify the update
      const updatedAdmin = await Admin.findOne({ email: 'admin@gmail.com' }).select('+password');
      const verifyMatch = await bcrypt.compare('123456', updatedAdmin.password);
      console.log(`🔐 Verification: ${verifyMatch ? '✅ Password now works!' : '❌ Still not working'}`);
    }
  } else {
    console.log('\n❌ Admin with email "admin@gmail.com" NOT FOUND!');
    console.log('\n📝 Creating new admin user...');
    
    // Create new admin
    const hashedPassword = await bcrypt.hash('123456', 10);
    const newAdmin = new Admin({
      name: 'Admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'admin'
    });
    
    await newAdmin.save();
    console.log('✅ New admin created successfully!');
    console.log(`   Email: admin@gmail.com`);
    console.log(`   Password: 123456`);
  }
  
  mongoose.connection.close();
  console.log('\n✅ Database connection closed');
  process.exit(0);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

