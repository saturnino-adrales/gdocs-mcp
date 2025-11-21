# Google Sheets MCP Server

Welcome! This is an MCP (Model Context Protocol) server that gives Claude read/write access to Google Sheets.

## Quick Start

Ask Claude to help with setup:

```
"Help me set up the Google Sheets MCP server"
```

Claude will guide you through:
1. ✅ Checking prerequisites (Node.js, npm)
2. 📥 Getting OAuth credentials from maintainer
3. 🔨 Building the project
4. 🔑 Authenticating with YOUR Google account (automatically configures Claude Code)
5. ✨ Verifying it works

## What This Does

Once set up, Claude can:
- **Read** spreadsheet metadata, sheet names, and cell data
- **Write** append rows, update cells, create sheets
- All through natural conversation

Example:
> "Can you add these test results to row 5 of my Sheet? https://docs.google.com/spreadsheets/d/..."

## Prerequisites

- Node.js 18+ (check with `node --version`)
- npm (check with `npm --version`)
- A Google account with access to the Google Sheets you need to work with
- OAuth credentials file (provided by maintainer)

## How It Works

**Instead of sharing the maintainer's token** (which gives Claude access to the maintainer's files), each user authenticates with their own Google account:

1. **Shared OAuth App**: The maintainer provides OAuth credentials (the "app registration")
2. **Individual Authentication**: You authenticate once with YOUR Google account
3. **Your Token**: A token is created tied to YOUR Google account
4. **Auto-Configuration**: The setup automatically configures Claude Code's global settings
5. **MCP Integration**: Claude uses YOUR token to access Google Sheets APIs
6. **Your Permissions**: You can only access sheets that YOUR Google account has permission to access

**Security Benefits:**
- Each user has their own token that can be revoked independently
- Google audit logs show which user made changes
- No shared credentials that could compromise everyone

---

## How Claude Helps

When you ask Claude for help, it reads the detailed setup guide and:
- Walks you through each step interactively
- Helps troubleshoot any issues
- Verifies everything works
- Answers questions about how it all works

See the full setup documentation:
@skills/setup-google-sheets-mcp.md

---

## Already Set Up?

If you've already configured this, you're ready to use the tools. Try asking Claude:

> "What are my available Google Sheets tools?"

Or test with a real spreadsheet:

> "List all the sheets in this spreadsheet: [your-sheet-url]"

---

## File Structure

```
.claude/
  ├── CLAUDE.md (this file)
  └── skills/
      └── setup-google-sheets-mcp.md (setup automation)

src/
  └── index.ts (MCP server code)

dist/
  └── index.js (compiled server - created during build)
```

---

## Important Notes

### Auth Files (Not in Repo)
These files should be in your home directory:
- `~/.google-sheets-mcp-credentials.json` - OAuth app credentials (provided by maintainer, safe to share)
- `~/.google-sheets-mcp-token.json` - YOUR authentication token (created when you authenticate)

⚠️ **Security**: Never commit these files to git. The token is tied to YOUR Google account and provides access to sheets you have permission to access.

### Configuration Files
When you run `npm run auth`, your global Claude settings are automatically updated at `~/.claude/settings.json` with:
```json
{
  "mcpServers": {
    "google-sheets": {
      "command": "node",
      "args": ["/absolute/path/to/this/project/dist/index.js"]
    }
  }
}
```

**Note**: The setup script automatically determines the absolute path, so you don't need to configure this manually!

---

## Troubleshooting

**Having issues during setup?**
- Ask Claude: "I'm having trouble setting up the Google Sheets MCP server"
- Share the error message and which step you're stuck on

**After setup - Claude can't find the MCP server?**
- Check `~/.claude/settings.json` has correct absolute path
- Make sure `dist/index.js` exists
- Restart Claude Code

For other issues, ask Claude about the problem and it will help you troubleshoot.

---

**Ready to set up?** Ask Claude: "Help me set up the Google Sheets MCP server" 🚀
