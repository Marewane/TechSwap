const Post = require('../models/PostModel');

const broadcastPostEvent = (req, event, payload) => {
  try {
    const io = req?.app?.get('io');
    if (io) {
      io.emit(event, payload);
    }
  } catch (error) {
    console.error(`❌ Failed to emit socket event ${event}:`, error);
  }
};

// Helper function to generate time slots (time only, no day)
const generateTimeSlots = (start, end, days) => {
    if (!start || !end || !days || days.length === 0) return [];
    
    const slots = [];
    const [startHour, startMin] = start.split(":").map(Number);
    const [endHour, endMin] = end.split(":").map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const intervalMinutes = 30;

    while (currentMinutes + 120 <= endMinutes) {
        const slotStartMinutes = currentMinutes;
        const slotEndMinutes = currentMinutes + 120;
        
        const startHours = Math.floor(slotStartMinutes / 60);
        const startMins = slotStartMinutes % 60;
        const endHours = Math.floor(slotEndMinutes / 60);
        const endMins = slotEndMinutes % 60;
        
        const startTimeFormatted = `${String(startHours).padStart(2, '0')}:${String(startMins).padStart(2, '0')}`;
        const endTimeFormatted = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
        
        // Create time slot without day: "12:00 - 14:00"
        const timeSlot = `${startTimeFormatted} - ${endTimeFormatted}`;
        
        // Only add unique time slots (avoid duplicates)
        if (!slots.includes(timeSlot)) {
            slots.push(timeSlot);
        }
        
        currentMinutes += intervalMinutes;
    }

    return slots;
};

// Create a new post
const createPost = async (req, res) => {
  try {
    console.log('=== CREATE POST STARTED ===');
    console.log('🔍 req.user:', req.user);
    console.log('🔍 req.body:', req.body);

    const { skillsOffered, skillsWanted, title, content, availability } = req.body;

    // Get user ID from auth middleware
    const userId = req.user._id;

    if (!userId) {
      console.error('❌ ERROR: No user ID found in req.user');
      return res.status(401).json({ 
        success: false,
        message: 'User authentication failed - no user ID' 
      });
    }

    console.log('✅ Using user ID:', userId);

    // Validate and format availability data
    let formattedAvailability = {
        days: [],
        startTime: "",
        endTime: ""
    };

    if (availability && availability.days && availability.days.length > 0) {
        formattedAvailability = {
            days: availability.days,
            startTime: availability.startTime || "",
            endTime: availability.endTime || ""
        };
    }

    console.log('📅 Formatted availability:', formattedAvailability);

    // Generate time slots if availability is provided
    const timeSlotsAvailable = formattedAvailability.days.length > 0 && 
                              formattedAvailability.startTime && 
                              formattedAvailability.endTime
        ? generateTimeSlots(
            formattedAvailability.startTime, 
            formattedAvailability.endTime, 
            formattedAvailability.days
          )
        : [];

    console.log('⏰ Time slots generated:', timeSlotsAvailable.length);

    const postData = {
      userId: userId,
      title,
      content,
      skillsOffered: skillsOffered || [],
      skillsWanted: skillsWanted || [],
      availability: formattedAvailability,
      timeSlotsAvailable
    };

    console.log('📝 Final post data:', postData);

    const post = await Post.create(postData);

    // Populate user data in response
    await post.populate('userId', 'name avatar skillsToTeach skillsToLearn rating totalSession');

    console.log('✅ Post created successfully:', post._id);
    console.log('=== CREATE POST COMPLETED ===');

    broadcastPostEvent(req, 'post:created', { post });

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (err) {
    console.error('❌ ERROR in createPost:', err);
    console.error('❌ Error details:', err.message);
    console.error('❌ Error stack:', err.stack);
    
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get all posts with pagination
const getAllPosts = async (req, res) => {
  try {
    let { page, limit } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;

    const totalPosts = await Post.countDocuments();
    const posts = await Post.find()
      .populate('userId', 'name avatar skillsToTeach skillsToLearn rating totalSession')
      .sort({ createdAt: -1 }) 
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      total: totalPosts,
      page,
      totalPages: Math.ceil(totalPosts / limit),
      posts
    });
  } catch (err) {
    console.error('❌ ERROR in getAllPosts:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get a single post by ID
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('userId', 'name avatar skillsToTeach skillsToLearn rating totalSession');

    if (!post) {
      return res.status(404).json({ 
        success: false,
        message: 'Post not found' 
      });
    }

    res.json({
      success: true,
      data: post
    });
  } catch (err) {
    console.error('❌ ERROR in getPostById:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Update an existing post (owner only)
const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user?._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (String(post.userId) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this post' });
    }

    const { title, content, skillsOffered, skillsWanted, availability } = req.body;

    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (skillsOffered !== undefined) post.skillsOffered = skillsOffered;
    if (skillsWanted !== undefined) post.skillsWanted = skillsWanted;

    if (availability) {
      const formattedAvailability = {
        days: Array.isArray(availability.days) ? availability.days : [],
        startTime: availability.startTime || "",
        endTime: availability.endTime || "",
      };
      post.availability = formattedAvailability;

      post.timeSlotsAvailable = formattedAvailability.days.length > 0 &&
        formattedAvailability.startTime &&
        formattedAvailability.endTime
        ? generateTimeSlots(
            formattedAvailability.startTime,
            formattedAvailability.endTime,
            formattedAvailability.days
          )
        : [];
    }

    const updated = await post.save();
    const populated = await updated.populate('userId', 'name avatar skillsToTeach skillsToLearn rating totalSession');

    broadcastPostEvent(req, 'post:updated', { postId: populated._id, post: populated });

    return res.json({ success: true, data: populated });
  } catch (err) {
    console.error('❌ ERROR in updatePost:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createPost, getAllPosts, getPostById, updatePost };