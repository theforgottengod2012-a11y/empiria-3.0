const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "autorole",
  description: "Set a role to be automatically given to new members",
  module: "moderation",
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply("❌ Only administrators can set autoroles.");
    }

    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
    if (!role) return message.reply("❌ Usage: `$autorole <@role|ID>` (or `$autorole off` to disable)");

    const AutoMod = require("../../database/models/AutoMod");
    let config = await AutoMod.findOne({ guildId: message.guild.id });
    
    if (!config) config = new AutoMod({ guildId: message.guild.id });

    if (args[0]?.toLowerCase() === "off") {
      config.autoRole = null;
      await config.save();
      return message.reply("✅ Auto-role has been disabled.");
    }

    config.autoRole = role.id;
    await config.save();
    message.reply(`✅ Auto-role set to: **${role.name}**`);
  }
};
