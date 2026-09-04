const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { getPosts, savePosts } = require('../utils/db');
const { verifyToken } = require('../middleware/auth');

// GET /api/blogs - Query blogs from Mongoose database
router.get('/', async (req, res) => {
  try {
    const { category, search, status } = req.query;
    let queryFilter = {};

    if (status) {
      queryFilter.status = status;
    } else {
      queryFilter.status = { $ne: 'draft' };
    }

    if (category && category !== 'All') {
      queryFilter.category = new RegExp(`^${category}$`, 'i');
    }

    if (search) {
      queryFilter.$or = [
        { title: new RegExp(search, 'i') },
        { excerpt: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    let posts = [];
    try {
      posts = await Blog.find(queryFilter).sort({ createdAt: -1 });
      // If DB empty, fallback seed
      if (posts.length === 0 && !search && category === 'All') {
        const filePosts = getPosts();
        posts = filePosts;
      }
    } catch (dbErr) {
      posts = getPosts();
      if (status) posts = posts.filter(p => p.status === status);
      if (category && category !== 'All') posts = posts.filter(p => p.category.toLowerCase() === category.toLowerCase());
      if (search) posts = posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
    }

    res.json({ success: true, count: posts.length, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch blogs from database', error: err.message });
  }
});

// GET /api/blogs/user/me - Get user-specific posts and metrics (Protected)
router.get('/user/me', verifyToken, async (req, res) => {
  try {
    let userPosts = [];
    try {
      userPosts = await Blog.find({
        $or: [
          { 'author.id': req.user.id },
          { 'author.name': req.user.name }
        ]
      }).sort({ createdAt: -1 });
    } catch (dbErr) {
      const posts = getPosts();
      userPosts = posts.filter(p => p.author && (p.author.id === req.user.id || p.author.name === req.user.name));
    }

    const totalPosts = userPosts.length;
    const totalViews = userPosts.reduce((acc, p) => acc + (p.views || 0), 0);
    const totalLikes = userPosts.reduce((acc, p) => acc + (p.likes || 0), 0);
    const draftCount = userPosts.filter(p => p.status === 'draft').length;

    res.json({
      success: true,
      stats: { totalPosts, totalViews, totalLikes, draftCount },
      data: userPosts
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch user dashboard metrics', error: err.message });
  }
});

// GET /api/blogs/:id - Get individual blog details from Mongoose DB
router.get('/:id', async (req, res) => {
  try {
    let post = null;
    try {
      post = await Blog.findOne({ $or: [{ id: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }] });
      if (post) {
        post.views = (post.views || 0) + 1;
        await post.save();
      }
    } catch (dbErr) {
      const posts = getPosts();
      post = posts.find(p => p.id === req.params.id);
      if (post) {
        post.views = (post.views || 0) + 1;
        savePosts(posts);
      }
    }

    if (!post) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving post from database', error: err.message });
  }
});

// POST /api/blogs - Create new blog post in Mongoose DB (Protected)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, excerpt, content, category, coverImage, tags, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and Content are required.' });
    }

    const wordCount = content.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200)) + ' min read';

    const newPostData = {
      id: 'post-' + Date.now(),
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      excerpt: excerpt || title.substring(0, 120) + '...',
      content,
      category: category || 'Web Dev',
      coverImage: coverImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      tags: tags || ['Web Dev'],
      status: status || 'published',
      author: {
        id: req.user.id,
        name: req.user.name,
        avatar: req.user.avatar
      },
      publishedAt: new Date().toISOString().split('T')[0],
      readTime,
      views: 0,
      likes: 0,
      comments: []
    };

    let createdPost = null;
    try {
      createdPost = await Blog.create(newPostData);
    } catch (dbErr) {
      const posts = getPosts();
      posts.unshift(newPostData);
      savePosts(posts);
      createdPost = newPostData;
    }

    res.status(201).json({ success: true, message: 'Blog post created successfully in database', data: createdPost });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating blog post', error: err.message });
  }
});

// PUT /api/blogs/:id - Update blog post in Mongoose DB (Protected)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, excerpt, content, category, coverImage, tags, status } = req.body;
    let updatedPost = null;

    try {
      updatedPost = await Blog.findOneAndUpdate(
        { id: req.params.id },
        { title, excerpt, content, category, coverImage, tags, status },
        { new: true }
      );
    } catch (dbErr) {
      const posts = getPosts();
      const index = posts.findIndex(p => p.id === req.params.id);
      if (index !== -1) {
        posts[index] = { ...posts[index], title, excerpt, content, category, coverImage, tags, status };
        savePosts(posts);
        updatedPost = posts[index];
      }
    }

    if (!updatedPost) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    res.json({ success: true, message: 'Blog post updated in database', data: updatedPost });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating blog post', error: err.message });
  }
});

// DELETE /api/blogs/:id - Delete blog post from Mongoose DB (Protected)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    let deleted = false;
    try {
      const result = await Blog.deleteOne({ id: req.params.id });
      deleted = result.deletedCount > 0;
    } catch (dbErr) {
      let posts = getPosts();
      const initial = posts.length;
      posts = posts.filter(p => p.id !== req.params.id);
      if (posts.length < initial) {
        savePosts(posts);
        deleted = true;
      }
    }

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    res.json({ success: true, message: 'Blog post deleted from database' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting blog post', error: err.message });
  }
});

// POST /api/blogs/:id/comments - Add comment to blog post
router.post('/:id/comments', async (req, res) => {
  try {
    const { author, text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Comment text is required' });

    let post = null;
    const newComment = { id: 'c_' + Date.now(), author: author || 'Guest Reader', text, date: 'Just now' };

    try {
      post = await Blog.findOne({ id: req.params.id });
      if (post) {
        post.comments.unshift(newComment);
        await post.save();
      }
    } catch (dbErr) {
      const posts = getPosts();
      post = posts.find(p => p.id === req.params.id);
      if (post) {
        if (!post.comments) post.comments = [];
        post.comments.unshift(newComment);
        savePosts(posts);
      }
    }

    if (!post) return res.status(404).json({ success: false, message: 'Blog post not found' });

    res.status(201).json({ success: true, message: 'Comment added to database', data: post.comments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding comment', error: err.message });
  }
});

// POST /api/blogs/:id/like - Toggle like on blog post
router.post('/:id/like', async (req, res) => {
  try {
    let post = null;
    try {
      post = await Blog.findOne({ id: req.params.id });
      if (post) {
        post.liked = !post.liked;
        post.likes = Math.max(0, (post.likes || 0) + (post.liked ? 1 : -1));
        await post.save();
      }
    } catch (dbErr) {
      const posts = getPosts();
      post = posts.find(p => p.id === req.params.id);
      if (post) {
        post.liked = !post.liked;
        post.likes = Math.max(0, (post.likes || 0) + (post.liked ? 1 : -1));
        savePosts(posts);
      }
    }

    if (!post) return res.status(404).json({ success: false, message: 'Blog post not found' });

    res.json({ success: true, liked: post.liked, likes: post.likes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error toggling like', error: err.message });
  }
});

module.exports = router;
