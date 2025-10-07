const Session = require('../models/SessionModel');

/**
 * Create a new session (with availability check)
 */
const createSession = async (req, res) => {
  try {
    const { hostId, learnerId, scheduledTime, duration, title, description, sessionType, cost } = req.body;

    // basic validation
    if (!hostId || !learnerId || !scheduledTime || !duration) {
      return res.status(400).json({ error: 'hostId, learnerId, scheduledTime and duration are required' });
    }

    const start = new Date(scheduledTime);
    const end = new Date(start.getTime() + duration * 60000);
    const participantIds = [hostId, learnerId];

    // ✅ check for overlapping sessions
    const conflicts = await findConflicts(participantIds, start, end);
    if (conflicts.length > 0) {
      return res.status(409).json({
        error: 'Time slot conflict for one of the participants',
        conflicts
      });
    }

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

    res.status(201).json({ message: 'Session created successfully', data: newSession });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
    status: { $in: ['scheduled', 'in-progress'] } // only check active sessions
  };

  if (excludeSessionId) query._id = { $ne: excludeSessionId };

  const sessions = await Session.find(query).lean();

  return sessions.filter(s => {
    const sStart = new Date(s.scheduledTime);
    const sEnd = new Date(sStart.getTime() + (s.duration || 0) * 60000);
    return isOverlapping(sStart, sEnd, start, end);
  });
}

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
    const sessionId = req.params.id;
    const updates = req.body;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Determine new start/end for availability check
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

const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    return res.json({ data: session });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createSession,
  getMySessions,
  updateSession,
  getSessionById
};
