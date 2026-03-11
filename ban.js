const Case = require("../../database/models/Case");
const { getNextCaseId } = require("../../utils/caseUtils");
const { resolveUser } = require("../../utils/resolver");

module.exports = {
  name: "ban",
  description: "Ban a user",
  permissions: ["BanMembers"],

  async execute(message, args, client) {
    const user = await resolveUser(message, args[0]);
    if (!user) return message.reply("❌ Please provide a valid user mention, ID, or username.");

    const member = message.guild.members.cache.get(user.id);

    if (member) {
      if (!member.bannable) {
        return message.reply("❌ I cannot ban this user. They might have a higher role than me or I lack permissions.");
      }
      if (message.member.roles.highest.position <= member.roles.highest.position && message.author.id !== message.guild.ownerId) {
        return message.reply("❌ You cannot ban someone with an equal or higher role.");
      }
    }

    const reason = args.slice(1).join(" ") || "No reason";

    if (user.id === "1359147702088237076") return message.reply("❌ You cannot ban the bot owner.");

    try {
      await message.guild.members.ban(user, { reason });
    } catch (error) {
      console.error(error);
      return message.reply("❌ Failed to ban the user. Check my permissions and role hierarchy.");
    }

    const caseId = await getNextCaseId(message.guild.id);
    await Case.create({
      guildId: message.guild.id,
      caseId,
      userId: user.id,
      moderatorId: message.author.id,
      action: "BAN",
      reason
    });

    message.channel.send(
      `🔨 **${user.tag} banned**\nReason: ${reason}\nCase #${caseId}`
    );
  }
};