const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  id: { type: String, default: () => 'c_' + Date.now() },
  author: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: String, default: () => new Date().toLocaleDateString() }
});

const BlogSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    default: () => 'post-' + Date.now()
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true
  },
  slug: {
    type: String
  },
  excerpt: {
    type: String
  },
  content: {
    type: String,
    required: [true, 'Please provide content']
  },
  category: {
    type: String,
    default: 'Web Dev'
  },
  coverImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80'
  },
  tags: {
    type: [String],
    default: ['Web Dev']
  },
  status: {
    type: String,
    enum: ['published', 'draft'],
    default: 'published'
  },
  author: {
    id: String,
    name: String,
    avatar: String
  },
  publishedAt: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  readTime: {
    type: String,
    default: '5 min read'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  liked: {
    type: Boolean,
    default: false
  },
  bookmarked: {
    type: Boolean,
    default: false
  },
  comments: [CommentSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
