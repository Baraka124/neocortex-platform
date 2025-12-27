import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static('.'));

const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize data file
async function initData() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    const initialData = {
      posts: {
        "welcome": {
          id: "welcome",
          author: "admin",
          title: "Welcome to Our Platform! 🚀",
          content: "# Hello World!\n\nThis is a **dynamic blogging platform** with just 3 files!\n\n## Features\n- ✏️ **Anyone can post** (no overwriting)\n- 🔐 **Your content stays separate**\n- 📝 **Markdown support**\n- 🔍 **Search and filter**\n- ⚡ **Real-time updates**\n\n## How It Works\n1. Users create posts (gets unique ID)\n2. Everything stored in `data.json`\n3. No file conflicts ever!",
          date: new Date().toISOString().split('T')[0],
          tags: ["welcome", "platform"],
          status: "published",
          views: 0,
          likes: 0
        }
      },
      users: {},
      config: {
        allowPublicPosts: true,
        requireApproval: false,
        maxPostsPerUser: 100
      }
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
}

// 1. Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const { author, tag, status, search } = req.query;
    const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
    
    let posts = Object.values(data.posts);
    
    // Filtering
    if (author) posts = posts.filter(p => p.author === author);
    if (tag) posts = posts.filter(p => p.tags?.includes(tag));
    if (status) posts = posts.filter(p => p.status === status);
    if (search) {
      const query = search.toLowerCase();
      posts = posts.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.content.toLowerCase().includes(query)
      );
    }
    
    // Sort by date (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Get single post
app.get('/api/posts/:id', async (req, res) => {
  try {
    const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
    const post = data.posts[req.params.id];
    
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    
    // Increment views
    data.posts[req.params.id].views = (post.views || 0) + 1;
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Create NEW post (never overwrites!)
app.post('/api/posts', async (req, res) => {
  try {
    const { author, title, content, tags = [] } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Title and content are required' 
      });
    }
    
    const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
    
    // Generate unique ID (prevents overwriting)
    const id = `${author || 'anonymous'}-${uuidv4().split('-')[0]}`;
    
    const newPost = {
      id,
      author: author || 'anonymous',
      title,
      content,
      date: new Date().toISOString().split('T')[0],
      tags: Array.isArray(tags) ? tags : tags.split(','),
      status: data.config.requireApproval ? 'pending' : 'published',
      views: 0,
      likes: 0,
      comments: []
    };
    
    // Add to data (unique key = id)
    data.posts[id] = newPost;
    
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    
    res.json({ 
      success: true, 
      message: 'Post created successfully!',
      post: newPost
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Update post (only author or admin can)
app.put('/api/posts/:id', async (req, res) => {
  try {
    const { author, updates } = req.body;
    const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
    const post = data.posts[req.params.id];
    
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    
    // Check permissions (simple version)
    if (post.author !== author && author !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    
    // Update post
    data.posts[req.params.id] = {
      ...post,
      ...updates,
      updated: new Date().toISOString()
    };
    
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    
    res.json({ 
      success: true, 
      message: 'Post updated successfully'
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Delete post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { author } = req.body;
    const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
    const post = data.posts[req.params.id];
    
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    
    // Check permissions
    if (post.author !== author && author !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    
    // Soft delete (change status)
    data.posts[req.params.id].status = 'deleted';
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    
    res.json({ 
      success: true, 
      message: 'Post deleted successfully'
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Like a post
app.post('/api/posts/:id/like', async (req, res) => {
  try {
    const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
    const post = data.posts[req.params.id];
    
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    
    data.posts[req.params.id].likes = (post.likes || 0) + 1;
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    
    res.json({ 
      success: true, 
      likes: data.posts[req.params.id].likes
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Add comment
app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const { author, content } = req.body;
    
    if (!content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Comment content is required' 
      });
    }
    
    const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
    const post = data.posts[req.params.id];
    
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    
    const comment = {
      id: uuidv4(),
      author: author || 'anonymous',
      content,
      date: new Date().toISOString(),
      likes: 0
    };
    
    if (!post.comments) post.comments = [];
    post.comments.push(comment);
    
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    
    res.json({ 
      success: true, 
      comment
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. Get stats
app.get('/api/stats', async (req, res) => {
  try {
    const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
    const posts = Object.values(data.posts);
    
    const stats = {
      totalPosts: posts.length,
      publishedPosts: posts.filter(p => p.status === 'published').length,
      totalViews: posts.reduce((sum, p) => sum + (p.views || 0), 0),
      totalLikes: posts.reduce((sum, p) => sum + (p.likes || 0), 0),
      topAuthors: Object.entries(
        posts.reduce((acc, p) => {
          acc[p.author] = (acc[p.author] || 0) + 1;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1]).slice(0, 5),
      recentPosts: posts
        .filter(p => p.status === 'published')
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
        .map(p => ({ id: p.id, title: p.title, author: p.author }))
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Initialize and start
await initData();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Blog platform running on port ${PORT}`);
});
