# Google Sheets MCP Server

Welcome! This is an MCP (Model Context Protocol) server that gives Claude read/write access to Google Sheets.

## Quick Start

Ask Claude to help with setup:

```
"Help me set up the Google Sheets MCP server"
```

Claude will guide you through:
1. 📝 Requesting tester access on GitHub
2. ✅ Checking prerequisites (Node.js, npm)
3. 🔨 Building the project
4. 🔑 Getting an authentication token
5. ⚙️ Configuring Claude Code
6. ✨ Verifying it works

## What This Does

Once set up, Claude can:
- **Read** spreadsheet metadata, sheet names, and cell data
- **Write** append rows, update cells, create sheets
- All through natural conversation

Example:
> "Can you add these test results to row 5 of my Sheet? https://docs.google.com/spreadsheets/d/..."

## Prerequisites

### 1. Request Tester Access (Required First!)

Before setting up, you need to be added as a tester on the Google Cloud Platform project:

1. **Open an issue** on this GitHub repository
2. **Request**: "Please add me as a tester on the GCP project"
3. **Provide**: Your Google account email address
4. **Wait for approval** - You'll be notified when you're added

⚠️ **Important**: Without tester access, the OAuth authentication will fail.

### 2. Technical Requirements

- Node.js 18+ (check with `node --version`)
- npm (check with `npm --version`)

## How It Works

1. **OAuth Setup**: You authenticate once with Google
2. **Token Storage**: Token saved locally in `~/.google-sheets-mcp-token.json`
3. **MCP Integration**: Claude can use Google Sheets APIs
4. **Per-Request Auth**: Each API call uses your stored token

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
These files are created in your home directory during setup:
- `~/.google-sheets-mcp-credentials.json` - OAuth credentials
- `~/.google-sheets-mcp-token.json` - Auth token

Never commit these to git - they contain sensitive info.

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
