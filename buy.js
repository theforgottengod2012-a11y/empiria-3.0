const items = require("../../data/shopItems");
const { getUser, addItem } = require("../../utils/economy");
const Clan = require("../../database/models/Clan");

module.exports = {
  name: "buy",
  description: "Buy an item from the shop",
  module: "economy",

  async execute(message, args, client) {
    const itemKey = args[0]?.toLowerCase();
    if (!itemKey) return message.reply("❌ Usage: `$buy <item_id>`");

    const item = items.find(i => i.id === itemKey);
    if (!item) return message.reply("❌ Item not found.");

    const user = await getUser(message.author.id);

    // Check if Prestige level requirement is met
    if (item.type === "prestige" && user.prestige.level < item.requiredPrestigeLevel) {
      return message.channel.send(`❌ You need Prestige level ${item.requiredPrestigeLevel} to buy this.`);
    }

    // Special item requirements
    if (item.id === "clan_role") {
      if (!user.clanId) return message.reply("❌ You must be in a clan to buy this.");
      const clan = await Clan.findOne({ clanId: user.clanId });
      if (!clan || clan.ownerId !== message.author.id) return message.reply("❌ Only the clan owner can buy this.");
      if (clan.bank < 50000000) return message.reply("❌ Your clan bank needs at least 50M to buy this.");
      
      if (user.wallet < item.price) return message.reply("❌ You can't afford this.");
      
      // Create role
      try {
        const role = await message.guild.roles.create({
          name: `${clan.name} Member`,
          reason: `Clan role purchase by ${message.author.tag}`
        });
        clan.roleId = role.id;
        await clan.save();
        
        // Apply to all members
        for (const memberId of clan.members) {
          const member = await message.guild.members.fetch(memberId).catch(() => null);
          if (member) await member.roles.add(role).catch(() => {});
        }
        
        user.wallet -= item.price;
        user.inventory.push({
            item: item.id,
            expiry: new Date(Date.now() + item.duration),
            roleId: role.id
        });
        await user.save();
        return message.reply(`✅ Bought **${item.name}** for **💵 ${item.price}**. Role created and applied to all members! Expire in 60 days.`);
      } catch (e) {
        return message.reply("❌ Failed to create role. Check my permissions.");
      }
    }

    if (item.id === "custom_role") {
      if (user.wallet < item.price) return message.reply("❌ You can't afford this.");
      
      try {
        const role = await message.guild.roles.create({
          name: `${message.author.username}'s Role`,
          reason: `Custom role purchase by ${message.author.tag}`
        });
        
        user.wallet -= item.price;
        user.inventory.push({
            item: item.id,
            expiry: new Date(Date.now() + item.duration),
            roleId: role.id
        });
        
        await message.member.roles.add(role);
        await user.save();
        return message.reply(`✅ Bought **${item.name}** for **💵 ${item.price}**. You can manage it with \`$customrename\`, \`$customhex\`, \`$customicon\`. Expire in 60 days.`);
      } catch (e) {
        return message.reply("❌ Failed to create role. Check my permissions.");
      }
    }

    if (item.id === "ping_reaction") {
        if (user.wallet < item.price) return message.reply("❌ You can't afford this.");
        user.wallet -= item.price;
        user.inventory.push({
            item: item.id,
            expiry: new Date(Date.now() + item.duration)
        });
        await user.save();
        
        message.reply("✨ **Ping Reaction Role** bought! Please provide the 3 emojis you want me to use (e.g., `🍎 🍌 🍒`):");
        
        const filter = m => m.author.id === message.author.id;
        const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] }).catch(() => null);
        
        if (collected) {
            const emojis = collected.first().content.split(/ +/).slice(0, 3);
            if (emojis.length > 0) {
                user.pingEmojis = emojis;
                await user.save();
                return message.reply(`✅ Successfully set your ping emojis to: ${emojis.join(" ")}`);
            }
        }
        
        return message.reply(`✅ Bought **${item.name}**. You can set your emojis later with \`$use ping_reaction <emoji1> <emoji2> <emoji3>\`.`);
    }

    if (user.wallet < item.price) return message.reply("❌ You can't afford this.");

    user.wallet -= item.price;

    // Add perk or regular item
    if (item.type === "prestige") {
      if (!user.prestige.perks.includes(item.perk)) user.prestige.perks.push(item.perk);
    } else {
      await addItem(message.author.id, itemKey);
    }

    await user.save();
    message.reply(`✅ Bought **${item.name}** for **💵 ${item.price}**`);
  }
};
