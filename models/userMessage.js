const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  channelId: { type: String, required: true },
  messageId: { type: String, required: true },
});

const userMessagesSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  messages: [messageSchema],
});

const UserMessagesModel = mongoose.model("UserMessages", userMessagesSchema);
module.exports = UserMessagesModel;
