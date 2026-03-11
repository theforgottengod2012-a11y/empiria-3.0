module.exports = {
  name: "resume",
  async execute(message, args, client) {
    const serverQueue = client.queue?.get(message.guild.id);
    if (!serverQueue) return message.reply("There is no song playing.");
    if (serverQueue.player.state.status !== 'paused') return message.reply("The music is not paused.");
    
    serverQueue.player.unpause();
    message.channel.send("▶️ Resumed the music.");
  }
};
