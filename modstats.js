const Case = require("../../database/models/Case");

module.exports = {
  name: "modstats",
  description: "View moderator statistics",
  permissions: ["ModerateMembers"],

  async execute(message, args) {
    const cases = await Case.find({ guildId: message.guild.id });
    
    const stats = {
      BAN: 0,
      KICK: 0,
      WARN: 0,
      TIMEOUT: 0,
      SOFTBAN: 0
    };

    cases.forEach(c => {
      if (stats[c.action] !== undefined) stats[c.action]++;
    });

    message.channel.send({
      embeds: [{
        title: "📊 Server Moderation Stats",
        fields: [
          { name: "Total Cases", value: `${cases.length}`, inline: false },
          { name: "Bans", value: `${stats.BAN}`, inline: true },
          { name: "Kicks", value: `${stats.KICK}`, inline: true },
          { name: "Warns", value: `${stats.WARN}`, inline: true },
          { name: "Timeouts", value: `${stats.TIMEOUT}`, inline: true },
          { name: "Softbans", value: `${stats.SOFTBAN}`, inline: true }
        ],
        color: 0x2ecc71
      }]
    });
  }
};