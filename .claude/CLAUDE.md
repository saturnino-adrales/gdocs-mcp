# Google Sheets MCP Server

Welcome! This is an MCP (Model Context Protocol) server that gives Claude read/write access to Google Sheets.

## Quick Start (30 seconds)

Run this to get started:

```bash
/setup-google-sheets-mcp
```

This skill will guide you through:
1. ✅ Checking prerequisites (Node.js, npm)
2. 🔐 Setting up OAuth credentials in Google Cloud
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

- Node.js 18+ (check with `node --version`)
- npm (check with `npm --version`)
- A Google Cloud project (free tier works)

## How It Works

1. **OAuth Setup**: You authenticate once with Google
2. **Token Storage**: Token saved locally in `~/.google-sheets-mcp-token.json`
3. **MCP Integration**: Claude can use Google Sheets APIs
4. **Per-Request Auth**: Each API call uses your stored token

---

## Manual Setup (If You Prefer)

If you want to walk through setup step-by-step, see:
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

**The skill won't run?**
- Make sure you're in this project directory
- Try: `npm install && npm run build`

**Claude can't find the MCP server?**
- Check `~/.claude/settings.json` has correct absolute path
- Make sure `dist/index.js` exists
- Restart Claude Code

**Auth failing?**
- Run `node exchange-token.js` to get fresh token
- Make sure Google Cloud OAuth credentials are saved to `~/.google-sheets-mcp-credentials.json`

Need more help? Check the full skill documentation:
@skills/setup-google-sheets-mcp.md

---

**Ready to set up?** Run `/setup-google-sheets-mcp` 🚀
