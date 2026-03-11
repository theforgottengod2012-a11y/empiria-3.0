const AutoMod = require("../../database/models/AutoMod");

module.exports = {
  name: "automod",
  description: "Configure automod",

  async execute(message, args) {
    if (!message.member.permissions.has("Administrator"))
      return message.reply("❌ Admin only.");

    const option = args[0]?.toLowerCase();

    let data = await AutoMod.findOne({
      guildId: message.guild.id
    });

    if (!data) {
      data = new AutoMod({ guildId: message.guild.id });
    }

    if (!option) {
      const status = (bool) => bool ? "✅ Enabled" : "❌ Disabled";
      return message.channel.send({
        embeds: [{
          title: "🤖 AutoMod Configuration",
          description: `Master Switch: ${status(data.enabled)}\n\n` +
            `**Filters:**\n` +
            `Profanity: ${status(data.profanity)}\n` +
            `Spam: ${status(data.spam)}\n` +
            `Links: ${status(data.links)}\n` +
            `Invites: ${status(data.invites)}\n` +
            `Caps: ${status(data.caps)}\n` +
            `Emojis: ${status(data.emojis)}\n` +
            `Raid: ${status(data.raid)}\n\n` +
            `**Settings:**\n` +
            `Punishment: \`${data.punishment}\`\n` +
            `Logs: ${data.logs ? `<#${data.logs}>` : "Not set"}`,
          color: 0x3498db
        }]
      });
    }

    const filters = ["profanity", "spam", "links", "invites", "caps", "emojis", "raid", "scamlinks"];
    if (filters.includes(option) || (option === "capslock" && (option = "caps"))) {
      const action = args[1]?.toLowerCase();
      if (action === "on" || action === "enable") data[option] = true;
      else if (action === "off" || action === "disable") data[option] = false;
      else data[option] = !data[option];
      
      await data.save();
      return message.channel.send(`⚙️ **${option.charAt(0).toUpperCase() + option.slice(1)}** filter set to **${data[option] ? "ON" : "OFF"}**`);
    }

    if (option === "enable" || option === "disable") {
      data.enabled = option === "enable";
      await data.save();
      return message.channel.send(`🤖 AutoMod **${data.enabled ? "Enabled" : "Disabled"}**`);
    }

    if (option === "punishment") {
      const p = args[1]?.toLowerCase();
      if (!["warn", "mute", "timeout"].includes(p)) return message.reply("❌ Usage: `$automod punishment warn/mute/timeout`.");
      data.punishment = p;
      await data.save();
      return message.channel.send(`🛡️ AutoMod punishment set to **${p}**.`);
    }

    if (option === "logs") {
      const channel = message.mentions.channels.first();
      if (!channel) return message.reply("❌ Mention a channel for logs.");
      data.logs = channel.id;
      await data.save();
      return message.channel.send(`📊 AutoMod logs set to ${channel}.`);
    }

    return message.reply("❌ Invalid option. Try: `profanity, spam, links, invites, caps, emojis, raid, punishment, logs`.");
  }
};
