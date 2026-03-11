module.exports = {
  name: "queue",
  aliases: ["q"],
  async execute(message, args, client) {
    const serverQueue = client.queue?.get(message.guild.id);
    if (!serverQueue || !serverQueue.songs.length) return message.reply("The queue is empty.");
    
    const queueList = serverQueue.songs.map((song, index) => `${index + 1}. **${song.title}**`).join("\n");
    message.channel.send(`📋 **Current Queue:**\n${queueList}`);
  }
};
