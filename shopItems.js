module.exports = [
  // 🛡️ Anti-Rob Defense Items
  {
    id: "lock",
    name: "Steel Lock 🔐",
    price: 15000,
    type: "defense",
    durability: 10,
    effect: {
      robChanceReduction: 0.25
    },
    description: "Reduces rob success chance by 25%"
  },
  {
    id: "guard_dog",
    name: "Guard Dog 🐕",
    price: 45000,
    type: "defense",
    durability: 15,
    effect: {
      robChanceReduction: 0.4
    },
    description: "Reduces rob success chance by 40%"
  },
  {
    id: "alarm",
    name: "Security Alarm 🚨",
    price: 30000,
    type: "defense",
    durability: 8,
    effect: {
      robCooldownIncrease: true
    },
    description: "Increases robber cooldown if triggered"
  },
  {
    id: "insurance",
    name: "Insurance Policy 📜",
    price: 60000,
    type: "defense",
    durability: 5,
    effect: {
      refundLoss: 0.5
    },
    description: "Refunds 50% of stolen money"
  },
  {
    id: "vault",
    name: "Vault Upgrade 🏦",
    price: 100000,
    type: "defense",
    durability: 20,
    effect: {
      maxLossPercent: 0.1
    },
    description: "Caps rob loss to 10% of wallet"
  },
  // Prestige Items
  {
    id: "prestige_coin_boost",
    name: "Coin Booster",
    price: 100000, // 100K
    description: "Increase all coin gains by +20%",
    type: "prestige",
    requiredPrestigeLevel: 1,
    perk: "coinBoost",
  },
  {
    id: "prestige_xp_boost",
    name: "XP Booster",
    price: 100000,
    description: "Increase all XP gains by +20%",
    type: "prestige",
    requiredPrestigeLevel: 1,
    perk: "xpBoost",
  },
  {
    id: "prestige_fast_work",
    name: "Fast Work Pass",
    price: 150000,
    description: "Reduce your work cooldown by 50%",
    type: "prestige",
    requiredPrestigeLevel: 2,
    perk: "fastWork",
  },
  {
    id: "prestige_rob_immunity",
    name: "Anti-Rob Shield",
    price: 200000,
    description: "You cannot be robbed while active",
    type: "prestige",
    requiredPrestigeLevel: 3,
    perk: "robImmunity",
  },
  {
    id: "ping_reaction",
    name: "Ping Reaction Role 🔔",
    price: 350000,
    type: "special",
    description: "Bot reacts with 3 emojis when you are mentioned.",
    is_exclusive: true,
    duration: 999 * 365 * 24 * 60 * 60 * 1000 // Permanent (999 years)
  },
  {
    id: "custom_role",
    name: "Custom Role 🎭",
    price: 15000000,
    type: "special",
    description: "Get a personal custom role for 2 months.",
    is_exclusive: true,
    duration: 60 * 24 * 60 * 60 * 1000 // 60 days
  },
  {
    id: "clan_role",
    name: "Clan Role 🛡️",
    price: 20000000,
    type: "special",
    description: "Get a custom role for all clan members. Needs 50M clan bank. Lasts 2 months.",
    is_exclusive: true,
    duration: 60 * 24 * 60 * 60 * 1000 // 60 days
  },
];
