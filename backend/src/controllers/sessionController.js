const Session = require('../models/SessionModel');

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

const createSession = async (req, res) => {
  try {
    const { hostId, learnerId, scheduledTime, duration, title, description, sessionType, cost } = req.body;

    if (!hostId || !learnerId || !scheduledTime || !duration) {
      return res.status(400).json({ error: 'hostId, learnerId, scheduledTime and duration are required' });
    }

    const start = new Date(scheduledTime);
    const end = new Date(start.getTime() + duration * 60000);
    const participantIds = [hostId, learnerId];

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
      scheduledTime: start,
      duration,
      title,
      description,
      sessionType,
      cost,
      createdBy: req.user && (req.user.id || req.user._id) ? (req.user.id || req.user._id) : undefined
    });

    // return populated session (host and learner names/emails)
    const populated = await Session.findById(newSession._id)
      .populate('hostId', 'name email')
      .populate('learnerId', 'name email')
      .populate('createdBy', 'name email');

    return res.status(201).json({ message: 'Session created successfully', data: populated });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getMySessions = async (req, res) => {
  try {
    // prefer authenticated user id if available
    const authUserId = req.user && (req.user.id || req.user._id) ? String(req.user.id || req.user._id) : null;
    const userId = req.query.userId || authUserId;
    if (!userId) return res.status(400).json({ error: 'userId query param required or authenticate' });

    const sessions = await Session.find({
      $or: [{ hostId: userId }, { learnerId: userId }]
    })
      .sort({ scheduledTime: -1 })
      .populate('hostId', 'name email')
      .populate('learnerId', 'name email')
      .populate('createdBy', 'name email');

    return res.json({ data: sessions });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('hostId', 'name email')
      .populate('learnerId', 'name email')
      .populate('createdBy', 'name email');

    if (!session) return res.status(404).json({ error: 'Session not found' });
    return res.json({ data: session });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateSession = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const updates = req.body;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // determine candidate new start/end for availability check
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

    // return populated session
    const populated = await Session.findById(sessionId)
      .populate('hostId', 'name email')
      .populate('learnerId', 'name email')
      .populate('createdBy', 'name email');

    return res.json({ message: 'Session updated successfully', data: populated });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const cancelSession = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    session.status = 'cancelled';
    await session.save();

    const populated = await Session.findById(sessionId)
      .populate('hostId', 'name email')
      .populate('learnerId', 'name email')
      .populate('createdBy', 'name email');

    return res.json({ message: 'Session cancelled', data: populated });
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
  // helpers exported for tests if needed
  isOverlapping,
  findConflicts
};
