const { EmbedBuilder } = require("discord.js");
const config = require("../../config");

module.exports = {
  name: "clear",
  aliases: ["purge"],
  permissions: ["ManageMessages"],
  async execute(message, args) {
    if (!args[0]) return message.reply("❌ Specify what to clear.");

    const messages = await message.channel.messages.fetch({ limit: 100 });
    let toDelete = [];

    if (!isNaN(args[0])) {
      const amount = Math.min(parseInt(args[0]), 100);
      toDelete = Array.from(messages.values()).slice(0, amount);
    }

    else if (args[0] === "bots") {
      toDelete = messages.filter(m => m.author.bot);
    }

    else if (args[0] === "links") {
      toDelete = messages.filter(m => m.content.includes("http"));
    }

    else if (args[0] === "images") {
      toDelete = messages.filter(m => m.attachments.size > 0);
    }

    else if (args[0] === "contains") {
      const word = args.slice(1).join(" ");
      if (!word) return message.reply("❌ Provide text.");
      toDelete = messages.filter(m => m.content.includes(word));
    }

    else if (message.mentions.users.first()) {
      const user = message.mentions.users.first();
      const amount = parseInt(args[1]) || 10;
      toDelete = messages.filter(m => m.author.id === user.id).first ? messages.filter(m => m.author.id === user.id).first(amount) : messages.filter(m => m.author.id === user.id).toJSON().slice(0, amount);
    }

    const finalToDelete = Array.isArray(toDelete) ? toDelete : (toDelete.toJSON ? toDelete.toJSON() : Array.from(toDelete.values()));
    if (finalToDelete.length === 0) return message.reply("❌ Nothing to delete.");

    await message.channel.bulkDelete(finalToDelete, true);

    message.channel.send(`🧹 Deleted ${finalToDelete.length} messages.`)
      .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));

    // Mod log
    const logChannel = message.guild.channels.cache.find(
      c => c.name === config.modLogChannel
    );

    if (logChannel) {
      const embed = new EmbedBuilder()
        .setTitle("🧹 Messages Cleared")
        .addFields(
          { name: "Moderator", value: message.author.tag },
          { name: "Channel", value: message.channel.toString() },
          { name: "Amount", value: `${deleteCount}` }
        )
        .setColor("Blue")
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    }
  }
};
