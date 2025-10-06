const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const User = require(path.resolve(__dirname, '../models/UserModel'));
const connectDB = require(path.resolve(__dirname, '../config/db'));

async function addUser() {
  try {
    // Connect first
    await connectDB();

    const user = new User({
      name: 'Josef Tester',
      email: 'josef1@test.com',
      password: 'password123',
      skillsToLearn: ['React', 'Node.js'],
      skillsToTeach: ['HTML', 'CSS']
    });

    const savedUser = await user.save();
    console.log('✅ User created:', savedUser);
  } catch (err) {
    console.error('❌ Error creating user:', err.message);
  } finally {
    mongoose.connection.close();
  }
}

addUser();
