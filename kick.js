const Case = require("../../database/models/Case");
const { getNextCaseId } = require("../../utils/caseUtils");
const { resolveMember } = require("../../utils/resolver");

module.exports = {
  name: "kick",
  description: "Kick a member from the server",
  permissions: ["KickMembers"],

  async execute(message, args) {
    const member = await resolveMember(message, args[0]);
    if (!member) return message.reply("❌ Please provide a valid member mention, ID, or username.");
    
    if (!member.kickable) return message.reply("❌ I cannot kick this member. They might have a higher role than me or I lack permissions.");
    if (message.member.roles.highest.position <= member.roles.highest.position && message.author.id !== message.guild.ownerId) {
      return message.reply("❌ You cannot kick someone with an equal or higher role.");
    }

    const reason = args.slice(1).join(" ") || "No reason";

    try {
      await member.kick(reason);
    } catch (error) {
      console.error(error);
      return message.reply("❌ Failed to kick the member.");
    }

    const caseId = await getNextCaseId(message.guild.id);
    await Case.create({
      guildId: message.guild.id,
      caseId,
      userId: member.id,
      moderatorId: message.author.id,
      action: "KICK",
      reason
    });

    message.channel.send(`👢 **${member.user.tag} kicked** (Case #${caseId})`);
  }
};