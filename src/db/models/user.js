const validator = require('validator');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique:true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is Invalid');
      }
    }
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw console.log("Age must always be a positive number");
      }
    }
  },
  password: {
    type: String,
    trim: true,
    required: true,
    minlength: 7,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error('Password includes password.Enter a drong password');
      }
    }
  },
  avatar: {
    type:Buffer,
  },
  tokens: [{
    token: {
      type: String,
      required:true
    }
  }]
}, {
  timestamps:true
});

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: "_id",
  foreignField:"owner"
});

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "myExpressApp");
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.methods.toJSON =function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
};

userSchema.statics.findByCredentials = async (email,password) => {
  const user = await User.findOne({ email: email });

  if (!user) {
    throw new Error('Unable to Login');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if(!isMatch){
    throw new Error('Unable to Login');
  }
  return user;
}

//hash the plain text password before saving.
userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
})

//delete all tasks.
userSchema.pre('remove', async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
})

const User = mongoose.model('User',userSchema);
  
  
module.exports = User;