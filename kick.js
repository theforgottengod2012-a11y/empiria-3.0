const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Case = require("../../database/models/Case");
const { getNextCaseId } = require("../../utils/caseUtils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the server")
    .addUserOption(option => 
      option.setName("target")
        .setDescription("The member to kick")
        .setRequired(true))
    .addStringOption(option => 
      option.setName("reason")
        .setDescription("The reason for the kick")
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("target");
    const reason = interaction.options.getString("reason") || "No reason";
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) return interaction.reply({ content: "❌ That user is not in this server.", ephemeral: true });

    if (!member.kickable) return interaction.reply({ content: "❌ I cannot kick this member. They might have a higher role than me or I lack permissions.", ephemeral: true });
    if (interaction.member.roles.highest.position <= member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
      return interaction.reply({ content: "❌ You cannot kick someone with an equal or higher role.", ephemeral: true });
    }

    try {
      await member.kick(reason);
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: "❌ Failed to kick the member.", ephemeral: true });
    }

    const caseId = await getNextCaseId(interaction.guild.id);
    await Case.create({
      guildId: interaction.guild.id,
      caseId,
      userId: user.id,
      moderatorId: interaction.user.id,
      action: "KICK",
      reason
    });

    await interaction.reply({ content: `👢 **${user.tag} kicked** (Case #${caseId})` });
  }
};
