const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("untimeout")
    .setDescription("Remove timeout from a member")
    .addUserOption(option => option.setName("target").setDescription("The user to untimeout").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("target");
    const member = await interaction.guild.members.fetch(user.id);

    if (!member.moderatable) {
      return interaction.reply({ content: "❌ I cannot untimeout this user.", ephemeral: true });
    }

    try {
      await member.timeout(null);
      await interaction.reply({ content: `✅ Timeout removed from **${user.tag}**.` });
    } catch (error) {
      await interaction.reply({ content: "❌ Failed to remove timeout.", ephemeral: true });
    }
  }
};
