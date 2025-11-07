const SwapRequest = require('../models/SwapRequestModel');
const { emitToUser } = require('./socketRegistry');

const enrichNotification = async (notificationDoc) => {
  if (!notificationDoc) return null;

  try {
    const populated = await notificationDoc.populate('senderId', 'name avatar');
    const json = populated.toObject();
    const userId = json.userId?.toString();

    let swapMeta = null;
    if (json.relatedModel === 'SwapRequest' && json.relatedId) {
      try {
        const swapRequest = await SwapRequest.findById(json.relatedId).populate('postId');
        if (swapRequest) {
          const requesterId = swapRequest.requesterId?.toString();
          const ownerId = swapRequest.postId?.userId?.toString();
          swapMeta = {
            status: swapRequest.status,
            requesterPaid: !!swapRequest.requesterPaid,
            ownerPaid: !!swapRequest.ownerPaid,
            youAreRequester: requesterId === userId,
            youAreOwner: ownerId === userId,
          };
        }
      } catch (error) {
        console.warn('Failed to enrich swap notification metadata:', error.message);
      }
    }

    return {
      ...json,
      userId,
      sender: json.senderId || null,
      swapMeta,
    };
  } catch (error) {
    console.error('Failed to enrich notification for socket broadcast:', error);
    return null;
  }
};

const broadcastNotifications = async (notifications) => {
  const docs = Array.isArray(notifications) ? notifications : [notifications];

  await Promise.all(
    docs.map(async (doc) => {
      if (!doc) return;
      const enriched = await enrichNotification(doc);
      if (!enriched || !enriched.userId) return;
      emitToUser(enriched.userId, 'notification:new', enriched);
    })
  );
};

module.exports = {
  broadcastNotifications,
};

