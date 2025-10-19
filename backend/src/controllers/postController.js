const Post = require('../models/PostModel');

const createPost = async (req, res) => {
  try {
    const { type, skillsOffered, skillsWanted, title, content, tags } = req.body;
    const post = await Post.create({
      userId: req.user._id,
      type,
      skillsOffered,
      skillsWanted,
      title,
      content,
      tags
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: 'active' }).populate('userId', 'username');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('userId', 'username');
    if (!post) return res.status(404).json({ message: 'Not found.' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createPost, getAllPosts, getPostById };