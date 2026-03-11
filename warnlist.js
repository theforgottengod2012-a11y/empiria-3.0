const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const Warning = require("../../database/models/Warning");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnlist")
    .setDescription("View all warnings for a member")
    .addUserOption(option => option.setName("target").setDescription("The user to check").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("target");

    try {
      const warningData = await Warning.findOne({
        guildId: interaction.guild.id,
        userId: user.id
      });

      if (!warningData || warningData.warnings.length === 0) {
        return await interaction.reply({
          content: `✅ **${user.tag}** has no warnings.`,
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setTitle(`⚠️ Warnings for ${user.tag}`)
        .setColor("#FFA500")
        .setTimestamp();

      const warningList = warningData.warnings
        .map((w, i) => {
          const mod = interaction.guild.members.cache.get(w.moderatorId);
          const date = new Date(w.date).toLocaleDateString("en-US");
          return `**${i + 1}.** ${w.reason}\n*Mod: ${mod ? mod.user.tag : "Unknown"} | ${date}*`;
        })
        .join("\n\n");

      embed.setDescription(warningList || "No warnings found");
      embed.setFooter({ text: `Total: ${warningData.warnings.length}/7 warnings` });

      await interaction.reply({ embeds: [embed], ephemeral: false });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: "❌ Failed to fetch warnings.", ephemeral: true });
    }
  }
};
