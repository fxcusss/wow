# Discord License Management Bot

A Discord bot-based license management system for tweaking utilities that generates unique license keys through slash commands and manages user access through role-based restrictions.

## Features

- **`/activate`** - Generate a unique license key and get automatic role assignment
  - Sends license key via DM for security
  - Automatically assigns "Licensed User" role
  - One activation per user to prevent abuse
  - Beautiful Discord-styled embeds

- **`/licenses`** - View all licenses in the database (Admin only)
  - Paginated list of all licenses
  - Shows status, activation date, and user info
  - Track active and revoked licenses

- **`/revoke`** - Revoke a user's license (Admin only)
  - Deactivate specific licenses
  - Automatically removes "Licensed User" role
  - Tracks who revoked the license and when

## Setup Instructions

### Prerequisites

1. **Create a Discord Bot**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application
   - Go to the "Bot" section and create a bot
   - Enable these **Privileged Gateway Intents**:
     - Server Members Intent
     - Message Content Intent (optional, not required for slash commands)
   - Copy your bot token

2. **Invite the Bot to Your Server**
   - Go to OAuth2 → URL Generator
   - Select scopes: `bot` and `applications.commands`
   - Select permissions:
     - Manage Roles
     - Send Messages
     - Use Slash Commands
   - Copy the generated URL and invite the bot to your server

### Installation

1. **Set up your Discord Bot Token**
   - Click on the "Secrets" tab (🔒 icon) in Replit
   - Add a new secret:
     - Key: `DISCORD_BOT_TOKEN`
     - Value: Your bot token from Discord Developer Portal

2. **The bot will automatically:**
   - Install dependencies
   - Initialize the PostgreSQL database
   - Register slash commands
   - Start running

3. **Run the bot**
   - Click the "Run" button
   - The bot should log in and be ready to use!

## Usage

### For Users

1. Join the Discord server where the bot is installed
2. Type `/activate` to get your license
3. Check your DMs for your unique license key
4. You'll automatically receive the "Licensed User" role

### For Administrators

1. Use `/licenses` to view all licenses (with pagination)
   - Example: `/licenses page:1`
2. Use `/revoke user:@username` to revoke a user's license
   - This removes their role and marks the license as revoked

## Color Scheme

The bot uses Discord's official color palette:

- **Primary (Blurple)**: #5865F2 - Main bot color
- **Success (Green)**: #57F287 - Successful activations
- **Warning (Yellow)**: #FEE75C - Warnings and alerts
- **Error (Red)**: #ED4245 - Errors and revocations
- **Background (Dark)**: #2C2F33 - Discord dark theme

## Database Schema

The bot uses PostgreSQL with the following schema:

```sql
licenses (
  id SERIAL PRIMARY KEY,
  license_key VARCHAR(255) UNIQUE NOT NULL,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP,
  revoked_by VARCHAR(255)
)
```

## Security Features

- One license per user (enforced by unique user_id constraint)
- License keys sent via DM to prevent public exposure
- Admin-only commands for license management
- Role-based access control
- Secure database storage with PostgreSQL

## Troubleshooting

**Bot doesn't respond to commands:**
- Make sure the bot has the required permissions in your server
- Check that slash commands are registered (they appear when you type `/`)
- Verify the bot token is correct in Secrets

**Can't send DMs:**
- Users must have DMs enabled from server members
- The bot will still create the license and show it in the command response if DMs fail

**Role assignment fails:**
- Ensure the bot's role is higher than the "Licensed User" role in server settings
- Check that the bot has "Manage Roles" permission

## Support

For issues or questions, contact your server administrator.
