const Notification = require('../models/NotificationModel');
const SwapRequest = require('../models/SwapRequestModel');

getMyNotifications = async (req, res) => {
  try {
    // Fetch latest notifications and populate sender info
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('senderId', 'name avatar');

    // Map senderId into a "sender" field and enrich with swap request meta
    const shaped = await Promise.all(
      notifications.map(async (n) => {
        const json = n.toObject();
        let swapMeta = null;
        try {
          if (json.relatedModel === 'SwapRequest' && json.relatedId) {
            const sr = await SwapRequest.findById(json.relatedId).populate('postId');
            if (sr) {
              const youAreRequester = sr.requesterId?.toString() === req.user._id.toString();
              const youAreOwner = sr.postId?.userId?.toString() === req.user._id.toString();
              swapMeta = {
                status: sr.status,
                requesterPaid: !!sr.requesterPaid,
                ownerPaid: !!sr.ownerPaid,
                youAreRequester,
                youAreOwner,
              };
            }
          }
        } catch (e) {
          // swallow enrichment errors; do not block notifications
        }

        return {
          ...json,
          sender: json.senderId || null,
          swapMeta,
        };
      })
    );

    res.json(shaped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Marked as read.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: 'All notifications marked as read.', modified: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
}