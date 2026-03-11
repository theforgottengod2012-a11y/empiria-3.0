const User = require("../database/models/User");
const raidConfig = require("../data/raidConfig");

async function getUser(userId, isBot = false) {
  let user = await User.findOne({ userId });
  if (!user) {
    user = await User.create({ userId, isBot });
  }
  if (user.level === undefined) user.level = 1;
  if (user.reputation === undefined) user.reputation = 0;
  if (!user.inventory) user.inventory = [];
  if (!user.shiftsUsed) user.shiftsUsed = 0;
  if (!user.lastShiftReset) user.lastShiftReset = Date.now();
  if (Date.now() - user.lastShiftReset > 86400000) {
    user.shiftsUsed = 0;
    user.lastShiftReset = Date.now();
  }
  return user;
}

async function addMoney(userId, amount) {
  if (amount <= 0) return false;
  return await User.findOneAndUpdate(
    { userId },
    { $inc: { wallet: amount } },
    { new: true, upsert: true },
  );
}

async function removeMoney(userId, amount) {
  const user = await getUser(userId);
  if (user.wallet < amount) return false;
  user.wallet -= amount;
  await user.save();
  return true;
}

async function canAfford(userId, amount) {
  const user = await getUser(userId);
  return user.wallet >= amount;
}

async function checkCooldown(userId, type, cooldownMs) {
  const user = await getUser(userId);
  const now = Date.now();
  if (user.cooldowns[type] && user.cooldowns[type] > now) {
    return user.cooldowns[type] - now;
  }
  await User.findOneAndUpdate(
    { userId },
    { [`cooldowns.${type}`]: now + cooldownMs },
  );
  return 0;
}

async function addItem(userId, itemKey) {
  const user = await getUser(userId);
  user.inventory.push({
    item: itemKey,
    used: false,
    boughtAt: Date.now()
  });
  await user.save();
}

function applyPrestigeCoins(user, baseAmount) {
  let multiplier = user.prestige?.bonusMultiplier || 1;
  if (user.prestige?.perks?.includes("coinBoost")) multiplier += 0.2;
  const raidMultiplier = (raidConfig && raidConfig.isActive) ? 1.5 : 1;
  return Math.floor(baseAmount * multiplier * raidMultiplier);
}

function applyPrestigeXp(user, baseXp) {
  let multiplier = user.prestige?.bonusMultiplier || 1;
  if (user.prestige?.perks?.includes("xpBoost")) multiplier += 0.2;
  const raidMultiplier = (raidConfig && raidConfig.isActive) ? 1.5 : 1;
  return Math.floor(baseXp * multiplier * raidMultiplier);
}

function getWorkCooldown(user, baseCooldown) {
  if (user.prestige?.perks?.includes("fastWork")) return baseCooldown / 2;
  return baseCooldown;
}

function canBeRobbed(user) {
  if (user.prestige?.perks?.includes("robImmunity")) return false;
  return true;
}

module.exports = {
  getUser,
  addMoney,
  removeMoney,
  canAfford,
  checkCooldown,
  addItem,
  applyPrestigeCoins,
  applyPrestigeXp,
  getWorkCooldown,
  canBeRobbed,
};