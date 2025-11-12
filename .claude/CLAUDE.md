# Google Sheets MCP Server

Welcome! This is an MCP (Model Context Protocol) server that gives Claude read/write access to Google Sheets.

## Quick Start

Ask Claude to help with setup:

```
"Help me set up the Google Sheets MCP server"
```

Claude will guide you through:
1. ✅ Checking prerequisites (Node.js, npm)
2. 🔨 Building the project
3. 🔑 Getting the shared authentication token
4. ⚙️ Configuring Claude Code
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
- Access to the shared Google Sheets token file (provided by maintainer)

## How It Works

This is a **shared workspace** setup:

1. **Maintainer Authentication**: The repository maintainer has authenticated once with Google
2. **Shared Token**: You'll receive the authentication token file to access the shared Google Sheets
3. **MCP Integration**: Claude uses the shared token to access Google Sheets APIs
4. **Sheet Permissions**: You'll be added to the specific Google Sheets you need to access

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
- `~/.google-sheets-mcp-token.json` - Shared authentication token (provided by maintainer)

⚠️ **Security**: Never commit this token to git - it provides access to the shared Google Sheets.

### Configuration Files
Your Claude settings are updated at `~/.claude/settings.json` with:
```json
{
  "mcpServers": {
    "google-sheets": {
      "command": "node",
      "args": ["/path/to/this/project/dist/index.js"]
    }
  }
}
```

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
