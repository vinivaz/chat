const mongoose = require('mongoose');
const {v4: uuidv4} = require('uuid');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4(),
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  profile_img: {
    type: String,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

userSchema.pre('save', async function(next){
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;

  next();
});

module.exports = new mongoose.model('user', userSchema);
