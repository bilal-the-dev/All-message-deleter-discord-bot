const UserMessagesModel = require("../../../models/userMessage");

module.exports = async (client, message) => {
  try {
    if (message.guild?.id !== process.env.GUILD_ID) return;
    await UserMessagesModel.updateOne(
      { userId: message.author.id },
      {
        $push: {
          messages: { channelId: message.channel.id, messageId: message.id },
        },
      },
      { upsert: true }
    );
  } catch (err) {
    console.log(err);
  }
};
