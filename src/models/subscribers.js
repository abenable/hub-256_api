import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String, required: true, unique: true },
  image: { type: String, select: false },
  active: { type: Boolean, default: true, select: false },
  subscribedAt: { type: Date, select: false },
});

subscriberSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  this.accountCreatedAt = Date.now();
  next();
});

export const SubscriberModel = mongoose.model('subscribers', subscriberSchema);
