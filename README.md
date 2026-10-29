# 🎮 Novyra Roleplay - Discord Welcome & Onboarding Bot

A clean, modern, and high-performance Welcome & Onboarding Bot designed for the **Novyra Roleplay** FiveM community.

---

## ✨ Features

- 🌟 **Dynamic Welcome Embed:** Sends a sleek welcome card when new players join your Discord server.
- 🖼️ **Local GIF Display:** Directly attaches and embeds your local GIF banner (`assets/welcome.gif`) into the Discord message.
- 🎭 **Automated Auto-Role:** Automatically grants a default role (e.g., Citizen / Member) to new members upon joining.
- 📜 **Guidelines & Rules Display:** Displays clear community rules, guidelines, and expectations directly inside the card.
- 🔘 **Interactive Action Buttons:** Includes direct link buttons for connecting to FiveM (`cfx.re`), opening server rules, or creating support tickets.
- 🔒 **Duplicate Join Prevention:** Built-in concurrency lock and cooldown to prevent double welcome messages during lag or rapid reconnects.
- 🧪 **Preview Slash Commands:** Run `/testwelcome` anytime in Discord to preview the card without having to re-join the server.
- 📊 **Status Check Command:** Run `/botstatus` to view the bot's live operational status, ping, and configuration health.

---

## 📋 Prerequisites

