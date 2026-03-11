const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Warning = require("../../database/models/Warning");
const Case = require("../../database/models/Case");
const { getNextCaseId } = require("../../utils/caseUtils");
const { logAction } = require("../../utils/modLogging");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a member")
    .addUserOption(option => option.setName("target").setDescription("The user to warn").setRequired(true))
    .addStringOption(option => option.setName("reason").setDescription("Reason for the warning"))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("target");
    const reason = interaction.options.getString("reason") || "No reason provided";
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    
    try {
      // Check if user is already warned
      let warningData = await Warning.findOne({
        guildId: interaction.guild.id,
        userId: user.id
      });

      if (!warningData) {
        warningData = new Warning({
          guildId: interaction.guild.id,
          userId: user.id,
          warnings: []
        });
      }

      warningData.warnings.push({
        moderatorId: interaction.user.id,
        reason
      });

      await warningData.save();

      const warningCount = warningData.warnings.length;

      const caseId = await getNextCaseId(interaction.guild.id);
      await Case.create({
        guildId: interaction.guild.id,
        caseId,
        userId: user.id,
        moderatorId: interaction.user.id,
        action: "WARN",
        reason
      });

      await logAction(interaction.guild.id, interaction.user.id, "WARN", reason, user.id, { caseId, warningCount });
      let escalationMessage = "";
      let autoAction = null;

      // Auto escalation system
      if (warningCount === 3) {
        escalationMessage = "\n⚠️ **3 warnings reached** — timeout recommended";
      } else if (warningCount === 5) {
        escalationMessage = "\n🚨 **5 warnings reached** — kick recommended";
      } else if (warningCount >= 7) {
        escalationMessage = "\n⛔ **7 warnings reached** — ban recommended";
      }

      // Try to DM the user
      try {
        await user.send(`⚠️ You have been warned in **${interaction.guild.name}**\n**Reason:** ${reason}\n**Total warnings:** ${warningCount}/7`).catch(() => {});
      } catch {}

      await interaction.reply({
        content: `⚠️ **${user.tag}** warned (Case #${caseId})\n**Reason:** ${reason}\n**Warnings:** ${warningCount}/7${escalationMessage}`,
        ephemeral: false
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: "❌ Failed to warn the user.", ephemeral: true });
    }
  }
};
