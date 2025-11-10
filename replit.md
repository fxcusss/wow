# Discord License Management Bot

## Overview
A professional Discord bot-based license management system for tweaking utilities. Features both Discord slash commands and a secure web dashboard for comprehensive license administration.

**Status**: Production-ready  
**Last Updated**: November 10, 2025

## Recent Changes
- Added professional web dashboard with dark theme design
- Implemented secure admin authentication with SESSION_SECRET and ADMIN_PASSWORD
- Added search functionality for license lookup
- Enhanced security: XSS protection, CSRF mitigation, secure session management
- Removed all emojis for professional appearance
- Redesigned UI with enterprise-grade dark theme

## Project Architecture

### Technology Stack
- **Runtime**: Node.js 20
- **Bot Framework**: Discord.js v14
- **Web Framework**: Express.js with express-session
- **Database**: PostgreSQL (Neon-backed)
- **Package Manager**: npm

### Directory Structure
```
├── src/
│   ├── index.js              # Main entry point (bot + web server)
│   ├── server.js             # Express web server
│   ├── database.js           # Database connection and queries
│   ├── commands/
│   │   ├── activate.js       # /activate command
│   │   ├── licenses.js       # /licenses command (admin)
│   │   └── revoke.js         # /revoke command (admin)
│   └── utils/
│       ├── keyGenerator.js   # License key generation
│       └── colors.js         # Discord color scheme
├── public/
│   ├── index.html            # Dashboard HTML
│   ├── styles.css            # Professional dark theme CSS
│   └── script.js             # Dashboard JavaScript
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

#### Discord Bot
1. **License Activation** - Users activate once per account via `/activate`
2. **Automatic Roles** - "Licensed User" role assigned on activation
3. **Admin Controls** - View and revoke licenses via Discord commands
4. **DM Notifications** - Keys sent securely via direct message
5. **Pagination** - License list supports pagination for large datasets

#### Web Dashboard
1. **Secure Authentication** - Admin password-protected access
2. **Real-time Statistics** - Total, active, and revoked license counts
3. **Search Functionality** - Filter licenses by username, key, or user ID
4. **Pagination** - Navigate through large license datasets
5. **Revoke Management** - Revoke licenses directly from web interface
6. **Professional Dark Theme** - Enterprise-grade UI design

## Setup Requirements

### Required Secrets
- `DISCORD_BOT_TOKEN` - Bot token from Discord Developer Portal
- `ADMIN_PASSWORD` - Password for web dashboard access (user-created)
- `SESSION_SECRET` - Secret for session management (user-created)
- `DATABASE_URL` - PostgreSQL connection string (auto-configured)

### Discord Bot Configuration
1. **Privileged Gateway Intents** must be enabled:
   - Server Members Intent (required)
2. **Bot Permissions**:
   - Manage Roles
   - Send Messages
   - Use Slash Commands

### Role Hierarchy
The bot's role must be positioned higher than "Licensed User" role in Discord server settings for automatic role assignment to work.

## User Preferences
- Professional, minimal design without emojis
- Dark theme for all interfaces
- Corporate/enterprise appearance

## Commands Reference

### Discord User Commands
- `/activate` - Generate and activate a license key

### Discord Admin Commands
- `/licenses [page]` - View all licenses with pagination
- `/revoke <user>` - Revoke a user's license and remove their role

### Web Dashboard
- Login with admin password
- View statistics dashboard
- Search and filter licenses
- Revoke licenses with one click
- Paginate through license registry

## Security Features
- Required secrets (no hardcoded fallbacks)
- Session management with httpOnly and sameSite cookies
- XSS protection via HTML escaping
- CSRF mitigation via sameSite policy
- Secure password-based authentication
- One license per user enforced by database constraints

## Design System

### Color Palette (Professional Dark Theme)
- **Background**: #0a0b0d (Deep black)
- **Surface**: #18191f (Dark gray)
- **Border**: #2a2d35 (Subtle borders)
- **Text Primary**: #e4e6eb (Light gray)
- **Text Secondary**: #8b8d94 (Muted gray)
- **Accent Blue**: #3b82f6
- **Success Green**: #10b981
- **Error Red**: #ef4444

### Typography
- Clean, minimal sans-serif fonts
- Uppercase labels with letter spacing
- Proper font weights and hierarchy

## Access
- **Discord Bot**: Active in Discord server
- **Web Dashboard**: Port 5000 (accessible via Replit URL)

## Notes
- License keys generated with format: XXXXX-XXXXX-XXXXX-XXXXX
- One license per Discord user enforced by database constraints
- Slash commands auto-register when bot joins a server
- Web server and Discord bot run simultaneously
- Professional appearance suitable for commercial use
