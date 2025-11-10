# Discord License Management Bot

## Overview
A Discord bot-based license management system for tweaking utilities. The bot generates unique license keys through slash commands and manages user access through role-based restrictions.

**Status**: Core features implemented, ready for testing  
**Last Updated**: November 10, 2025

## Recent Changes
- Initial project setup with Node.js and Discord.js
- Created PostgreSQL database schema for license tracking
- Implemented `/activate`, `/licenses`, and `/revoke` slash commands
- Added Discord-styled embeds with official color scheme
- Configured automatic role assignment for licensed users
- Added comprehensive error handling and DM notifications

## Project Architecture

### Technology Stack
- **Runtime**: Node.js 20
- **Bot Framework**: Discord.js v14
- **Database**: PostgreSQL (Neon-backed)
- **Package Manager**: npm

### Directory Structure
```
├── src/
│   ├── index.js              # Main bot entry point
│   ├── database.js           # Database connection and queries
│   ├── commands/
│   │   ├── activate.js       # /activate command
│   │   ├── licenses.js       # /licenses command (admin)
│   │   └── revoke.js         # /revoke command (admin)
│   └── utils/
│       ├── keyGenerator.js   # License key generation
│       └── colors.js         # Discord color scheme
├── package.json
├── README.md
└── .env.example
```

### Database Schema
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

### Key Features
1. **License Activation** - Users can activate once per account
2. **Automatic Roles** - "Licensed User" role assigned on activation
3. **Admin Controls** - View and revoke licenses
4. **DM Notifications** - Keys sent securely via direct message
5. **Pagination** - License list supports pagination for large datasets

## Setup Requirements

### Required Secrets
- `DISCORD_BOT_TOKEN` - Bot token from Discord Developer Portal
- `DATABASE_URL` - PostgreSQL connection string (auto-configured)

### Discord Bot Configuration
1. Server Members Intent must be enabled
2. Bot needs these permissions:
   - Manage Roles
   - Send Messages
   - Use Slash Commands

### Role Hierarchy
The bot's role must be positioned higher than "Licensed User" role in Discord server settings for automatic role assignment to work.

## User Preferences
None specified yet.

## Commands Reference

### User Commands
- `/activate` - Generate and activate a license key

### Admin Commands
- `/licenses [page]` - View all licenses with pagination
- `/revoke <user>` - Revoke a user's license and remove their role

## Color Scheme
- Primary (Blurple): #5865F2
- Success (Green): #57F287  
- Warning (Yellow): #FEE75C
- Error (Red): #ED4245
- Background (Dark): #2C2F33

## Notes
- License keys are generated with format: XXXXX-XXXXX-XXXXX-XXXXX
- One license per Discord user enforced by database constraints
- Slash commands auto-register when bot joins a server
