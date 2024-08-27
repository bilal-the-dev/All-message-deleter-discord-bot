const { ActivityType } = require("discord.js");

module.exports = async (client) => {
  console.log(`${client.user.tag} is online.`);
  client.user.setActivity({
    name: "Sometimes, Kismet happens...me! 🙂",
    type: ActivityType.Custom,
  });
};
