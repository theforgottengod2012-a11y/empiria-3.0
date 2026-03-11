const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

const SUPPORT_SERVER_ID = "1334881669949292595";
const SUPPORT_SERVER_LINK = "https://discord.gg/ecz";
const OWNER_ID = "1359147702088237076";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("spam")
    .setDescription("Advanced spam command (Staff Only)")
    .addIntegerOption(opt => opt.setName("count").setDescription("Number of messages").setRequired(true))
    .addIntegerOption(opt => opt.setName("delay").setDescription("Delay in ms").setRequired(true))
    .addStringOption(opt => opt.setName("message").setDescription("Message to spam").setRequired(true))
    .addChannelOption(opt => opt.setName("channel").setDescription("Target channel"))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async slashExecute(interaction) {
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

    const count = interaction.options.getInteger("count");
    const delay = interaction.options.getInteger("delay");
    const msg = interaction.options.getString("message");
    const targetChannel = interaction.options.getChannel("channel") || interaction.channel;

    if (count > 100) return interaction.reply({ content: "Max 100 messages.", flags: [64] });

    const embed = new EmbedBuilder()
      .setTitle("🚀 Spam Initialized")
      .setDescription(`Ready to spam **${count}** messages in <#${targetChannel.id}>.`)
      .setColor(0x5865f2);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`confirm_spam`)
        .setLabel("Start Spam")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      flags: [64]
    });
    
    const filter = i => i.user.id === interaction.user.id;
    // Use interaction.channel if available, otherwise fetch it or use the interaction itself
    const collectorChannel = interaction.channel || await interaction.client.channels.fetch(interaction.channelId);
    if (!collectorChannel) return;

    const collector = collectorChannel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
      if (i.customId === 'confirm_spam') {
        await i.update({ content: "Spam started! ✅", embeds: [], components: [] });
        
        for (let j = 0; j < count; j++) {
           try {
             await targetChannel.send(msg);
           } catch (e) {}
           await new Promise(r => setTimeout(r, delay));
        }
        collector.stop();
      }
    });
  }
};
