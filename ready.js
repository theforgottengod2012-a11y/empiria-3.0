const { ActivityType } = require("discord.js");

module.exports = {
  name: "clientReady",
  once: true,
  execute(client) {
    console.log(`🤖 Empiria v2 online as ${client.user.tag}`);
    console.log("------------------------------------------");
    console.log("The bot is now fully connected to Discord!");
    console.log("------------------------------------------");

    // Start Giveaway End Checker
    require("../giveaways/end")(client);

    // ─── Rotating Status ───────────────────────────────────────────────────
    // Weights: discord.gg/ecz shows 3x, prefix shows 2x, join shows 2x
    const statuses = [
      { text: "discord.gg/ecz",                  type: ActivityType.Watching },
      { text: "discord.gg/ecz",                  type: ActivityType.Watching },
      { text: "discord.gg/ecz",                  type: ActivityType.Watching },
      { text: "Join our server: discord.gg/ecz", type: ActivityType.Playing  },
      { text: "Join our server: discord.gg/ecz", type: ActivityType.Playing  },
      { text: "Bot prefix: $",                   type: ActivityType.Listening},
      { text: "Bot prefix: $",                   type: ActivityType.Listening},
      { text: "$help for commands",              type: ActivityType.Playing  },
      { text: "Empiria 3.0 | discord.gg/ecz",   type: ActivityType.Playing  },
      { text: "Server OS | $help",               type: ActivityType.Watching },
      { text: "197 commands loaded",             type: ActivityType.Playing  },
      { text: "discord.gg/ecz",                  type: ActivityType.Watching },
      { text: "Protecting your server 🛡️",      type: ActivityType.Watching },
      { text: "discord.gg/ecz",                  type: ActivityType.Watching },
      { text: "Economy | Clans | Moderation",    type: ActivityType.Playing  },
      { text: "Bot prefix: $",                   type: ActivityType.Listening},
    ];

    let index = 0;

    const setStatus = () => {
      const s = statuses[index % statuses.length];
      client.user.setPresence({
        activities: [{ name: s.text, type: s.type }],
        status: "online",
      });
      index++;
    };

    setStatus(); // Set immediately on boot
    setInterval(setStatus, 20_000); // Rotate every 20 seconds
  },
};
