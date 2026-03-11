const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hide")
    .setDescription("Hide the current channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    try {
      await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { ViewChannel: false });
      await interaction.reply({ content: `👻 Channel is now hidden.` });
    } catch (error) {
      await interaction.reply({ content: "❌ Failed to hide the channel.", ephemeral: true });
    }
  }
};
