const { EmbedBuilder } = require("discord.js");
const Government = require("../../database/models/Government");

module.exports = {
  name: "treasury",
  description: "View the government treasury",
  category: "government",
  ownerOnly: false,
  async execute(message, args) {
    const guildId = message.guild.id;

    let government = await Government.findOne({ guildId });
    if (!government) {
      return message.reply("❌ No government system found in this server.");
    }

    if (!government.government.enabled) {
      return message.reply("❌ Government system is not enabled.");
    }

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#1f8b4c")
          .setTitle("🏛️ Government Treasury")
          .addFields(
            { name: "💵 Current Balance", value: `$${government.taxes.treasury.toLocaleString()}`, inline: false },
            { name: "📊 Total Revenue", value: `$${government.budget.totalRevenue.toLocaleString()}`, inline: true },
            { name: "📉 Total Expenses", value: `$${government.budget.totalExpenses.toLocaleString()}`, inline: true },
            {
              name: "📈 Net Income",
              value: `$${(government.budget.totalRevenue - government.budget.totalExpenses).toLocaleString()}`,
              inline: false
            }
          )
      ]
    });
  }
};
