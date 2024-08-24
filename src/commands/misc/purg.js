const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType,
} = require("discord.js");
const { logChannelId } = require("../../../config.json");
const UserMessagesModel = require("../../../models/userMessage");
module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */

  callback: async (client, interaction) => {
    try {
      const targetUser = interaction.options.getUser("target-user");

      await interaction.deferReply();

      if (!targetUser) {
        await interaction.editReply(
          "Please provide a valid user to purge messages from."
        );
        return;
      }

      const { channel } = interaction;

      // Fetch the user’s document containing their messages
      const userMessages = await UserMessagesModel.findOne({
        userId: targetUser.id,
      });

      if (!userMessages || userMessages.messages.length === 0) {
        return interaction.editReply({
          content: `${targetUser.username} has no messages to purge.`,
        });
      }

      await interaction.editReply(
        `Purge command ran by ${interaction.user} to delete ${targetUser} messages`
      );

      let totalDeleted = 0;
      const m = await channel.send(
        `User ${targetUser}: ${totalDeleted} messages deleted`
      );

      for (const msgData of userMessages.messages) {
        const channel = client.channels.cache.get(msgData.channelId);

        if (channel) {
          const msg = await channel.messages
            .fetch(msgData.messageId)
            .catch((e) => null);
          await msg?.delete();
          totalDeleted++;
          await m.edit(`User ${targetUser}: ${totalDeleted} messages deleted`);
        }
      }

      await UserMessagesModel.updateOne(
        { userId: targetUser.id },
        { $set: { messages: [] } }
      );

      await m.edit(
        `Total messages deleted for ${targetUser}: \`${totalDeleted}\``
      );

      // // Create and send log embed
      // const logEmbed = new EmbedBuilder()
      //   .setColor("#FF5733")
      //   .setTitle("Message Purge Log")
      //   .setDescription(`A message purge has been executed.`)
      //   .addFields(
      //     {
      //       name: "Executor",
      //       value: `${interaction.user.tag} (${interaction.user.id})`,
      //       inline: true,
      //     },
      //     {
      //       name: "Target User",
      //       value: `${targetUser.tag} (${targetUser.id})`,
      //       inline: true,
      //     },
      //     {
      //       name: "Total Messages Deleted",
      //       value: totalDeleted.toString(),
      //       inline: true,
      //     },
      //     {
      //       name: "Command Execution Channel",
      //       value: `${interaction.channel.name} (${interaction.channel.id})`,
      //     },
      //     {
      //       name: "Channels Affected",
      //       value: channelsAffected.join("\n") || "None",
      //     }
      //   )
      //   .setTimestamp()
      //   .setFooter({ text: `Server: ${guild.name}`, iconURL: guild.iconURL() });

      // const logChannel = await guild.channels.fetch(logChannelId);

      // if (logChannel && logChannel.type === ChannelType.GuildText) {
      //   await logChannel.send({ embeds: [logEmbed] });
      // } else {
      //   console.log(
      //     "Log channel not found or is not a text channel. Unable to send log embed."
      //   );
      // }
    } catch (error) {
      console.log(error);
    }
  },

  name: "purge",
  description:
    "Purges all messages from a specific user across the entire server.",
  options: [
    {
      name: "target-user",
      description: "The user whose messages you want to purge.",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ManageMessages],
  botPermissions: [PermissionFlagsBits.ManageMessages],
};
