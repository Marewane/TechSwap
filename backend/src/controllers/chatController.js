const ChatRoom = require('../models/ChatRoomModel');
const Message = require('../models/MessageModel');

exports.getUserChatRooms = async (req, res) => {
  try {
    const rooms = await ChatRoom.find({ participants: req.user._id });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ chatRoomId: roomId }).populate('senderId', 'username');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content } = req.body;
    const message = await Message.create({
      chatRoomId: roomId,
      senderId: req.user._id,
      content
    });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//  Check if user has paid for a chat room
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { chatRoomId } = req.query;
    const userId = req.user._id;

    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ success: false, message: 'Chat room not found' });
    }

    const isHost = userId.equals(chatRoom.hostId);
    const hasPaid = isHost ? chatRoom.hostPaid : chatRoom.learnerPaid;

    res.json({
      success: true,
      hasPaid,
      chatRoom: {
        _id: chatRoom._id,
        hostPaid: chatRoom.hostPaid,
        learnerPaid: chatRoom.learnerPaid,
        scheduledTime: chatRoom.scheduledTime,
        duration: chatRoom.duration,
        sessionId: chatRoom.sessionId
      }
    });
  } catch (error) {
    console.error('Check payment status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};