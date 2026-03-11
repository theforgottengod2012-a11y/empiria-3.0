const { SlashCommandBuilder } = require("discord.js");
const play = require("./play");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song from YouTube or Spotify")
    .addStringOption(option => 
      option.setName("query")
        .setDescription("The song name or link")
        .setRequired(true)),

  async execute(interaction, client) {
    const query = interaction.options.getString("query");
    const vc = interaction.member.voice.channel;
    
    if (!vc) {
      return interaction.reply({ content: "Join a voice channel first!", ephemeral: true });
    }

    await interaction.deferReply();
    
    // Mock message for the execute function
    const message = {
        guild: interaction.guild,
        member: interaction.member,
        channel: interaction.channel,
        reply: (content) => interaction.editReply(content),
        content: `$play ${query}`
    };

    // We need to adapt the execute function to handle interaction or just call it with a shim
    try {
        await play.execute(message, [query], client);
    } catch (error) {
        console.error(error);
        if (interaction.deferred) {
            await interaction.editReply("There was an error playing this song.");
        }
    }
  }
};
