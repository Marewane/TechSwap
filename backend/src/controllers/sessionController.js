const moment = require('moment-timezone');
const Session = require('../models/SessionModel');
const User = require('../models/UserModel'); // Add this line

// Timezone utility functions
const getTimezoneOffset = () => {
  return new Date().getTimezoneOffset() * 60000; // in milliseconds
};

const convertToLocalTime = (date) => {
  // Convert UTC time to local server time (for comparison)
  return new Date(date.getTime() - getTimezoneOffset());
};

const convertToUTCTime = (date) => {
  // Convert local time to UTC (for storage)
  return new Date(date.getTime() + getTimezoneOffset());
};

// Better time comparison function
const isTimeInPast = (scheduledTime) => {
  const scheduled = new Date(scheduledTime);
  const now = new Date();
  
  // Compare using the same timezone reference (UTC)
  return scheduled.getTime() > now.getTime();
};

const isTimeInFuture = (scheduledTime) => {
  const scheduled = new Date(scheduledTime);
  const now = new Date();
  
  // Compare using the same timezone reference (UTC)
  return scheduled.getTime() > now.getTime();
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
/**
 * Create a new session between two different users
 */
const createSession = async (req, res) => {
  try {
    const { 
      scheduledTime, 
      title, 
      description, 
      sessionType,
      learnerId // Now we can specify the learner
    } = req.body;

    // Validate required fields
    if (!title || !scheduledTime) {
      return res.status(400).json({ 
        message: 'Session title and scheduled time are required' 
      });
    }

    // Validation - timezone-aware
    const scheduledDateTime = new Date(scheduledTime);
    if (isNaN(scheduledDateTime.getTime())) {
      return res.status(400).json({ message: 'Invalid scheduled time format' });
    }

    // // NEW: Timezone-aware past time check
    // if (isTimeInPast(scheduledDateTime)) {
    //   return res.status(400).json({ 
    //     message: 'Scheduled time cannot be in the past',
    //     serverTime: new Date().toISOString(),
    //     requestedTime: scheduledDateTime.toISOString()
    //   });
    // }
    //§§§§§§§§§§§§§§§§§§§§§§§§§§§
    //this code didnt work 
    // with it  we will have conflict time between pc and server 

    // if (scheduledDateTime < new Date()) {
    //   return res.status(400).json({ message: 'Scheduled time cannot be in the past' });
    // }
    
    //§§§§§§§§§§§§§§§§§§§§§§§§§§§

    // Validate that host and learner are different users
    const hostId = req.user._id;
    
    if (!learnerId) {
      return res.status(400).json({ message: 'learnerId is required' });
    }

    if (hostId.toString() === learnerId.toString()) {
      return res.status(400).json({ message: 'Host and learner cannot be the same user' });
    }

    // Verify both users exist
    const [hostUser, learnerUser] = await Promise.all([
      User.findById(hostId),
      User.findById(learnerId)
    ]);

    if (!hostUser) return res.status(404).json({ message: 'Host user not found' });
    if (!learnerUser) return res.status(404).json({ message: 'Learner user not found' });

    // Check for time conflicts for both users
    const participantIds = [hostId.toString(), learnerId.toString()];
    const newStart = new Date(scheduledTime);
    const newEnd = new Date(newStart.getTime() + 120 * 60000); // 2 hours
    
    const conflicts = await findConflicts(participantIds, newStart, newEnd);
    if (conflicts.length > 0) {
      return res.status(409).json({ 
        error: 'Time slot conflict for one of the participants', 
        conflicts 
      });
    }

    // Create the session
    const newSession = await Session.create({
      hostId,
      learnerId,
      scheduledTime: scheduledDateTime,  // Store as is (UTC)
      title,
      description: description || '',
      sessionType: sessionType || 'skillExchange',
      // Duration auto-set to 120 minutes by model
      //createdBy: req.user._id
    });

    // Return populated session
    const populated = await Session.findById(newSession._id)
      .populate('hostId', 'name email')
      .populate('learnerId', 'name email');

    return res.status(201).json({ 
      message: 'Session created successfully', 
      data: populated 
    });
  } catch (error) {
    console.error('Session creation error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get all sessions for the current user
 */
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
      //.populate('createdBy', 'name email'); // we romove thid 

    return res.json({ data: sessions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get session by ID
 */
const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('hostId', 'name email')
      .populate('learnerId', 'name email')
      //.populate('createdBy', 'name email');

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
   return res.status(400).json({ 
    error: 'Bad Request', 
    message: 'Session updates are not allowed. Use /start-live, /end-live, or /mark-no-show endpoints.' 
  });
  // try {
  //   const sessionId = req.params.id;
  //   const updates = req.body;

  //   const session = await Session.findById(sessionId);
  //   if (!session) return res.status(404).json({ error: 'Session not found' });

  //   // Determine candidate new start/end for availability check
  //   const newStart = updates.scheduledTime ? new Date(updates.scheduledTime) : new Date(session.scheduledTime);
  //   const newDuration = (updates.duration !== undefined) ? updates.duration : session.duration;
  //   const newEnd = new Date(newStart.getTime() + newDuration * 60000);

  //   const participantIds = [session.hostId.toString(), session.learnerId.toString()];
  //   const conflicts = await findConflicts(participantIds, newStart, newEnd, sessionId);
  //   if (conflicts.length > 0) {
  //     return res.status(409).json({ error: 'Time slot conflict for one of the participants', conflicts });
  //   }

  //   Object.assign(session, updates);
  //   await session.save();

  //   // return populated session
  //   const populated = await Session.findById(sessionId)
  //     .populate('hostId', 'name email')
  //     .populate('learnerId', 'name email')
  //     //.populate('createdBy', 'name email');

  //   return res.json({ message: 'Session updated successfully', data: populated });
  // } catch (error) {
  //   return res.status(500).json({ error: error.message });
  // }
};


//old version

// /**
//  * Cancel a session
//  */
// const cancelSession = async (req, res) => {
//   try {
//     const sessionId = req.params.id;
//     const session = await Session.findById(sessionId);
//     if (!session) return res.status(404).json({ error: 'Session not found' });

//     session.status = 'cancelled';
//     await session.save();

//     const populated = await Session.findById(sessionId)
//       .populate('hostId', 'name email')
//       .populate('learnerId', 'name email')
//       //.populate('createdBy', 'name email');

//     return res.json({ message: 'Session cancelled', data: populated });
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// };


// src/controllers/sessionController.js
// ...
/**
 * Cancel a session
 * Allows either the host or the learner to cancel the session,
 * but only if it's scheduled (before it goes live).
 */
const cancelSession = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const userId = req.user._id; // Get the ID of the user making the request

    // 1. Find the session
    const session = await Session.findById(sessionId);
    if (!session) {
      console.warn(`CancelSession: Session ${sessionId} not found.`);
      return res.status(404).json({ error: 'Session not found' });
    }

    // 2. Authorization: Check if the user is either the host or the learner
    const isHost = session.hostId.toString() === userId.toString();
    const isLearner = session.learnerId.toString() === userId.toString();

    if (!isHost && !isLearner) {
      console.warn(`CancelSession: User ${userId} is not authorized to cancel session ${sessionId}.`);
      return res.status(403).json({ error: 'Not authorized to cancel this session' });
    }

    // 3. Business Logic: Check if session is in a valid state to be cancelled
    // Based on your current flow, only 'scheduled' sessions should be cancellable via this endpoint.
    // If you later add a 'ready' state, you can include it here: ['scheduled', 'ready']
    const isValidStatus = session.status === 'scheduled'; 
    if (!isValidStatus) {
      console.warn(`CancelSession: Cannot cancel session ${sessionId} with status '${session.status}'.`);
      return res.status(400).json({ 
        error: 'Cannot cancel session', 
        message: `Session with status '${session.status}' cannot be cancelled.` 
      });
    }

    // 4. Perform cancellation
    session.status = 'cancelled';
    session.updatedAt = new Date(); // Explicitly update timestamp

    await session.save();

    console.log(`CancelSession: Session ${sessionId} cancelled by user ${userId} (${isHost ? 'Host' : 'Learner'}).`);

    // 5. Populate and return
    const populated = await Session.findById(sessionId)
      .populate('hostId', 'name email')
      .populate('learnerId', 'name email');

    // 6. Emit Socket.IO event (Optional)
    // const { io } = require('../server'); // Adjust path
    // if (io) {
    //   io.to(`session-${sessionId}`).emit('session-cancelled', {
    //     sessionId: session._id,
    //     cancelledBy: userId,
    //     cancelledByName: isHost ? populated.hostId.name : populated.learnerId.name,
    //     timestamp: session.updatedAt
    //   });
    // }

    return res.json({ 
      message: 'Session cancelled successfully', 
       populated 
    });
  } catch (err) {
    console.error('CancelSession: Internal server error:', err);
    return res.status(500).json({ error: 'Internal server error while cancelling session' });
  }
};

// 
/** §§§ 1.2
 * Get upcoming sessions for current user
 */
const getUpcomingSessions = async (req, res) => {
  try {
    // 1. Get the currently logged-in user's ID
    const userId = req.user._id;
    
    // 2. Get current time to compare with scheduled times
    const now = new Date();
    
    // 3. Query database for upcoming sessions
    const sessions = await Session.find({
      // 4. Find sessions where user is either host OR learner
      $or: [
        { hostId: userId },
        { learnerId: userId }
      ],
      
      // 5. Only sessions scheduled for NOW or FUTURE
      scheduledTime: { $gte: now }, // $gte = "greater than or equal to"
      
      // 6. Only sessions that are scheduled or in-progress (not completed/cancelled)
      status: { $in: ['scheduled', 'in-progress'] }
    })
    .sort({ scheduledTime: 1 })  // 7. Sort by time (oldest first, 1 = ascending)
    .populate('hostId', 'name email')    // 8. Replace hostId with user's name+email
    .populate('learnerId', 'name email'); // 9. Replace learnerId with user's name+email

    // 10. Return the sessions
    return res.json({ data: sessions });
  } catch (err) {
    // 11. Error handling
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get completed sessions for current user
 */
const getCompletedSessions = async (req, res) => {
  try {
    // 1. Get the currently logged-in user's ID
    const userId = req.user._id;
    
    // 2. Query database for completed sessions
    const sessions = await Session.find({
      // 3. Find sessions where user is either host OR learner
      $or: [
        { hostId: userId },
        { learnerId: userId }
      ],
      
      // 4. Only sessions that are COMPLETED or NO-SHOW
      status: { $in: ['completed', 'no-show'] }
    })
    .sort({ scheduledTime: -1 })  // 5. Sort by time (newest first, -1 = descending)
    .populate('hostId', 'name email')    // 6. Replace hostId with user's name+email
    .populate('learnerId', 'name email'); // 7. Replace learnerId with user's name+email

    // 8. Return the sessions
    return res.json({  sessions });
  } catch (err) {
    // 9. Error handling
    res.status(500).json({ message: err.message });
  }
};


/**
 * Mark session as ready (for lobby system)  - timezone-aware
 */

const markSessionReady = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Only session participants can mark as ready
    if (session.hostId.toString() !== userId.toString() && 
        session.learnerId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

     // NEW: Timezone-aware time check
    // if (isTimeInFuture(session.scheduledTime)) {
    //   return res.status(400).json({ 
    //     error: 'Session is not ready yet', 
    //     scheduledTime: session.scheduledTime,
    //     currentTime: new Date().toISOString(),
    //     timeDifference: new Date(session.scheduledTime).getTime() - new Date().getTime()
    //   });
    // }

    // same probleme of time between server and pc 
    //§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§
    // Convert to actual date objects for comparison
    const scheduledTime = new Date(session.scheduledTime);
    const now = new Date();
    
    console.log("Scheduled:", scheduledTime, "Now:", now, "Comparison:", scheduledTime <= now);

    // Check if we're at/after scheduled time (fix: use <= instead of >)
    if (scheduledTime > now) {
      return res.status(400).json({ 
        error: 'Session is not ready yet', 
        scheduledTime: scheduledTime,
        currentTime: now,
        timeDifference: scheduledTime - now  // milliseconds difference
      });
    }
    //§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§

    // Only change to 'ready' if not already started
    if (session.status === 'scheduled') {
      session.status = 'ready';
      await session.save();
    } else if (session.status === 'ready') {
      return res.json({ 
        message: 'Session is already ready', 
        data: await Session.findById(session._id)
          .populate('hostId', 'name email')
          .populate('learnerId', 'name email')
      });
    }

    const populated = await Session.findById(session._id)
      .populate('hostId', 'name email')
      .populate('learnerId', 'name email');

    return res.json({ 
      message: 'Session marked as ready', 
      data: populated 
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
/**
 * Start live session (only HOST can start)
 */

// User clicks "Start Session" button
//     ↓
// Frontend calls: POST /api/sessions/SESSION_ID/start-live
//     ↓
// Backend validates everything
//     ↓
// Database updates: status = 'in-progress', startedAt = NOW
//     ↓
// Frontend receives success → navigates to live session page



// scheduled → mark-ready → in-progress
//     ↑           ↑           ↑
//   Auto      Host clicks   Host starts
//   (time)    "Ready" btn   "Start" btn

//old
// const startLiveSession = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user._id;

//     const session = await Session.findById(id);
//     if (!session) return res.status(404).json({ error: 'Session not found' });

//     // Only HOST can start the session
//     if (session.hostId.toString() !== userId.toString()) {
//       return res.status(403).json({ error: 'Only host can start this session' });
//     }

//     // Session must be in "ready" status to start
//     if (session.status !== 'ready') {
//       return res.status(400).json({ 
//         error: 'Session is not ready to start', 
//         currentStatus: session.status 
//       });
//     }
//     // NEW: Ensure we can start (timezone-aware)
//     if (isTimeInFuture(session.scheduledTime)) {
//       return res.status(400).json({ 
//         error: 'Cannot start session before scheduled time',
//         scheduledTime: session.scheduledTime,
//         currentTime: new Date().toISOString()
//       });
//     }

//     // // Update session status and start time
//     // session.status = 'in-progress';
//     // session.startedAt = new Date();
//     // await session.save();

//     //§§§§§§§§§§§§§§§§§§§§§§§ time conflicte 
//     // Update session status and start time
//     session.status = 'in-progress';
//     session.startedAt = new Date();
//     await session.save();
//     //§§§§§§§§§§§§§§§§§§§§§§§§§

//     //v1
//     // // Emit socket event to notify other participant
//     // const io = require('../server').io; // Reference to socket.io instance
//     // io.to(`session-${id}`).emit('session-started', {
//     //   sessionId: id,
//     //   startedBy: userId,
//     //   startedAt: session.startedAt
//     // });

//     // Emit socket event to notify other participant
//     const { io } = require('./server'); // Get the io instance
//     if (io) {
//       io.to(`session-${id}`).emit('session-started', {
//         sessionId: id,
//         startedBy: userId,
//         startedAt: session.startedAt
//       });
//     }

//     const populated = await Session.findById(session._id)
//       .populate('hostId', 'name email')
//       .populate('learnerId', 'name email');

//     return res.json({ 
//       message: 'Session started successfully', 
//        populated 
//     });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// //worked perfectly
const startLiveSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id);
    if (!session) {
      console.error(`StartLiveSession: Session ${id} not found.`);
      return res.status(404).json({ error: 'Session not found' });
    }

    // Authorization: Only HOST can start the session
    if (session.hostId.toString() !== userId.toString()) {
      console.warn(`StartLiveSession: User ${userId} is not the host (${session.hostId}) for session ${id}.`);
      return res.status(403).json({ error: 'Only host can start this session' });
    }

    // Authorization & Status Check: Must be 'scheduled' or 'ready'
    // Allow starting if:
    // 1. Status is 'ready' (can start anytime)
    // 2. Status is 'scheduled' AND (time has passed OR within 5 minutes before scheduled time)
    const now = new Date();
    const scheduledTime = new Date(session.scheduledTime);
    const fiveMinutesInMillis = 5 * 60 * 1000;
    const timeDifference = scheduledTime.getTime() - now.getTime();

    const isReady = session.status === 'ready';
    const isScheduledAndTimeReached = session.status === 'scheduled' && now >= scheduledTime;
    // Allow starting 'scheduled' sessions within 5 minutes BEFORE scheduled time (timeDifference is positive)
    const isScheduledAndWithinBuffer = session.status === 'scheduled' && timeDifference > 0 && timeDifference <= fiveMinutesInMillis;

    if (!(isReady || isScheduledAndTimeReached || isScheduledAndWithinBuffer)) {
      const minutesUntil = Math.round(timeDifference / (1000 * 60));
      console.warn(`StartLiveSession: Session ${id} cannot start. Status: ${session.status}, Now: ${now.toISOString()}, Scheduled: ${scheduledTime.toISOString()}, Minutes until: ${minutesUntil}`);
      return res.status(400).json({ 
        error: 'Session is not ready to start', 
        currentStatus: session.status,
        currentTime: now.toISOString(),
        scheduledTime: scheduledTime.toISOString(),
        minutesUntil: minutesUntil,
        message: "Session must be 'ready' or 'scheduled' (within 5 minutes of scheduled time or after)."
      });
    }

    // Additional check: If trying to start more than 5 minutes before, block it
    if (timeDifference > fiveMinutesInMillis) {
      const minutesEarly = Math.round(timeDifference / (1000 * 60));
      console.warn(`StartLiveSession: Attempting to start session ${id} too early. Scheduled: ${scheduledTime.toISOString()}, Now: ${now.toISOString()}, ${minutesEarly} minutes early`);
      return res.status(400).json({ 
        error: 'Cannot start session more than 5 minutes before scheduled time',
        scheduledTime: scheduledTime.toISOString(),
        currentTime: now.toISOString(),
        timeDifferenceMinutes: minutesEarly
      });
    }

    // If it was 'scheduled', transition it to 'in-progress' directly
    // If it was 'ready', it also transitions to 'in-progress'
    // Update session status and start time
    session.status = 'in-progress';
    session.startedAt = now; // Use current time for consistency
    await session.save();

    console.log(`StartLiveSession: Session ${id} started successfully by host ${userId}.`);

    // Emit socket event to notify other participant
    // Use the shared `io` instance correctly
    const { io } = require('../server'); // Adjust path if needed, e.g., '../../server'
    if (io) {
      io.to(`session-${id}`).emit('session-started', {
        sessionId: id,
        startedBy: userId,
        startedAt: session.startedAt
      });
      console.log(`StartLiveSession: Emitted 'session-started' event for session ${id}.`);
    } else {
      console.warn(`StartLiveSession: Socket.IO instance not found. Could not emit event for session ${id}.`);
    }

    // Populate and return
    const populated = await Session.findById(session._id)
      .populate('hostId', 'name email')
      .populate('learnerId', 'name email');

    return res.json({ 
      message: 'Session started successfully', 
      data: populated // Fixed typo: was ` populated` 
    });
  } catch (error) {
    console.error('StartLiveSession: Internal server error:', error);
    // Include stack trace in development, not in production
    return res.status(500).json({ 
      error: 'Internal server error while starting session', 
      // message: error.message // Uncomment for more detail in dev 
    });
  }
};

// new start live session 


/**
 * End live session (set status to 'completed')
 */
const endLiveSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Check if user is authorized to end this session
    if (session.hostId.toString() !== userId.toString() && 
        session.learnerId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to end this session' });
    }

    if (session.status !== 'in-progress') {
      return res.status(400).json({ error: 'Session is not in progress' });
    }

    // Calculate actual duration
    const endedAt = new Date();
    const startedAt = session.startedAt || session.scheduledTime;
    const actualDuration = Math.round((endedAt - startedAt) / (1000 * 60)); // in minutes

    // Update session
    session.status = 'completed';
    session.endedAt = endedAt;
    session.actualDuration = actualDuration;
    await session.save();

    const populated = await Session.findById(session._id)
      .populate('hostId', 'name email')
      .populate('learnerId', 'name email');

    return res.json({ 
      message: 'Session ended successfully', 
      data: populated 
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Mark session as no-show
 */
const markNoShow = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Only the host can mark learner as no-show, only learner can mark host as no-show
    // Or either participant can mark if both don't show up
    if (session.hostId.toString() !== userId.toString() && 
        session.learnerId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to mark no-show for this session' });
    }

    if (session.status !== 'scheduled') {
      return res.status(400).json({ error: 'Cannot mark no-show for session that is not scheduled' });
    }

    session.status = 'no-show';
    await session.save();

    const populated = await Session.findById(session._id)
      .populate('hostId', 'name email')
      .populate('learnerId', 'name email');

    return res.json({ 
      message: 'Session marked as no-show', 
      data: populated 
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};



module.exports = {
  createSession,
  getMySessions,
  getSessionById,
  updateSession,
  cancelSession,
  isOverlapping,
  findConflicts,
  getUpcomingSessions,
  getCompletedSessions,
  markSessionReady,
  startLiveSession,
  endLiveSession,
  markNoShow
};
