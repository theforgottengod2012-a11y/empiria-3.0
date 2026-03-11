module.exports = {
  name: "pause",
  async execute(message, args, client) {
    const serverQueue = client.queue?.get(message.guild.id);
    if (!serverQueue) return message.reply("There is no song playing.");
    if (serverQueue.player.state.status === 'paused') return message.reply("The music is already paused.");
    
    serverQueue.player.pause();
    message.channel.send("⏸️ Paused the music.");
  }
};
