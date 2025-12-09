const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  major: String,
  classes: [String],
  about: String,
  photoURL: String
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);