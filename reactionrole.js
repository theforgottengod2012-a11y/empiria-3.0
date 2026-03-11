const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const ReactionRole = require("../../database/models/ReactionRole");

module.exports = {
  name: "reactionrole",
  aliases: ["rrole"],
  description: "Setup reaction roles",
  permissions: ["Administrator"],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (sub === "setup") {
      // Usage: $reactionrole setup
      const embed = new EmbedBuilder()
        .setTitle("🎭 Reaction Role Panel")
        .setDescription("Select a role from the menu below!")
        .setColor("#5865F2");

      // Create a dummy message to set up
      const msg = await message.reply({ embeds: [embed] });

      // Save to database (empty for now - admin will add roles)
      await ReactionRole.create({
        guildId: message.guild.id,
        messageId: msg.id,
        channelId: message.channel.id,
        roles: []
      });

      message.reply(`✅ Reaction role panel created! Message ID: \`${msg.id}\``);
    }

    if (sub === "add") {
      const messageId = args[1];
      const roleId = message.mentions.roles.first()?.id;
      const emoji = args[3];

      if (!messageId || !roleId || !emoji) {
        return message.reply("❌ Usage: `$reactionrole add <messageId> <@role> <emoji>`");
      }

      const rrole = await ReactionRole.findOne({ messageId });
      if (!rrole) return message.reply("❌ Message not set up for reaction roles.");

      rrole.roles.push({ emoji, roleId, label: message.mentions.roles.first().name });
      await rrole.save();

      const msg = await message.channel.messages.fetch(messageId).catch(() => null);
      if (msg) await msg.react(emoji).catch(() => {});

      message.reply(`✅ Added role to reaction panel!`);
    }

    if (sub === "remove") {
      const messageId = args[1];
      const emoji = args[2];

      const rrole = await ReactionRole.findOne({ messageId });
      if (!rrole) return message.reply("❌ Message not found.");

      rrole.roles = rrole.roles.filter(r => r.emoji !== emoji);
      await rrole.save();

      message.reply(`✅ Removed role from panel!`);
    }
  }
};
