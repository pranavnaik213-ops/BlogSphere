const express = require('express');
const router = express.Router();
const { getPosts, savePosts } = require('../utils/db');
const { verifyToken } = require('../middleware/auth');

// GET /api/blogs - Get all published blogs with search & filter
router.get('/', (req, res) => {
  try {
    let posts = getPosts();
    const { category, search, status } = req.query;

    if (status) {
      posts = posts.filter(p => p.status === status);
    } else {
      // By default return published posts for public feed
      posts = posts.filter(p => p.status !== 'draft');
    }

    if (category && category !== 'All') {
      posts = posts.filter(p => p.category && p.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      posts = posts.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.excerpt.toLowerCase().includes(q) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    res.json({ success: true, count: posts.length, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch blogs', error: err.message });
  }
});

// GET /api/blogs/user/me - Get logged-in user posts & dashboard metrics (Protected)
router.get('/user/me', verifyToken, (req, res) => {
  try {
    const posts = getPosts();
    const userPosts = posts.filter(p => p.author && (p.author.id === req.user.id || p.author.name === req.user.name));

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
    res.status(500).json({ success: false, message: 'Failed to fetch user dashboard data', error: err.message });
  }
});

// GET /api/blogs/:id - Get single blog post by ID
router.get('/:id', (req, res) => {
  try {
    const posts = getPosts();
    const post = posts.find(p => p.id === req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    // Increment view counter
    post.views = (post.views || 0) + 1;
    savePosts(posts);

    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving post', error: err.message });
  }
});

// POST /api/blogs - Create new blog post (Protected)
router.post('/', verifyToken, (req, res) => {
  try {
    const { title, excerpt, content, category, coverImage, tags, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and Content are required.' });
    }

    const posts = getPosts();
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200)) + ' min read';

    const newPost = {
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

    posts.unshift(newPost);
    savePosts(posts);

    res.status(201).json({ success: true, message: 'Blog post created successfully', data: newPost });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating blog post', error: err.message });
  }
});

// PUT /api/blogs/:id - Update existing blog post (Protected)
router.put('/:id', verifyToken, (req, res) => {
  try {
    const posts = getPosts();
    const index = posts.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    const existing = posts[index];
    const { title, excerpt, content, category, coverImage, tags, status } = req.body;

    posts[index] = {
      ...existing,
      title: title || existing.title,
      excerpt: excerpt || existing.excerpt,
      content: content || existing.content,
      category: category || existing.category,
      coverImage: coverImage || existing.coverImage,
      tags: tags || existing.tags,
      status: status || existing.status,
      updatedAt: new Date().toISOString()
    };

    savePosts(posts);
    res.json({ success: true, message: 'Blog post updated successfully', data: posts[index] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating blog post', error: err.message });
  }
});

// DELETE /api/blogs/:id - Delete blog post (Protected)
router.delete('/:id', verifyToken, (req, res) => {
  try {
    let posts = getPosts();
    const initialLength = posts.length;
    posts = posts.filter(p => p.id !== req.params.id);

    if (posts.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    savePosts(posts);
    res.json({ success: true, message: 'Blog post deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting blog post', error: err.message });
  }
});

// POST /api/blogs/:id/comments - Add comment to blog post
router.post('/:id/comments', (req, res) => {
  try {
    const { author, text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const posts = getPosts();
    const post = posts.find(p => p.id === req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    const newComment = {
      id: 'c_' + Date.now(),
      author: author || 'Guest Reader',
      text,
      date: 'Just now'
    };

    if (!post.comments) post.comments = [];
    post.comments.unshift(newComment);
    savePosts(posts);

    res.status(201).json({ success: true, message: 'Comment added', data: post.comments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding comment', error: err.message });
  }
});

// POST /api/blogs/:id/like - Toggle like on blog post
router.post('/:id/like', (req, res) => {
  try {
    const posts = getPosts();
    const post = posts.find(p => p.id === req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    post.liked = !post.liked;
    post.likes = Math.max(0, (post.likes || 0) + (post.liked ? 1 : -1));
    savePosts(posts);

    res.json({ success: true, liked: post.liked, likes: post.likes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error toggling like', error: err.message });
  }
});

module.exports = router;
