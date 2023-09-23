const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost')

//TODO: err log
//const logger = require('../utils/logger'); // Assume logger is implemented in utils/logger.js

/* ------ Get all blog posts ------ */
router.get('/', async (req, res) => {
    try {
        const blogPosts = await BlogPost.find();
        res.json(blogPosts);
    } catch (err) {
        console.error('Error fetching blog posts:', err);
        res.status(500).json({error:'Internal server error', message: 'Error getting blog posts list' });
    }
});

/* ------ Get blog post by ID ------ */
router.get('/:id', async (req, res) => {
    try {
        const blogPost = await BlogPost.findById(req.params.id);
        if (!blogPost) {
            return res.status(404).json({ error: 'Blog post not found', message: 'Error finding blog posts by ID' });
        }
        res.json(blogPost);
    } catch (err) {
        console.error('Error fetching blog post by ID:', err);
        res.status(500).json({ error: 'Internal server error', message: 'Error getting blog posts by ID' });
    }
});

/* ------ Post blog post by ID ------ */
router.post('/', async (req, res) => {
    try {
        const { title, content, author } = req.body;
        const newBlogPost = new BlogPost({ title, content, author });
        await newBlogPost.save();
        res.status(201).json(newBlogPost);
    } catch (err) {
        console.error('Error creating new blog post:', err);
        res.status(500).json({ error: 'Internal server error', message: 'Error creating new blog post' });
    }
});

/* ------ Update blog post by ID ------ */
router.put('/:id', async (req, res) => {
    try {
        const updateBlogPost = await BlogPost.findById(req.params.id);
        if(!updateBlogPost){
            return res.status(404).json({ error: 'Blog post not found', message: 'Error finding blog posts by ID' });
        }
        const { title, content, author } = req.body;
        updateBlogPost.title = title;
        updateBlogPost.content = content;
        updateBlogPost.author = author;
        await updateBlogPost.save();
        res.status(200).json(updateBlogPost);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error:'Internal server error', message: 'Error loading blog posts by ID' });
    }
});

/* ------ Delete blog post by ID ------ */
router.delete('/:id', async (req, res) => {
    try {
        const deleteBlogPost = await BlogPost.findById(req.params.id);
        if (!deleteBlogPost) {
            return res.status(404).json({ error: 'Blog post not found', message: 'Error finding blog posts by ID' });
        }
        const result = await BlogPost.findByIdAndDelete(req.params.id);
        res.json(result);
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).json({ error: 'Internal server error', message: 'Error deleting blog posts by ID'  });
    }
});


module.exports = router;