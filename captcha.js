const { AttachmentBuilder } = require("discord.js");
const { Captcha } = require("captcha-canvas");
const GuildSettings = require("../../database/models/GuildSettings");

module.exports = {
  name: "verify",
  async execute(message) {
    const captcha = new Captcha();
    captcha.async = false;
    captcha.addDecoy();
    captcha.drawTrace();
    captcha.drawCaptcha();

    const buffer = captcha.png;
    const attachment = new AttachmentBuilder(buffer, { name: "captcha.png" });
    await message.author.send({ files: [attachment] });

    message.author.send("Enter the captcha text here:");

    const filter = m => m.author.id === message.author.id;
    const collector = message.author.dmChannel.createMessageCollector({ filter, time: 60000, max: 1 });

    collector.on("collect", async m => {
      if (m.content === captcha.text) {
        message.author.send("✅ Verified!");
        const settings = await GuildSettings.findOne({ guildId: message.guild.id });
        if (settings && settings.autorole) {
          const role = message.guild.roles.cache.get(settings.autorole);
          if (role) {
            try {
              const member = await message.guild.members.fetch(message.author.id);
              await member.roles.add(role);
            } catch (err) {
              console.error("Error giving autorole:", err);
            }
          }
        }
      } else {
        message.author.send("❌ Wrong captcha, try again.");
      }
    });
  }
};