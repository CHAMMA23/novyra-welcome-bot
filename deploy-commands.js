require('dotenv').config();
const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('testwelcome')
    .setDescription('Preview the Novyra Roleplay welcome embed and card')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('Optional user to mention in the preview (defaults to you)')
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName('botstatus')
    .setDescription('Check Novyra Welcome Bot operational status')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
].map(command => command.toJSON());

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId) {
  console.error('[ERROR] Please set DISCORD_TOKEN and CLIENT_ID in your .env file before running deploy-commands.js');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('🔄 Registering slash commands for Novyra Welcome Bot...');

    if (guildId) {
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      );
      console.log(`✅ Successfully registered ${commands.length} guild slash commands for Guild ID: ${guildId}`);
    } else {
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
      );
      console.log(`✅ Successfully registered ${commands.length} global slash commands.`);
    }
  } catch (error) {
    console.error('❌ Error registering slash commands:', error);
  }
})();
