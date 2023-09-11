const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost')


router.get('/', async (req, res) => {
    try {
        const blogPosts = await BlogPost.find();
        res.json(blogPosts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const blogPost = await BlogPost.findById(req.params.id);
        if (!blogPost) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.json(blogPost);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        console.log(req.body)
        const { title, content, author } = req.body;
        const newBlogPost = new BlogPost({ title, content, author });
        await newBlogPost.save();
        res.status(201).json(newBlogPost);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/:id', async (req, res) => {
    console.log('1')
    try {
        console.log('2')
        const updateBlogPost = await BlogPost.findById(req.params.id);
        if(!updateBlogPost){
            return res.status(404).json({ message: 'did not find post' });
        }
        const { title, content, author } = req.body;
        updateBlogPost.title = title;
        updateBlogPost.content = content;
        updateBlogPost.author = author;
        await updateBlogPost.save();
        res.status(201).json(updateBlogPost);
        console.log('3')
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.delete('/:id', async (req, res) => {
    const deleteBlogPost = await BlogPost.findById(req.params.id);
    try {
        if (!deleteBlogPost) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        const result = await BlogPost.findByIdAndDelete(req.params.id);
        res.json(result);
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;