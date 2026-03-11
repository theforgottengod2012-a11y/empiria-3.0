const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");
require("dotenv").config();

module.exports = async (client) => {
  client.slashCommands = new Map();
  const commands = [];
  const slashPath = path.join(__dirname, "../slashCommands");

  const folders = fs.readdirSync(slashPath);
  for (const folder of folders) {
    const folderPath = path.join(slashPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
      try {
        const command = require(path.join(folderPath, file));
        if (command.data && (command.execute || command.slashExecute)) {
          // Add support for slashExecute if execute is not present
          if (!command.execute && command.slashExecute) {
            command.execute = command.slashExecute;
          }
          
          // Enable command for DMs and outside of servers (Integration types)
          if (typeof command.data.setContexts === 'function') {
            command.data.setContexts([0, 1, 2]); // Guild, BotDM, PrivateDM
          }
          if (typeof command.data.setIntegrationTypes === 'function') {
            command.data.setIntegrationTypes([0, 1]); // GuildInstall, UserInstall
          }
          client.slashCommands.set(command.data.name, command);
          commands.push(command.data.toJSON());
          console.log(`Loaded slash command: ${command.data.name}`);
        } else {
          console.warn(`[WARNING] The command at ${path.join(folderPath, file)} is missing a required "data" or "execute" property.`);
        }
      } catch (error) {
        console.error(`[ERROR] Failed to load command at ${path.join(folderPath, file)}:`, error);
      }
    }
  }

  client.once("ready", async () => {
    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    try {
      console.log(`Started refreshing ${commands.length} application (/) commands.`);
      const data = await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands }
      );
      console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
      console.error(error);
    }
  });
};
