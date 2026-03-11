const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  client.commands = new Map();

  const modulesPath = path.join(__dirname, "../modules");

  const moduleFolders = fs
    .readdirSync(modulesPath)
    .filter((folder) =>
      fs.statSync(path.join(modulesPath, folder)).isDirectory()
    );

  for (const folder of moduleFolders) {
    const folderPath = path.join(modulesPath, folder);

    const commandFiles = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const filePath = path.join(folderPath, file);
      // Clear cache to allow for updates
      delete require.cache[require.resolve(filePath)];
      const command = require(filePath);
      command.module = folder; // Auto-assign module based on folder name

      if (!command.name || typeof command.execute !== "function") {
        console.warn(
          `⚠️ Skipped invalid command file: ${filePath}`
        );
        continue;
      }

      client.commands.set(command.name, command);
    }
  }

  console.log(`✅ Loaded ${client.commands.size} commands`);
};
