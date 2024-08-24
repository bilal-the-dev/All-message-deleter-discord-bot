const { PermissionFlagsBits } = require("discord.js");

const { LOGS_CHANNEL_ID } = process.env;

module.exports = async (client, message) => {
  if (message.guild?.id !== process.env.GUILD_ID) return;

  if (message.content.startsWith("!dm")) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator))
      return;
    const mentionedUser = message.mentions.users.first();
    if (!mentionedUser) {
      return message.reply("Please mention a user to send the message to.");
    }

    const messageContent = message.content.slice(
      message.content.indexOf(" ", 4) + 1
    );

    if (!messageContent.trim()) {
      return message.reply("Please include a message to send.");
    }

    try {
      const embed = {
        author: {
          name: "Eternateam",
          icon_url:
            "https://media.discordapp.net/attachments/1268637160102297761/1272066556075184159/Eternaments_Logo.png?ex=66b99fcc&is=66b84e4c&hm=fbbaa4acc9c26c066423916a51b0182f6f82c824584f0aaadd34148550c1dada&=&format=webp&quality=lossless&width=621&height=621",
        },
        title: "📬 A Message from Eternaments!",
        thumbnail: {
          url: "https://media.discordapp.net/attachments/1268637160102297761/1270232445555441725/Beige_and_White_Be_Yourself_Square_Pillow_1_1.gif?ex=66b596a6&is=66b44526&hm=56d1a968848f3a862033f4acfc56497ab9a94fd09786f8df8079b7175d11e765&=",
        },
        description: messageContent,
        fields: [
          {
            name: "Sent From",
            value: message.guild.name,
            inline: true,
          },
          {
            name: "Server ID",
            value: message.guild.id,
            inline: true,
          },
          {
            name: "Sent At",
            value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
            inline: false,
          },
        ],
        footer: {
          text: "Please note that this bot will not receive your replies; for assistance, kindly create a ticket in the #create_a_ticket channel.",
          icon_url: message.author.avatarURL(),
        },
      };

      await mentionedUser.send({ embeds: [embed] });
      if (message.attachments.size > 0) {
        await mentionedUser.send({
          files: Array.from(message.attachments.values()),
        });
      }

      message.reply(`Message sent to ${mentionedUser.username}.`);

      const logChannel = client.channels.cache.get(LOGS_CHANNEL_ID);
      if (logChannel) {
        const logEmbed = {
          color: 0x00ff00,
          title: "DM Command Used",
          author: {
            name: message.author.tag,
            icon_url: message.author.displayAvatarURL({ dynamic: true }),
          },
          thumbnail: {
            url: message.guild.iconURL({ dynamic: true }),
          },
          fields: [
            {
              name: "Command User",
              value: `<@${message.author.id}>`,
              inline: true,
            },
            {
              name: "Recipient",
              value: `<@${mentionedUser.id}>`,
              inline: true,
            },
            {
              name: "Server",
              value: message.guild.name,
              inline: true,
            },
            {
              name: "Channel",
              value: `<#${message.channel.id}>`,
              inline: true,
            },
            {
              name: "Message Content",
              value:
                messageContent.length > 1024
                  ? messageContent.slice(0, 1021) + "..."
                  : messageContent,
            },
          ],
          timestamp: new Date(),
          footer: {
            text: `User ID: ${message.author.id}`,
          },
        };

        await logChannel.send({ embeds: [logEmbed] });
        if (message.attachments.size > 0) {
          await logChannel.send({
            files: Array.from(message.attachments.values()),
          });
        }
      }
    } catch (error) {
      console.error("Error sending DM:", error);
      message.reply("Failed to send the message. Please try again later.");
    }
  }
};
