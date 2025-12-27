import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static('.'));

const DATA_FILE = path.join(__dirname, 'data.json');

// Simple ID generator
function generateId(author = 'anonymous') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    const safeAuthor = author.toLowerCase().replace(/[^a-z0-9]/g, '-').substr(0, 10);
    return `${safeAuthor}-${timestamp}-${random}`;
}

// Initialize data file
async function initData() {
    try {
        await fs.access(DATA_FILE);
        console.log('📁 data.json exists');
    } catch {
        console.log('📁 Creating initial data.json');
        const initialData = {
            posts: {
                "welcome": {
                    id: "welcome",
                    author: "admin",
                    title: "Welcome to Our Platform! 🚀",
                    content: "# Hello World!\n\nThis is a **dynamic blogging platform** with just 3 files!\n\n## Features\n- ✏️ **Anyone can post** (no overwriting)\n- 🔐 **Your content stays separate**\n- 📝 **Markdown support**\n- 🔍 **Search and filter**\n- ⚡ **Real-time updates**\n\n## How It Works\n1. Users create posts (gets unique ID)\n2. Everything stored in `data.json`\n\n## Try It!\nClick the **'+ New Post'** button to create your first post!",
                    date: new Date().toISOString().split('T')[0],
                    tags: ["welcome", "platform", "demo"],
                    status: "published",
                    views: 0,
                    likes: 0
                },
                "example": {
                    id: "example",
                    author: "demo",
                    title: "Example User Post",
                    content: "# This is an example\n\nUsers can create posts like this!\n\n## Markdown Works\n- **Bold text**\n- *Italic text*\n- `Code snippets`\n- [Links](https://example.com)\n\n## Try Editing\nThis post can be edited or you can create your own!",
                    date: new Date().toISOString().split('T')[0],
                    tags: ["example", "demo", "tutorial"],
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
            },
            meta: {
                createdAt: new Date().toISOString(),
                version: "1.0.0"
            }
        };
        await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
        console.log('✅ Created initial data.json');
    }
}

// 1. Get all posts
app.get('/api/posts', async (req, res) => {
    try {
        console.log('📨 GET /api/posts called');
        const { author, tag, status, search } = req.query;
        
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        
        let posts = Object.values(data.posts);
        console.log(`📊 Found ${posts.length} total posts`);
        
        // Filtering
        if (author) {
            posts = posts.filter(p => p.author === author);
            console.log(`🔍 Filtered by author "${author}": ${posts.length} posts`);
        }
        if (tag) {
            posts = posts.filter(p => p.tags?.includes(tag));
            console.log(`🔍 Filtered by tag "${tag}": ${posts.length} posts`);
        }
        if (status) {
            posts = posts.filter(p => p.status === status);
            console.log(`🔍 Filtered by status "${status}": ${posts.length} posts`);
        }
        if (search) {
            const query = search.toLowerCase();
            posts = posts.filter(p => 
                p.title.toLowerCase().includes(query) || 
                p.content.toLowerCase().includes(query)
            );
            console.log(`🔍 Search "${search}": ${posts.length} posts`);
        }
        
        // Sort by date (newest first)
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        res.json({ 
            success: true, 
            posts,
            count: posts.length,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error in /api/posts:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// 2. Get single post
app.get('/api/posts/:id', async (req, res) => {
    try {
        console.log(`📨 GET /api/posts/${req.params.id}`);
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        const post = data.posts[req.params.id];
        
        if (!post) {
            console.log(`❌ Post ${req.params.id} not found`);
            return res.status(404).json({ success: false, error: 'Post not found' });
        }
        
        // Increment views
        data.posts[req.params.id].views = (post.views || 0) + 1;
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        
        console.log(`✅ Viewed post ${req.params.id}, views: ${data.posts[req.params.id].views}`);
        
        res.json({ 
            success: true, 
            post,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error(`❌ Error in /api/posts/${req.params.id}:`, error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// 3. Create NEW post (never overwrites!)
app.post('/api/posts', async (req, res) => {
    try {
        console.log('📨 POST /api/posts called');
        const { author, title, content, tags = [] } = req.body;
        
        console.log('📝 Creating post:', { author, title, contentLength: content?.length });
        
        if (!title || !content) {
            console.log('❌ Missing title or content');
            return res.status(400).json({ 
                success: false, 
                error: 'Title and content are required' 
            });
        }
        
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        
        // Generate unique ID
        const id = generateId(author || 'anonymous');
        console.log(`🆔 Generated ID: ${id}`);
        
        const newPost = {
            id,
            author: author || 'anonymous',
            title: title.trim(),
            content: content.trim(),
            date: new Date().toISOString().split('T')[0],
            tags: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(t => t),
            status: data.config.requireApproval ? 'pending' : 'published',
            views: 0,
            likes: 0,
            comments: [],
            created: new Date().toISOString()
        };
        
        // Add to data (unique key = id)
        data.posts[id] = newPost;
        
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        
        console.log(`✅ Post created: ${id} by ${newPost.author}`);
        
        res.json({ 
            success: true, 
            message: 'Post created successfully!',
            post: newPost,
            id,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error creating post:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            details: 'Failed to create post. Please try again.'
        });
    }
});

// 4. Update post
app.put('/api/posts/:id', async (req, res) => {
    try {
        console.log(`📨 PUT /api/posts/${req.params.id}`);
        const { author, updates } = req.body;
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        const post = data.posts[req.params.id];
        
        if (!post) {
            console.log(`❌ Post ${req.params.id} not found`);
            return res.status(404).json({ success: false, error: 'Post not found' });
        }
        
        // Check permissions (simple version)
        if (post.author !== author && author !== 'admin') {
            console.log(`❌ Unauthorized: ${author} cannot edit ${post.author}'s post`);
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }
        
        // Update post
        data.posts[req.params.id] = {
            ...post,
            ...updates,
            updated: new Date().toISOString()
        };
        
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        
        console.log(`✅ Post ${req.params.id} updated by ${author}`);
        
        res.json({ 
            success: true, 
            message: 'Post updated successfully',
            post: data.posts[req.params.id]
        });
        
    } catch (error) {
        console.error(`❌ Error updating post ${req.params.id}:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5. Delete post (soft delete)
app.delete('/api/posts/:id', async (req, res) => {
    try {
        console.log(`📨 DELETE /api/posts/${req.params.id}`);
        const { author } = req.body;
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        const post = data.posts[req.params.id];
        
        if (!post) {
            console.log(`❌ Post ${req.params.id} not found`);
            return res.status(404).json({ success: false, error: 'Post not found' });
        }
        
        // Check permissions
        if (post.author !== author && author !== 'admin') {
            console.log(`❌ Unauthorized delete attempt by ${author}`);
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }
        
        // Soft delete (change status)
        data.posts[req.params.id].status = 'deleted';
        data.posts[req.params.id].deletedAt = new Date().toISOString();
        data.posts[req.params.id].deletedBy = author;
        
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        
        console.log(`✅ Post ${req.params.id} soft-deleted by ${author}`);
        
        res.json({ 
            success: true, 
            message: 'Post deleted successfully'
        });
        
    } catch (error) {
        console.error(`❌ Error deleting post ${req.params.id}:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 6. Like a post
app.post('/api/posts/:id/like', async (req, res) => {
    try {
        console.log(`📨 POST /api/posts/${req.params.id}/like`);
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        const post = data.posts[req.params.id];
        
        if (!post) {
            console.log(`❌ Post ${req.params.id} not found for like`);
            return res.status(404).json({ success: false, error: 'Post not found' });
        }
        
        data.posts[req.params.id].likes = (post.likes || 0) + 1;
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        
        console.log(`❤️ Post ${req.params.id} liked, total: ${data.posts[req.params.id].likes}`);
        
        res.json({ 
            success: true, 
            likes: data.posts[req.params.id].likes,
            message: 'Post liked!'
        });
        
    } catch (error) {
        console.error(`❌ Error liking post ${req.params.id}:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 7. Add comment
app.post('/api/posts/:id/comments', async (req, res) => {
    try {
        console.log(`📨 POST /api/posts/${req.params.id}/comments`);
        const { author, content } = req.body;
        
        if (!content) {
            console.log('❌ No content for comment');
            return res.status(400).json({ 
                success: false, 
                error: 'Comment content is required' 
            });
        }
        
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        const post = data.posts[req.params.id];
        
        if (!post) {
            console.log(`❌ Post ${req.params.id} not found for comment`);
            return res.status(404).json({ success: false, error: 'Post not found' });
        }
        
        const comment = {
            id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            author: author || 'anonymous',
            content: content.trim(),
            date: new Date().toISOString(),
            likes: 0
        };
        
        if (!post.comments) post.comments = [];
        post.comments.push(comment);
        
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        
        console.log(`💬 Comment added to post ${req.params.id} by ${comment.author}`);
        
        res.json({ 
            success: true, 
            comment,
            message: 'Comment added successfully'
        });
        
    } catch (error) {
        console.error(`❌ Error adding comment to post ${req.params.id}:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 8. Get stats
app.get('/api/stats', async (req, res) => {
    try {
        console.log('📨 GET /api/stats');
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        const posts = Object.values(data.posts);
        
        const stats = {
            totalPosts: posts.length,
            publishedPosts: posts.filter(p => p.status === 'published').length,
            totalViews: posts.reduce((sum, p) => sum + (p.views || 0), 0),
            totalLikes: posts.reduce((sum, p) => sum + (p.likes || 0), 0),
            totalComments: posts.reduce((sum, p) => sum + ((p.comments || []).length), 0),
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
                .map(p => ({ id: p.id, title: p.title, author: p.author })),
            platformUptime: new Date() - new Date(data.meta.createdAt)
        };
        
        console.log(`📊 Stats: ${stats.totalPosts} posts, ${stats.totalViews} views`);
        
        res.json({ 
            success: true, 
            stats,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error getting stats:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// 9. Debug endpoint
app.get('/api/debug', async (req, res) => {
    try {
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        const posts = Object.values(data.posts);
        
        res.json({
            success: true,
            fileExists: true,
            postCount: posts.length,
            fileSize: JSON.stringify(data).length,
            samplePosts: posts.slice(0, 3).map(p => ({
                id: p.id,
                title: p.title,
                author: p.author,
                status: p.status
            })),
            serverTime: new Date().toISOString(),
            nodeVersion: process.version
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message,
            fileExists: false
        });
    }
});

// 10. Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: '🚀 Healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        endpoints: ['/api/posts', '/api/stats', '/health', '/api/debug']
    });
});

// Initialize and start
await initData();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Blog platform running on port ${PORT}`);
    console.log(`📁 Data file: ${DATA_FILE}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`🔧 Debug: http://localhost:${PORT}/api/debug`);
});
