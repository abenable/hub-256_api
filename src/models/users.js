import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  username: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  password: { type: String, required: true, select: false },
  accountCreatedAt: { type: Date },
  passChangedAt: { type: Date, select: false },
  passresettoken: { type: String, select: false },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passChangedAt = Date.now();
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  this.accountCreatedAt = Date.now();
  next();
});

userSchema.methods.changedPassAfter = function (jwtTimestamp) {
  if (this.passChangedAt) {
    const changedTimestamp = parseInt(this.passChangedAt.getTime() / 1000, 10);
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.correctPassword = async function (password, savedPassword) {
  return await bcrypt.compare(password, savedPassword);
};

userSchema.methods.createpassresetToken = function () {
  const resetToken = crypto.randomBytes(16).toString('hex');
  this.passresettoken = crypto
    .createHash('sha256', 8)
    .update(resetToken)
    .digest('hex');
  return resetToken;
};

export const UserModel = mongoose.model('users', userSchema);
