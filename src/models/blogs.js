import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    default: 'Lifestyle',
  },
  tags: {
    type: Array,
    required: true,
    default: [],
  },

  createdAt: { type: Date, default: Date.now },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'users',
  },
  recommendedByEditor: { type: Boolean, default: false },
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
});

blogSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  this.CreatedAt = Date.now();
  next();
});
blogSchema.index({ '$**': 'text' });

blogSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'author',
    select: '-__v -accountCreatedAt',
  });
  next();
});

export const BlogModel = mongoose.model('blogs', blogSchema);
