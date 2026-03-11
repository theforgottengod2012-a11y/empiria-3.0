const Clan = require("../../database/models/Clan");
const User = require("../../database/models/User");

module.exports = {
  name: "clan-deposit",
  aliases: ["clan deposit"],
  async execute(message, args, client) {
    const amount = parseInt(args[0]);
    if (!amount || amount <= 0) return message.reply("❌ Invalid amount.");

    const user = await User.findOne({ userId: message.author.id });
    const clan = await Clan.findOne({ members: message.author.id });

    if (!user) return;
    if (!clan) return message.reply("❌ You are not in a clan.");
    
    const balance = (user.wallet || 0) + (user.bank || 0);
    if (balance < amount) return message.reply("❌ Insufficient funds.");

    if (user.wallet >= amount) {
      user.wallet -= amount;
    } else {
      const remaining = amount - user.wallet;
      user.wallet = 0;
      user.bank -= remaining;
    }
    
    clan.bank += amount;

    await user.save();
    await clan.save();

    message.reply(
      `🏦 Deposited **$${amount.toLocaleString()}** to clan bank`
    );
  }
};