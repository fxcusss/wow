import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import { initDatabase } from './database.js';
import { startWebServer } from './server.js';
import * as activateCommand from './commands/activate.js';
import * as licensesCommand from './commands/licenses.js';
import * as revokeCommand from './commands/revoke.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages
  ]
});

client.commands = new Collection();
client.commands.set(activateCommand.data.name, activateCommand);
client.commands.set(licensesCommand.data.name, licensesCommand);
client.commands.set(revokeCommand.data.name, revokeCommand);

client.once('ready', async () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🤖 Discord License Bot');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`🆔 Bot ID: ${client.user.id}`);
  console.log(`🌐 Connected to ${client.guilds.cache.size} server(s)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await initDatabase();

  await registerCommands();
  
  startWebServer();
  
  console.log('✅ Bot is fully operational!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});

async function registerCommands() {
  const commands = [
    activateCommand.data.toJSON(),
    licensesCommand.data.toJSON(),
    revokeCommand.data.toJSON()
  ];

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

  try {
    console.log('🔄 Registering slash commands...');

    for (const guild of client.guilds.cache.values()) {
      await rest.put(
        Routes.applicationGuildCommands(client.user.id, guild.id),
        { body: commands }
      );
      console.log(`✅ Commands registered for guild: ${guild.name}`);
    }

    console.log('✅ All slash commands registered successfully!');
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.warn(`⚠️ Unknown command: ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
    console.log(`✅ Command executed: /${interaction.commandName} by ${interaction.user.tag}`);
  } catch (error) {
    console.error(`❌ Error executing command /${interaction.commandName}:`, error);
    
    const errorMessage = {
      content: '❌ There was an error executing this command!',
      ephemeral: true
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

client.on('guildCreate', async guild => {
  console.log(`📥 Joined new guild: ${guild.name} (${guild.id})`);
  await registerCommands();
});

client.on('error', error => {
  console.error('❌ Discord client error:', error);
});

process.on('unhandledRejection', error => {
  console.error('❌ Unhandled promise rejection:', error);
});

if (!process.env.DISCORD_BOT_TOKEN) {
  console.error('❌ DISCORD_BOT_TOKEN is not set in environment variables!');
  console.error('📝 Please add your Discord bot token to the Secrets tab.');
  process.exit(1);
}

client.login(process.env.DISCORD_BOT_TOKEN).catch(error => {
  console.error('❌ Failed to login to Discord:', error);
  console.error('📝 Please check your DISCORD_BOT_TOKEN in the Secrets tab.');
  process.exit(1);
});
