const express = require("express");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const DiscordOAuth2 = require("discord-oauth2");
const User = require("../src/database/models/User");
const Clan = require("../src/database/models/Clan");

// Module metadata for commands page
const MODULE_META = {
  economy:      { emoji: "💰", desc: "Economy, jobs, gambling, farming, pets" },
  moderation:   { emoji: "🛡️", desc: "Ban, kick, warn, mute, automod" },
  fun:          { emoji: "🎮", desc: "Games, memes, trivia, 8ball" },
  giveaway:     { emoji: "🎉", desc: "Start, end and reroll giveaways" },
  clans:        { emoji: "⚔️", desc: "Create and manage clans" },
  government:   { emoji: "🏛️", desc: "Government, laws, taxes, budget" },
  tickets:      { emoji: "🎫", desc: "Support ticket system" },
  utility:      { emoji: "🔧", desc: "Server info, roles, settings" },
  music:        { emoji: "🎵", desc: "Play music in voice channels" },
  misc:         { emoji: "📦", desc: "Miscellaneous commands" },
  leaderboards: { emoji: "🏆", desc: "Rankings and leaderboards" },
  antinuke:     { emoji: "🔒", desc: "Anti-nuke protection" },
  automod:      { emoji: "🤖", desc: "Auto moderation rules" },
  stardust:     { emoji: "✨", desc: "Stardust special system" },
  vanityroles:  { emoji: "🎨", desc: "Custom vanity roles" },
  welcomer:     { emoji: "👋", desc: "Welcome messages" },
  pets:         { emoji: "🐾", desc: "Pet training and battles" },
  extra:        { emoji: "➕", desc: "Extra features" },
  verify:       { emoji: "✅", desc: "Verification system" },
  system:       { emoji: "⚙️", desc: "Core system commands" },
};

module.exports = (client) => {
  const app = express();
  const oauth = new DiscordOAuth2();

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));
  app.use(express.static(path.join(__dirname, "public")));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    session({
      secret: "empiria-secret-key",
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
      cookie: { maxAge: 604800000 }, // 1 week
    })
  );

  const CLIENT_ID = "1457754742104260771";
  const CLIENT_SECRET = "z_QDGbXr4u7bktzS-1vSn1po1MWCAZWX";
  const REDIRECT_URI = "https://1682f7be-a061-4cb0-9577-334094ceae4b-00-1g8sg3safhgyi.sisko.replit.dev/auth/callback";

  app.get("/", async (req, res) => {
    const stats = {
      servers: client.guilds.cache.size,
      users: client.users.cache.size,
      commands: client.commands.size + client.slashCommands.size,
    };
    res.render("index", { 
      client, 
      stats, 
      user: req.session.user,
      supportLink: "https://discord.gg/9tTquEvm2K",
      inviteLink: "https://discord.com/oauth2/authorize?client_id=1457754742104260771&permissions=8&integration_type=0&scope=bot",
      voteLink: "https://top.gg/discord/servers/809323948479131648?s=040c542cf587e"
    });
  });

  app.get("/login", (req, res) => {
    const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&response_type=code&scope=identify%20guilds`;
    res.redirect(url);
  });

  app.get("/auth/callback", async (req, res) => {
    const code = req.query.code;
    if (!code) return res.redirect("/");

    try {
      const tokenData = await oauth.tokenRequest({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        code,
        scope: "identify guilds",
        grantType: "authorization_code",
        redirectUri: REDIRECT_URI,
      });

      const user = await oauth.getUser(tokenData.access_token);
      req.session.user = user;
      res.redirect("/dashboard");
    } catch (error) {
      console.error(error);
      res.redirect("/");
    }
  });

  app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
  });

  // ── /commands — live searchable command reference ───────────────────────
  app.get("/commands", (req, res) => {
    const categories = {};
    [...client.commands.values()].forEach(cmd => {
      const mod = cmd.module || "system";
      if (!categories[mod]) categories[mod] = [];
      categories[mod].push({
        name: cmd.name,
        description: cmd.description || "",
        usage: cmd.usage || `$${cmd.name}`,
        aliases: cmd.aliases || [],
        module: mod,
      });
    });

    // Sort commands alphabetically within each category
    Object.keys(categories).forEach(cat => {
      categories[cat].sort((a, b) => a.name.localeCompare(b.name));
    });

    const allCommandsList = [...client.commands.values()].map(c => ({
      name: c.name,
      description: c.description || "",
      usage: c.usage || `$${c.name}`,
      aliases: c.aliases || [],
      module: c.module || "system",
    }));

    res.render("commands", {
      categories,
      catMeta: MODULE_META,
      totalCommands: client.commands.size,
      allCommandsList,
      user: req.session.user || null,
    });
  });

  // ── /guide — full feature guide ──────────────────────────────────────────
  app.get("/guide", (req, res) => {
    res.render("guide", { user: req.session.user || null });
  });

  app.get("/dashboard", async (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    
    const dbUser = await User.findOne({ userId: req.session.user.id });
    const clan = dbUser && dbUser.clanId ? await Clan.findOne({ clanId: dbUser.clanId }) : null;

    res.render("dashboard", {
      user: req.session.user,
      dbUser,
      clan,
      client
    });
  });

  return app;
};
