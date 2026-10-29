require('dotenv').config();
const fs = require('fs');
const path = require('path');
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
} = require('discord.js');

const config = require('./config.json');

// Anti-duplicate protection: 60s cooldown per member & concurrency lock
const welcomedMembers = new Map();
const processingMembers = new Set();

// Clean up cooldown map every 10 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [id, time] of welcomedMembers.entries()) {
    if (now - time > 60000) welcomedMembers.delete(id);
  }
}, 600000);

// Initialize Discord Client with disabled HTTP retries to prevent duplicate message sending
const client = new Client({
  rest: {
    timeout: 60000,
    retries: 0 // Prevents Discord.js from retrying message POST on network latency
  },
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildEmojisAndStickers
  ]
});

/**
 * Creates the welcome embed, attachments, and action buttons
 * @param {import('discord.js').GuildMember} member
 */
function buildWelcomePayload(member) {
  const guild = member.guild;
  const files = [];
  let imageSource = null;

  // 1. Prepare GIF attachment
  if (config.embed.useLocalGif && config.embed.localGifPath) {
    const localPath = path.resolve(__dirname, config.embed.localGifPath);
    if (fs.existsSync(localPath)) {
      const attachment = new AttachmentBuilder(localPath, { name: 'welcome.gif' });
      files.push(attachment);
      imageSource = 'attachment://welcome.gif';
    } else {
      console.warn(`[WARNING] Local GIF file not found at ${localPath}`);
    }
  } else if (config.embed.externalGifUrl && config.embed.externalGifUrl.trim().startsWith('http')) {
    imageSource = config.embed.externalGifUrl.trim();
  }

  // Create Rich Embed
  const welcomeEmbed = new EmbedBuilder()
    .setColor(config.embed.color || '#00e5ff')
    .setTitle(config.embed.mainTitle || 'WELCOME TO NOVYRA ROLEPLAY')
    .setThumbnail(member.user.displayAvatarURL({ extension: 'png', dynamic: true, size: 256 }))
    .setDescription(
      `Welcome to **${guild.name}**, <@${member.id}>!\n\n` +
      `${config.embed.description}\n\u200B`
    )
    .setFooter({
      text: config.embed.footerText || 'POWERD BY  TEAM NOVYRA',
      iconURL: guild.iconURL({ extension: 'png', dynamic: true }) || member.user.displayAvatarURL()
    })
    .setTimestamp();

  // Add configured sections dynamically
  if (config.sections) {
    const fieldsToAdd = [];
    for (const key of Object.keys(config.sections)) {
      const sec = config.sections[key];
      if (sec && sec.enabled !== false && sec.title && sec.value) {
        fieldsToAdd.push({
          name: sec.title,
          value: sec.value,
          inline: false
        });
      }
    }
    if (fieldsToAdd.length > 0) {
      welcomeEmbed.addFields(fieldsToAdd);
    }
  }

  // Attach GIF to embed if available
  if (imageSource) {
    welcomeEmbed.setImage(imageSource);
  }

  // Build Action Buttons
  const buttons = [];

  if (config.buttons?.fivemConnect?.enabled && config.buttons.fivemConnect.url) {
    buttons.push(
      new ButtonBuilder()
        .setLabel(config.buttons.fivemConnect.label || 'Connect to FiveM')
        .setEmoji(config.buttons.fivemConnect.emoji || '🎮')
        .setStyle(ButtonStyle.Link)
        .setURL(config.buttons.fivemConnect.url)
    );
  }

  if (config.buttons?.discordRules?.enabled && config.buttons.discordRules.url) {
    buttons.push(
      new ButtonBuilder()
        .setLabel(config.buttons.discordRules.label || 'Server Rules')
        .setEmoji(config.buttons.discordRules.emoji || '📜')
        .setStyle(ButtonStyle.Link)
        .setURL(config.buttons.discordRules.url)
    );
  }

  if (config.buttons?.supportTicket?.enabled && config.buttons.supportTicket.url) {
    buttons.push(
      new ButtonBuilder()
        .setLabel(config.buttons.supportTicket.label || 'Open Ticket')
        .setEmoji(config.buttons.supportTicket.emoji || '🎫')
        .setStyle(ButtonStyle.Link)
        .setURL(config.buttons.supportTicket.url)
    );
  }

  const components = [];
  if (buttons.length > 0) {
    const row = new ActionRowBuilder().addComponents(buttons);
    components.push(row);
  }

  const payload = {
    embeds: [welcomeEmbed],
    files: files
  };

  if (components.length > 0) {
    payload.components = components;
  }

  return payload;
}

// Client Ready Event
client.once(Events.ClientReady, (readyClient) => {
  console.log('====================================================');
  console.log(`🤖 Logged in as: ${readyClient.user.tag}`);
  console.log(`🏰 Serving in ${readyClient.guilds.cache.size} server(s)`);
  console.log(`✨ Novyra Roleplay Welcome Bot is ONLINE & READY!`);
  console.log('====================================================');

  readyClient.user.setActivity('Novyra Roleplay | FiveM', { type: 0 }); // Playing Novyra Roleplay
});

