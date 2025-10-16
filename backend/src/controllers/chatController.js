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