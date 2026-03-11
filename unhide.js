const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unhide")
    .setDescription("Unhide the current channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    try {
      await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { ViewChannel: null });
      await interaction.reply({ content: `👁️ Channel is now visible.` });
    } catch (error) {
      await interaction.reply({ content: "❌ Failed to unhide the channel.", ephemeral: true });
    }
  }
};
