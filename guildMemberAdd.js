const GuildSettings = require("../database/models/GuildSettings");
const AutoMod = require("../database/models/AutoMod");
const { EmbedBuilder } = require("discord.js");

module.exports = async member => {
  // 📥 Auto Role Logic
  const config = await AutoMod.findOne({ guildId: member.guild.id });
  if (config && config.autoRole) {
    const role = member.guild.roles.cache.get(config.autoRole);
    if (role) {
      await member.roles.add(role).catch(() => {});
    }
  }

  const settings = await GuildSettings.findOne({ guildId: member.guild.id });
  if (!settings || !settings.welcomeChannel) return;

  const channel = member.guild.channels.cache.get(settings.welcomeChannel);
  if (!channel) return;

  const msg = settings.welcomeMessage
    .replace("{user}", `<@${member.id}>`)
    .replace("{server}", member.guild.name);

  const embed = new EmbedBuilder()
    .setTitle("Welcome!")
    .setDescription(msg)
    .setColor("Green");

  channel.send({ embeds: [embed] });
};