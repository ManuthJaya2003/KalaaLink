const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/kalaalink', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define User schema (same as in UserModel.js)
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['artist', 'artistManager', 'customer', 'admin', 'donationManager', 'eventManager', 'inventoryManager'],
    required: true,
  },
  profilePicture: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
});

const User = mongoose.model('UserModel', userSchema);

async function fixUserIsActiveField() {
  try {
    console.log('🔧 Fixing user isActive field...');
    
    // Find all users that don't have the isActive field set
    const usersWithoutIsActive = await User.find({ isActive: { $exists: false } });
    
    console.log(`Found ${usersWithoutIsActive.length} users without isActive field`);
    
    if (usersWithoutIsActive.length > 0) {
      // Update all users to have isActive: true by default
      const result = await User.updateMany(
        { isActive: { $exists: false } },
        { $set: { isActive: true } }
      );
      
      console.log(`✅ Updated ${result.modifiedCount} users with isActive: true`);
    } else {
      console.log('✅ All users already have isActive field set');
    }
    
    // Verify the fix
    const allUsers = await User.find({}, 'firstName lastName email isActive');
    console.log('\n📊 Current user status:');
    allUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}): isActive = ${user.isActive}`);
    });
    
    console.log('\n🎉 User isActive field fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing user isActive field:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the fix
fixUserIsActiveField();
