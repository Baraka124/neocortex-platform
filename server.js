// server.js - Complete backend
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static('.')); // Serve static files from root

const CONTENT_FILE = path.join(__dirname, 'content.md');

// 1. Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. Read content
app.get('/api/content', async (req, res) => {
  try {
    const content = await fs.readFile(CONTENT_FILE, 'utf-8');
    res.json({ success: true, content });
  } catch (error) {
    // Create default content if file doesn't exist
    const defaultContent = `---
title: Welcome to My Platform 🚀
date: ${new Date().toISOString().split('T')[0]}
tags: welcome, demo
---

# Hello World! 🌍

This is my **auto-updating** platform powered by Railway!

## ✨ Features
- **Edit directly** in your browser
- **Auto-saves** to the server
- **Zero config** - just 3 files
- **Markdown support**

## 🛠️ How to Use
1. Click the **Edit button** ✏️
2. Make your changes
3. Save - it's live instantly!

---
title: Second Thought
date: ${new Date().toISOString().split('T')[0]}
tags: ideas, example
---

# This is Amazing! 🤯

You're editing a real markdown file through a web interface!

## Try It Yourself
Edit this text and watch it update in real-time!`;
    
    await fs.writeFile(CONTENT_FILE, defaultContent);
    res.json({ success: true, content: defaultContent });
  }
});

// 3. Update content (THE MAGIC!)
app.post('/api/content', async (req, res) => {
  try {
    const { content } = req.body;
    await fs.writeFile(CONTENT_FILE, content, 'utf-8');
    res.json({ 
      success: true, 
      message: 'Updated successfully!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update' 
    });
  }
});

// 4. Health check
app.get('/health', (req, res) => {
  res.json({ status: '🚀 Live', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
