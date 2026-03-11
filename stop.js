module.exports = {
  name: "stop",
  async execute(message, args, client) {
    const serverQueue = client.queue?.get(message.guild.id);
    if (!serverQueue) return message.reply("There is no music playing.");
    
    serverQueue.songs = [];
    serverQueue.player.stop();
    serverQueue.connection.destroy();
    client.queue.delete(message.guild.id);
    message.channel.send("⏹️ Stopped the music and cleared the queue.");
  }
};
