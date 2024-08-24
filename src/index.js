require("dotenv").config();
const {
  Client,
  IntentsBitField,
  RESTEvents,
  WebhookClient,
  EmbedBuilder,
} = require("discord.js");
const mongoose = require("mongoose");
const eventHandler = require("./handlers/eventHandler");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to database"));
const client = new Client({
  rest: {
    // rejectOnRateLimit: ["/channels"],
  },
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.rest.on(RESTEvents.RateLimited, async (r) => {
  console.log(r);

  if (r.method !== "DELETE") return;
  if (r.route !== "/channels/:id/messages/:id") return;
  console.log("RATE LIMIT DELETE");
  const webhook = new WebhookClient({ url: process.env.WEBHOOK_LOGS });

  const embed = new EmbedBuilder()
    .setColor("Red")
    .setTitle("Rate Limit Hit!")
    .setDescription(
      `Message will start to delete after ${(r.timeToReset / 1000).toFixed(
        0
      )} seconds.}`
    );

  await webhook.send({ embeds: [embed] });
});
eventHandler(client);

client.login(process.env.TOKEN);
