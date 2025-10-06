const Session = require('../models/SessionModel');

/**
 * Create a new session
 */
const createSession = async (req, res) => {
  try {
    const { hostId, learnerId, scheduledTime, duration, title, description, sessionType, cost } = req.body;

    // basic validation
    if (!hostId || !learnerId || !scheduledTime || !duration) {
      return res.status(400).json({ error: 'hostId, learnerId, scheduledTime and duration are required' });
    }

    // create a session document
    const newSession = await Session.create({
      hostId,
      learnerId,
      scheduledTime,
      duration,
      title,
      description,
      sessionType,
      cost
    });

    res.status(201).json({ message: 'Session created', data: newSession });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMySessions = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'userId query param required' });

    const sessions = await Session.find({
      $or: [{ hostId: userId }, { learnerId: userId }]
    }).sort({ scheduledTime: -1 });

    return res.json({ data: sessions });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const updateSession = async (req, res) => {
  try {
    const sessionId = req.params.id; // get the session ID from the URL
    const updates = req.body;         // fields to update

    // Find the session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Apply updates
    Object.assign(session, updates);

    // Save changes
    await session.save();

    return res.json({ message: 'Session updated successfully', data: session });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


module.exports = { createSession , getMySessions, updateSession };
