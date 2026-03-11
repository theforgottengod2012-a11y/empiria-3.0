const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Set the slowmode for a channel")
    .addIntegerOption(option => option.setName("seconds").setDescription("The slowmode delay in seconds (0 to disable)").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const seconds = interaction.options.getInteger("seconds");
    
    try {
      await interaction.channel.setRateLimitPerUser(seconds);
      await interaction.reply({ content: `✅ Slowmode set to **${seconds}** seconds.` });
    } catch (error) {
      await interaction.reply({ content: "❌ Failed to set slowmode.", ephemeral: true });
    }
  }
};
