const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");

const SUPPORT_SERVER_ID = "1334881669949292595"; // The server user must be in
const SUPPORT_SERVER_LINK = "https://discord.gg/ecz"; // The link to join
const OWNER_ID = "1359147702088237076";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nuke")
    .setDescription("Delete and recreate the current channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    // Check if user is in the required server
    const supportGuild = interaction.client.guilds.cache.get(SUPPORT_SERVER_ID);
    const isMember = supportGuild?.members.cache.has(interaction.user.id);

    if (!isMember && interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: `❌ To use this command, you must be in our support server!`,
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel("Join Support Server")
              .setStyle(ButtonStyle.Link)
              .setURL(SUPPORT_SERVER_LINK)
          )
        ],
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("☢️ Channel Nuke")
      .setDescription("Are you sure you want to nuke this channel? This will delete the current channel and recreate it.")
      .setColor(0xed4245);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("confirm_nuke")
        .setLabel("Start Nuke")
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      flags: [64]
    });
  }
};
