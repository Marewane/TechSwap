const Post = require('../models/PostModel');

// Create a new post
const createPost = async (req, res) => {
  try {
    const { skillsOffered, skillsWanted, title, content, availability } = req.body;

    const post = await Post.create({
      userId: req.user._id,
      title,
      content,
      skillsOffered,
      skillsWanted,
      availability
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all posts with pagination
const getAllPosts = async (req, res) => {
  try {
    let { page, limit } = req.query;

    page = parseInt(page) || 1; // default page 1
    limit = parseInt(limit) || 10; // default 10 posts per page
    const skip = (page - 1) * limit;

    const totalPosts = await Post.countDocuments();
    const posts = await Post.find()
      .populate('userId', 'name avatar skillsToTeach skillsToLearn rating totalSession')
      .sort({ createdAt: -1 }) 
      .skip(skip)
      .limit(limit);

    res.json({
      total: totalPosts,
      page,
      totalPages: Math.ceil(totalPosts / limit),
      posts
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single post by ID
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('userId', 'name avatar skillsToTeach skillsToLearn rating totalSession');

    if (!post) return res.status(404).json({ message: 'Post not found' });

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createPost, getAllPosts, getPostById };