const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nick")
    .setDescription("Change a user's nickname")
    .addUserOption(option => option.setName("target").setDescription("The user to change nickname").setRequired(true))
    .addStringOption(option => option.setName("nickname").setDescription("The new nickname (leave empty to reset)"))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),

  async execute(interaction) {
    const user = interaction.options.getUser("target");
    const nickname = interaction.options.getString("nickname");
    const member = await interaction.guild.members.fetch(user.id);

    if (!member.manageable) {
      return interaction.reply({ content: "❌ I cannot change this user's nickname.", ephemeral: true });
    }

    try {
      await member.setNickname(nickname);
      await interaction.reply({ content: `✅ Successfully changed nickname for **${user.tag}**.` });
    } catch (error) {
      await interaction.reply({ content: "❌ Failed to change nickname.", ephemeral: true });
    }
  }
};
