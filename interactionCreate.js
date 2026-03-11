const Ticket = require("../database/models/Ticket");
const ReactionRole = require("../database/models/ReactionRole");
const Event = require("../database/models/Event");

async function createTicket(interaction, type) {
  try {
    const channel = await interaction.guild.channels.create({
      name: `ticket-${type}-${interaction.user.username}`,
      type: 0,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: ["ViewChannel"] },
        { id: interaction.user.id, allow: ["ViewChannel", "SendMessages"] }
      ]
    });

    await Ticket.create({
      guildId: interaction.guild.id,
      channelId: channel.id,
      userId: interaction.user.id,
      type
    });

    const embed = new EmbedBuilder()
      .setTitle(`🎫 ${type.toUpperCase()} TICKET`)
      .setDescription(`Hello <@${interaction.user.id}>, staff will be with you shortly.\n\n**Category:** ${type}`)
      .setColor("Blue");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("claim_ticket").setLabel("Claim").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("close_ticket").setLabel("Close").setStyle(ButtonStyle.Danger)
    );

    await channel.send({ content: `<@${interaction.user.id}> | Staff`, embeds: [embed], components: [row] });
    await interaction.reply({ content: `✅ Ticket created: ${channel}`, ephemeral: true });
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: "❌ Error creating ticket.", ephemeral: true });
  }
}

module.exports = {
  name: "interactionCreate",
  once: false,
  async execute(interaction, client) {
    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === "ticket_select") {
        const type = interaction.values[0];
        await createTicket(interaction, type);
      }

      if (interaction.customId.startsWith("rr_")) {
        const messageId = interaction.customId.split("_")[1];
        const roleId = interaction.values[0];

        const rrole = await ReactionRole.findOne({ messageId });
        if (!rrole) return interaction.reply({ content: "❌ Role panel not found.", ephemeral: true });

        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) return interaction.reply({ content: "❌ Role not found.", ephemeral: true });

        try {
          if (interaction.member.roles.cache.has(roleId)) {
            await interaction.member.roles.remove(role);
            await interaction.reply({ content: `✅ Removed **${role.name}**`, ephemeral: true });
          } else {
            await interaction.member.roles.add(role);
            await interaction.reply({ content: `✅ Added **${role.name}**`, ephemeral: true });
          }
        } catch (err) {
          await interaction.reply({ content: "❌ Failed to manage role.", ephemeral: true });
        }
      }
    }

    if (interaction.isButton()) {
      if (interaction.customId === "claim_ticket") {
        const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
        if (!ticket) return interaction.reply({ content: "❌ Ticket not found.", ephemeral: true });
        if (ticket.status !== "open") return interaction.reply({ content: "❌ Ticket already claimed.", ephemeral: true });

        ticket.status = "claimed";
        ticket.claimedBy = interaction.user.id;
        await ticket.save();

        const embed = new EmbedBuilder()
          .setDescription(`👤 Ticket claimed by <@${interaction.user.id}>`)
          .setColor("Green");
        
        await interaction.reply({ embeds: [embed] });
      }

      if (interaction.customId === "close_ticket") {
        const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
        if (!ticket) return interaction.reply({ content: "❌ Ticket not found.", ephemeral: true });

        ticket.status = "closed";
        ticket.closedAt = new Date();
        await ticket.save();

        await interaction.reply("🔒 Closing ticket in 5 seconds...");
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
      }

    if (interaction.isButton()) {
      if (interaction.customId === "confirm_nuke") {
        if (!interaction.member.permissions.has("Administrator")) {
          return interaction.reply({ content: "❌ Permissions missing.", ephemeral: true });
        }
        const channel = interaction.channel;
        const position = channel.position;
        try {
          const newChannel = await channel.clone();
          await channel.delete();
          await newChannel.setPosition(position);
          await newChannel.send("☢️ **Channel Nuked.**");
        } catch (error) {
          console.error(error);
          if (!interaction.replied) await interaction.reply({ content: "❌ Failed to nuke.", ephemeral: true });
        }
        return;
      }
    }

    }

    if (interaction.isChatInputCommand()) {
      const command = client.slashCommands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(error);
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
          await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
      }
      return;
    }

    if (!interaction.isButton()) return;

    if (interaction.customId.startsWith('role_')) {
      const roleId = interaction.customId.split('_')[1];
      const role = interaction.guild.roles.cache.get(roleId);

      if (!role) {
        // Try to handle emoji as part of customId if reaction role setup uses it
        // But for now let's just ensure we handle the role correctly
        return interaction.reply({ content: '❌ Role not found on this server.', flags: [64] });
      }

      try {
        if (interaction.member.roles.cache.has(roleId)) {
          await interaction.member.roles.remove(role);
          await interaction.reply({ content: `✅ Removed the role: **${role.name}**`, flags: [64] });
        } else {
          await interaction.member.roles.add(role);
          await interaction.reply({ content: `✅ Added the role: **${role.name}**`, flags: [64] });
        }
      } catch (err) {
        console.error(err);
        await interaction.reply({ content: '❌ I do not have permission to manage this role.', flags: [64] });
      }
    }

    if (interaction.customId.startsWith("ticket_")) {
      const type = interaction.customId.split("_")[1];

      try {
        const channel = await interaction.guild.channels.create({
          name: `ticket-${interaction.user.username}`,
          type: 0,
          permissionOverwrites: [
            {
              id: interaction.guild.id,
              deny: ["ViewChannel"]
            },
            {
              id: interaction.user.id,
              allow: ["ViewChannel", "SendMessages"]
            }
          ]
        });

        await Ticket.create({
          guildId: interaction.guild.id,
          channelId: channel.id,
          userId: interaction.user.id,
          type
        });

        interaction.reply({ content: `✅ Ticket created: ${channel}`, ephemeral: true });
      } catch (err) {
        console.error(err);
        interaction.reply({ content: '❌ Failed to create ticket channel. Make sure I have "Manage Channels" permission.', ephemeral: true });
      }
    }
  },
};
