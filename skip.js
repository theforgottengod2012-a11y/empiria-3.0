module.exports = {
  name: "skip",
  async execute(message, args, client) {
    const serverQueue = client.queue?.get(message.guild.id);
    if (!serverQueue) return message.reply("There is no song to skip.");
    
    serverQueue.player.stop();
    message.channel.send("⏭️ Skipped the song.");
  }
};
