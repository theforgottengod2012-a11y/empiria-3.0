const { addMoney, checkCooldown, getUser, applyPrestigeCoins } = require("../../utils/economy");
const { collectTax, applyGovBenefit, registerCitizen } = require("../../utils/governmentTax");
const globalEvent = require("../../utils/globalEvent");

const DAILY_REWARD = 1000;
const DAILY_COOLDOWN = 24 * 60 * 60 * 1000;

module.exports = {
  name: "daily",
  description: "Claim your daily reward",
  module: "economy",

  async execute(message, args, client) {
    const userId = message.author.id;
    const guildId = message.guild.id;
    const timeLeft = await checkCooldown(userId, "daily", DAILY_COOLDOWN);

    if (timeLeft > 0) {
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

      return message.reply(
        `⏳ You already claimed your daily.\nCome back in **${hours}h ${minutes}m**`,
      );
    }

    let reward = DAILY_REWARD;
    if (globalEvent.isActive("double_money")) {
      reward *= 2;
    }

    const userObj = await getUser(userId);
    reward = applyPrestigeCoins(userObj, reward);

    await registerCitizen(guildId, userId);
    const { taxAmount, netAmount, taxRate } = await collectTax(guildId, userId, reward, "income");
    const { benefit, benefitType } = await applyGovBenefit(guildId, userId, netAmount);

    const finalReward = netAmount + benefit;
    await addMoney(userId, finalReward);
    const user = await getUser(userId);

    let description = `**Base Reward:** $${reward}\n`;
    if (taxAmount > 0) {
      description += `**Income Tax:** -$${taxAmount} (${taxRate}%)\n`;
    }
    if (benefit > 0) {
      description += `**${benefitType === "welfare" ? "💳 Welfare Bonus" : "🎓 Education Bonus"}:** +$${benefit}\n`;
    }
    description += `**Net Reward:** $${finalReward}`;

    message.reply({
      embeds: [
        {
          title: "🎁 Daily Reward Claimed!",
          description,
          color: 0x57f287,
          fields: [
            {
              name: "New Wallet Balance",
              value: `💰 ${user.wallet.toLocaleString()}`,
              inline: true,
            },
          ],
          footer: {
            text: "Come back tomorrow for more!",
          },
        },
      ],
    });
  },
};