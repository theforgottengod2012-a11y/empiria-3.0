const User = require("../../database/models/User");
const { collectTax } = require("../../utils/governmentTax");
const { logAction } = require("../../utils/modLogging");
const ms = require("ms");

module.exports = {
  name: "crime",
  description: "Commit a crime to earn money (risky!)",
  async execute(message, args) {
    const user = await User.findOne({ userId: message.author.id });
    if (!user) return message.reply("❌ You need to earn some money first!");

    const cooldown = 3600000; // 1 hour
    if (user.lastCrime && Date.now() - user.lastCrime < cooldown) {
      const remaining = ms(cooldown - (Date.now() - user.lastCrime));
      return message.reply(`⏳ You need to lay low for another **${remaining}**.`);
    }

    const success = Math.random() > 0.5;
    user.lastCrime = Date.now();

    if (success) {
      const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
      const reward = Math.floor(Math.random() * 2000) + 500;
      const { netAmount, taxAmount } = await collectTax(message.guild.id, message.author.id, reward, "capital");
      
      user.wallet += netAmount;
      await user.save();

      await logAction(message.guild.id, message.author.id, "CRIME", "Successfully committed a crime", message.author.id, { reward: netAmount, taxes: taxAmount });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("crime_again").setLabel("Another Crime").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("heal").setLabel("Get Healed").setStyle(ButtonStyle.Secondary)
      );

      return message.reply({ content: `💰 You successfully committed a crime and earned **$${netAmount}**! (Taxes: $${taxAmount})`, components: [row] });
    } else {
      const injuryRoll = Math.random();
      let injuryMsg = "";
      
      if (injuryRoll > 0.6) {
        user.health = Math.max(0, user.health - 20);
        user.injuries.push({
          type: "Gunshot Wound",
          severity: 5,
          timestamp: new Date()
        });
        injuryMsg = "\n🚑 You were shot during the getaway and sustained an injury!";
      }

      await user.save();
      return message.reply(`🚨 You got caught! You earned nothing and wasted your time.${injuryMsg}`);
    }
  }
};
