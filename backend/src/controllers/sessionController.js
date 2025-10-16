const Session = require('../models/SessionModel');
const ChatRoom = require('../models/ChatRoomModel');

/**
 * Helper: check overlap between two intervals
 */
function isOverlapping(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

/**
 * Find existing sessions for the same host or learner
 */
async function findConflicts(participantIds, start, end, excludeSessionId = null) {
  const query = {
    $or: [
      { hostId: { $in: participantIds } },
      { learnerId: { $in: participantIds } }
    ],
    status: { $in: ['scheduled', 'in-progress'] }
  };

  if (excludeSessionId) query._id = { $ne: excludeSessionId };

  const sessions = await Session.find(query).lean();

  return sessions.filter(s => {
    const sStart = new Date(s.scheduledTime);
    const sEnd = new Date(sStart.getTime() + (s.duration || 0) * 60000);
    return isOverlapping(sStart, sEnd, start, end);
  });
}

/**
 * Create a new session
 */
const createSession = async (req, res) => {
  try {
    const { chatRoomId, scheduledTime, duration, title, cost } = req.body;

    // Validate required fields
    if (!title || !cost) {
      return res.status(400).json({ message: 'Session title and cost are required' });
    }

    if (!chatRoomId || !scheduledTime || !duration) {
      return res.status(400).json({ message: 'Chat room, scheduled time, and duration are required' });
    }

    // 1 => Find chat room
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) return res.status(404).json({ message: 'Chat room not found.' });

    // 2 => Check participant authorization
    if (!chatRoom.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    // 3 => Create the session
    const session = await Session.create({
      hostId: chatRoom.participants[0],
      learnerId: chatRoom.participants[1],
      scheduledTime,
      duration,
      chatRoomId,
      title,
      cost
    });

    // 4 => Link the session to the chat room
    chatRoom.sessionId = session._id;
    await chatRoom.save();

    res.status(201).json({
      message: 'Session created and linked to chat room successfully.',
      session,
      chatRoom
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get all sessions for the current user
 */
const getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ hostId: req.user._id }, { learnerId: req.user._id }]
    }).populate('hostId learnerId');
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get session by ID
 */
const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    return res.json({ data: session });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Update a session
 */
const updateSession = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const updates = req.body;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Determine candidate new start/end for availability check
    const newStart = updates.scheduledTime ? new Date(updates.scheduledTime) : new Date(session.scheduledTime);
    const newDuration = (updates.duration !== undefined) ? updates.duration : session.duration;
    const newEnd = new Date(newStart.getTime() + newDuration * 60000);

    const participantIds = [session.hostId.toString(), session.learnerId.toString()];
    const conflicts = await findConflicts(participantIds, newStart, newEnd, sessionId);
    if (conflicts.length > 0) {
      return res.status(409).json({ error: 'Time slot conflict for one of the participants', conflicts });
    }

    Object.assign(session, updates);
    await session.save();

    return res.json({ message: 'Session updated successfully', data: session });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Cancel a session
 */
const cancelSession = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    session.status = 'cancelled';
    await session.save();

    return res.json({ message: 'Session cancelled', data: session });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createSession,
  getMySessions,
  getSessionById,
  updateSession,
  cancelSession,
  isOverlapping,
  findConflicts
};