// Member Join Event (guildMemberAdd)
client.on(Events.GuildMemberAdd, async (member) => {
  const now = Date.now();

  // Concurrency guard: Ignore if already processing this member
  if (processingMembers.has(member.id)) {
    console.log(`[DEBOUNCE] Member ${member.id} is already in-progress. Skipping duplicate.`);
    return;
  }

  // 60-second cooldown per member to prevent duplicate welcomes
  const lastTime = welcomedMembers.get(member.id);
  if (lastTime && (now - lastTime) < 60000) {
    console.log(`[DEBOUNCE] Blocked duplicate welcome for ${member.user.tag} (${now - lastTime}ms since last welcome).`);
    return;
  }

  welcomedMembers.set(member.id, now);
  processingMembers.add(member.id);

  console.log(`[JOIN] ${member.user.tag} joined ${member.guild.name} (ID: ${member.id})`);

  try {
    // 1. Auto-Role Assignment (Async, non-blocking)
    if (config.autoRoleEnabled && config.autoRoleId && config.autoRoleId !== 'YOUR_AUTO_ROLE_ID_HERE') {
      try {
        const role = member.guild.roles.cache.get(config.autoRoleId);
        if (role) {
          await member.roles.add(role);
          console.log(`[AUTO-ROLE] Added role "${role.name}" to ${member.user.tag}`);
        } else {
          console.warn(`[AUTO-ROLE] Role with ID ${config.autoRoleId} was not found in guild.`);
        }
      } catch (err) {
        console.error(`[AUTO-ROLE ERROR] Failed to assign role to ${member.user.tag}:`, err.message);
      }
    }

    // 2. Welcome Message in Channel
    const channelId = config.welcomeChannelId;
    if (!channelId || channelId === 'YOUR_WELCOME_CHANNEL_ID_HERE') {
      console.warn('[WELCOME] welcomeChannelId is not configured in config.json!');
      return;
    }

    const welcomeChannel = member.guild.channels.cache.get(channelId);
    if (!welcomeChannel) {
      console.warn(`[WELCOME] Channel with ID ${channelId} was not found!`);
      return;
    }

    const payload = buildWelcomePayload(member);
    await welcomeChannel.send(payload);
    console.log(`[WELCOME] Sent welcome card for ${member.user.tag} in #${welcomeChannel.name}`);

    // 3. Optional DM Welcome
    if (config.dmWelcome?.enabled) {
      try {
        await member.send({
          content: `Hey **${member.user.username}**! ${config.dmWelcome.message}`
        });
        console.log(`[DM] Sent welcome DM to ${member.user.tag}`);
      } catch (err) {
        console.log(`[DM] Could not DM ${member.user.tag} (DMs might be closed).`);
      }
    }
  } catch (err) {
    console.error(`[WELCOME ERROR] Failed to send welcome message:`, err);
  } finally {
    processingMembers.delete(member.id);
  }
});

// Slash Command Interaction Handler
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'testwelcome') {
    await interaction.deferReply();

    const targetUser = interaction.options.getUser('user') || interaction.user;
    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    if (!targetMember) {
      return interaction.editReply({ content: '❌ Could not find that member in this server.' });
    }

    try {
      const payload = buildWelcomePayload(targetMember);
      await interaction.editReply(payload);
    } catch (error) {
      console.error('[TEST ERROR]', error);
      await interaction.editReply({ content: `❌ Error generating preview: ${error.message}` });
    }
  } else if (commandName === 'botstatus') {
    const ping = client.ws.ping;
    const channel = client.channels.cache.get(config.welcomeChannelId);
    const role = interaction.guild.roles.cache.get(config.autoRoleId);

    const statusEmbed = new EmbedBuilder()
      .setColor('#00ff7f')
      .setTitle('📊 Novyra Welcome Bot Status')
      .addFields(
        { name: '🏓 Ping', value: `${ping}ms`, inline: true },
        { name: '📢 Welcome Channel', value: channel ? `<#${channel.id}>` : '❌ Not configured', inline: true },
        { name: '🎭 Auto-Role', value: role ? `<@&${role.id}>` : '❌ Not configured', inline: true },
        { name: '🖼️ Welcome GIF Source', value: config.embed.externalGifUrl ? '⚡ Fast CDN URL (Instant)' : '📦 Local File', inline: true }
      )
      .setFooter({ text: 'Novyra Roleplay Management' })
      .setTimestamp();

    await interaction.reply({ embeds: [statusEmbed], ephemeral: true });
  }
});

// Login Bot
const token = process.env.DISCORD_TOKEN;
if (!token || token.trim() === '' || token === 'your_bot_token_here') {
  console.log('========================================================================');
  console.log('⚠️  DISCORD_TOKEN is missing!');
  console.log('   Please add your Bot Token into the .env file in this directory.');
  console.log('   Get your token from: https://discord.com/developers/applications');
  console.log('========================================================================');
} else {
  client.login(token).catch((err) => {
    console.error('❌ Failed to login to Discord:', err.message);
  });
}
