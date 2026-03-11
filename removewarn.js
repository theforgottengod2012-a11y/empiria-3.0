const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Warning = require("../../database/models/Warning");
const Case = require("../../database/models/Case");
const { getNextCaseId } = require("../../utils/caseUtils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removewarn")
    .setDescription("Remove a warning from a member")
    .addUserOption(option => option.setName("target").setDescription("The user").setRequired(true))
    .addIntegerOption(option => option.setName("warning_number").setDescription("Which warning to remove (1, 2, 3, etc)").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("target");
    const warningNumber = interaction.options.getInteger("warning_number");

    try {
      const warningData = await Warning.findOne({
        guildId: interaction.guild.id,
        userId: user.id
      });

      if (!warningData || warningData.warnings.length === 0) {
        return await interaction.reply({
          content: `❌ **${user.tag}** has no warnings to remove.`,
          ephemeral: true
        });
      }

      if (warningNumber < 1 || warningNumber > warningData.warnings.length) {
        return await interaction.reply({
          content: `❌ Warning #${warningNumber} does not exist. User has ${warningData.warnings.length} warnings.`,
          ephemeral: true
        });
      }

      const removedWarning = warningData.warnings.splice(warningNumber - 1, 1)[0];
      await warningData.save();

      const caseId = await getNextCaseId(interaction.guild.id);
      await Case.create({
        guildId: interaction.guild.id,
        caseId,
        userId: user.id,
        moderatorId: interaction.user.id,
        action: "WARN_REMOVED",
        reason: removedWarning.reason
      });

      await interaction.reply({
        content: `✅ Removed warning #${warningNumber} from **${user.tag}**\n**Reason was:** ${removedWarning.reason}\n**Remaining warnings:** ${warningData.warnings.length}/7 (Case #${caseId})`,
        ephemeral: false
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: "❌ Failed to remove warning.", ephemeral: true });
    }
  }
};
