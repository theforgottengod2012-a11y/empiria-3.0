const { SlashCommandBuilder, PermissionFlagsBits, PermissionsBitField } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roleperms")
    .setDescription("Add or remove permissions for a role")
    .addRoleOption(option => option.setName("role").setDescription("The role to modify").setRequired(true))
    .addStringOption(option => option.setName("permission").setDescription("The permission to toggle (e.g. Administrator, ManageMessages)").setRequired(true))
    .addBooleanOption(option => option.setName("allow").setDescription("Whether to allow (true) or deny (false) the permission").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const role = interaction.options.getRole("role");
    const permName = interaction.options.getString("permission");
    const allow = interaction.options.getBoolean("allow");

    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.reply({ content: "❌ I cannot edit this role as it is higher than or equal to my highest role.", ephemeral: true });
    }

    const perm = PermissionsBitField.Flags[permName];
    if (!perm) {
      return interaction.reply({ content: "❌ Invalid permission name. Example: `ManageMessages`, `Administrator`, `BanMembers`.", ephemeral: true });
    }

    try {
      const newPerms = new PermissionsBitField(role.permissions);
      if (allow) newPerms.add(perm);
      else newPerms.remove(perm);

      await role.setPermissions(newPerms);
      await interaction.reply({ content: `✅ Successfully ${allow ? "added" : "removed"} **${permName}** for role **${role.name}**.` });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: "❌ Failed to update role permissions.", ephemeral: true });
    }
  }
};