Before setting up the bot, ensure you have:
- [Node.js](https://nodejs.org/) **v18.0.0 or higher** installed on your system.
- Administrative privileges on your Discord server.
- Developer Mode enabled in Discord (Settings ➡️ Advanced ➡️ Developer Mode).

---

## 🚀 Step-by-Step Setup Guide

### Step 1: Clone or Download the Repository
Clone the repository or download the folder:
```bash
git clone https://github.com/<your-username>/novyra-welcome-bot.git
cd novyra-welcome-bot
```

Install the required Node.js dependencies:
```bash
npm install
```

---

### Step 2: Create Your Bot in the Discord Developer Portal
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click **New Application** and give your bot a name (e.g., `Novyra Welcome Bot`).
3. In the left navigation menu, click **Bot**.
4. Scroll down to the **Privileged Gateway Intents** section:
   - ✅ **Server Members Intent:** Turn this **ON**. *(Required to detect when new users join and assign auto-roles)*.
5. Under the Bot username, click **Reset Token**, confirm, and **Copy** your Bot Token. Save it securely!

---

### Step 3: Invite the Bot to Your Server
1. In the left sidebar, navigate to **OAuth2** ➡️ **URL Generator**.
2. Under **Scopes**, select:
   - `bot`
   - `applications.commands` *(Required for `/testwelcome` and `/botstatus` slash commands)*
3. Under **Bot Permissions**, select:
   - `Send Messages`
   - `Embed Links`
   - `Attach Files`
   - `Manage Roles` *(Required for assigning auto-roles)*
   - `Use External Emojis`
   - `View Channels`
   - `Read Message History`
4. Copy the generated invite link at the bottom of the page, open it in your browser, and authorize the bot to join your server.

> [!IMPORTANT]
> ### Critical Step: Auto-Role Hierarchy
> Discord's role hierarchy dictates that a bot can only assign roles that are placed **BELOW** the bot's highest role.
> 1. In your Discord server, go to **Server Settings** ➡️ **Roles**.
> 2. Drag the **Novyra Welcome Bot** role **ABOVE** the auto-role you wish to assign (e.g., above `@Citizen` or `@Member`).
> 3. If the bot's role is lower, role assignment will fail with a `Missing Permissions` error.

---

### Step 4: Configure Environment Variables (`.env`)
Create a `.env` file in the root directory (or rename `.env.example` to `.env`):

```env
# Discord Bot Credentials
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_bot_client_id_here
GUILD_ID=your_discord_server_id_here
```

Replace:
- `your_bot_token_here`: The Bot Token copied from Step 2.
- `your_bot_client_id_here`: The Application ID from Developer Portal (General Information tab).
- `your_discord_server_id_here`: Your Discord Server ID (Right-click your server name in Discord ➡️ Copy Server ID).

---

### Step 5: Configure Bot Settings (`config.json`)
Open `config.json` and adjust the configuration to match your server:

```json
{
  "serverName": "Novyra Roleplay",
  "welcomeChannelId": "YOUR_WELCOME_CHANNEL_ID_HERE",
  "autoRoleId": "YOUR_AUTO_ROLE_ID_HERE",
  "autoRoleEnabled": true,
  
  "embed": {
    "color": "#00e5ff",
    "mainTitle": "👑 WELCOME TO NOVYRA ROLEPLAY 👑",
    "description": "We are thrilled to have you as part of our growing community. Please take a moment to review our rules and guidelines before starting your roleplay journey.",
    "footerText": "POWERED BY TEAM NOVYRA",
    "useLocalGif": true,
    "localGifPath": "./assets/welcome.gif",
    "externalGifUrl": ""
  },

  "sections": {
    "discordRules": {
      "enabled": true,
      "title": "🔍 DISCORD COMMUNITY GUIDELINES",
      "value": "\u200B\n➤ **Be Respectful:** Treat all members and staff with respect at all times.\n\n➤ **No Toxicity or Hate Speech:** Toxic behavior, discrimination, and drama are strictly prohibited.\n\n➤ **Proper Channels:** Keep discussions, media, and clips in their designated channels.\n\n➤ **No Advertising:** DM advertising or self-promotion without staff permission will lead to an instant ban."
    }
  },

  "buttons": {
    "fivemConnect": {
      "enabled": false,
      "label": "Connect to FiveM",
      "emoji": "🎮",
      "url": "https://cfx.re/join/xxxxxx"
    },
    "discordRules": {
      "enabled": false,
      "label": "Server Rules",
      "emoji": "📜",
      "url": "https://discord.com/channels/@me"
    },
    "supportTicket": {
      "enabled": false,
      "label": "Open Ticket",
      "emoji": "🎫",
      "url": "https://discord.com/channels/@me"
    }
  },

  "dmWelcome": {
    "enabled": false,
    "message": "Welcome to **Novyra Roleplay**! Make sure to read the server rules and enjoy your stay!"
  }
}
```

#### Configuration Breakdown:
| Parameter | Type | Description |
|---|---|---|
| `welcomeChannelId` | `string` | The ID of the channel where welcome messages will be posted. |
| `autoRoleId` | `string` | The Role ID assigned automatically to new members. |
| `autoRoleEnabled` | `boolean` | Set to `true` to enable auto-role or `false` to disable. |
| `embed.color` | `string` | Hex color code for the embed accent bar (e.g., `#00e5ff`). |
| `buttons.*.enabled` | `boolean` | Toggle interactive action buttons on/off. |
| `buttons.*.url` | `string` | Web or Discord URL for button actions. |

---

### Step 6: Register Slash Commands
Before using `/testwelcome` or `/botstatus`, register the commands to Discord:

- **Windows:** Double-click `register_commands.bat`.
- **Manual / Terminal:**
  ```bash
  node deploy-commands.js
  ```

---

### Step 7: Start the Bot

- **Windows (1-Click):**
  Double-click `run.bat`.

- **Terminal / Linux / Mac / VPS:**
  ```bash
  npm start
  ```

Once connected, you can type `/testwelcome` in any text channel on your server to preview the welcome card!

---

## 📁 File Structure

```text
Novyra-Welcome-Bot/
├── assets/
│   └── welcome.gif          # Server Welcome banner GIF
├── config.json              # Messages, guidelines, IDs, and button URLs
├── .env                     # Private Bot Token, Client ID, Guild ID (Ignored by Git)
├── .env.example             # Template for environment variables
├── .gitignore               # Excludes secrets & node_modules from Git
├── deploy-commands.js       # Slash command registration script
├── index.js                 # Main bot engine
├── register_commands.bat    # 1-Click command registrar for Windows
├── run.bat                  # 1-Click batch runner for Windows
└── package.json             # Dependencies and metadata
```

---

## ❓ Troubleshooting & FAQs

### 1. Welcome messages are not appearing when members join
- Ensure **Server Members Intent** is enabled in the [Discord Developer Portal](https://discord.com/developers/applications).
- Confirm that `welcomeChannelId` in `config.json` matches your channel ID.
- Check that the bot has `View Channel` and `Send Messages` permissions in that channel.

### 2. Auto-role is not being assigned
- Check server **Role Hierarchy**: The bot's role must be physically placed **ABOVE** the auto-role in Discord Server Settings ➡️ Roles.
- Verify that `autoRoleEnabled` is set to `true` and `autoRoleId` is valid.

### 3. Slash commands (`/testwelcome`) do not appear in Discord
- Run `node deploy-commands.js` or `register_commands.bat`.
- Ensure `GUILD_ID` and `CLIENT_ID` are properly filled out in your `.env` file.

---

## 🔒 Security Notice
- **Never commit your `.env` file or bot tokens to GitHub or public repositories.**
- Keep `.gitignore` intact to protect your server credentials.

---

## 👑 Credits
Developed for **Novyra Roleplay** by **Team Novyra**.
