const { PermissionFlagsBits } = require("discord.js");
const { resolveRole } = require("../../utils/resolver");

module.exports = {
  name: "editrole",
  description: "Edit a role's name or color",
  module: "moderation",
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return message.reply("❌ You need `Manage Roles` permission.");
    }

    const role = resolveRole(message, args[0]);
    if (!role) return message.reply("❌ Usage: `$editrole <@role|ID|name> <name|color> <value>`");

    const option = args[1]?.toLowerCase();
    const value = args.slice(2).join(" ");

    if (!option || !value) return message.reply("❌ Specify what to edit (name/color) and the new value.");

    if (role.position >= message.guild.members.me.roles.highest.position) {
      return message.reply("❌ I cannot edit this role due to hierarchy.");
    }

    try {
      if (option === "name") {
        await role.setName(value);
        message.reply(`✅ Role name updated to **${value}**.`);
      } else if (option === "color") {
        await role.setColor(value.startsWith("#") ? value : `#${value}`);
        message.reply(`✅ Role color updated to **${value}**.`);
      } else {
        message.reply("❌ Invalid option. Use `name` or `color`.");
      }
    } catch (err) {
      message.reply("❌ Failed to edit role. Make sure the color hex is valid.");
    }
  }
};
