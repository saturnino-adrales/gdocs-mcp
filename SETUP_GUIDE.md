# Quick Setup Guide

## Overview

This guide will help you set up the Google Sheets MCP server so Claude can access your Google Sheets. The setup uses a **personal authentication model** where each user authenticates with their own Google account.

**Setup Time**: 5-10 minutes

**What You'll Need**:
- Node.js 18+ and npm
- A Google account with access to the sheets you want to use
- OAuth credentials file from the maintainer

---

## Step 1: Verify Prerequisites

Check that you have Node.js and npm installed:

```bash
node --version
npm --version
```

**Expected**: Node.js v18+ and npm v9+

**If missing**: Download from https://nodejs.org/ (LTS recommended) and restart your terminal

---

## Step 2: Get OAuth Credentials

Contact the repository maintainer to get the OAuth credentials file.

**What you'll receive**: `google-sheets-mcp-credentials.json`

**What this is**: OAuth app credentials that allow the authentication flow to work. This file is safe to share among team members.

**Where to save it**:

**Windows**:
```bash
# Save to your home directory
C:\Users\YourUsername\.google-sheets-mcp-credentials.json
```

**Mac/Linux**:
```bash
# Save to your home directory
~/.google-sheets-mcp-credentials.json
```

---

## Step 3: Build the Project

```bash
npm install
npm run build
```

**What this does**:
- Installs dependencies
- Compiles TypeScript to JavaScript
- Creates `dist/` directory with compiled code

---

## Step 4: Authenticate with Your Google Account

Run the authentication script:

```bash
node exchange-token.js
```

**What happens**:
1. Opens your browser to Google login
2. **Log in with YOUR Google account** (the one with access to the sheets)
3. Approve access to Sheets/Drive
4. Token automatically saved to `~/.google-sheets-mcp-token.json`

**Why your own account?**
- The token is tied to YOUR Google account
- You can only access sheets YOU have permission to access
- If your token is compromised, only your access is affected
- The maintainer will add your Google account to necessary sheets

**Troubleshooting**:
- If the browser doesn't open, copy the URL from terminal and paste in your browser
- Make sure you log in with the Google account that has access to the sheets

---

## Step 5: Configure Claude Code

Ask Claude to configure your settings:

```
"Configure my Claude Code settings to use the Google Sheets MCP server at: [paste output from pwd]"
```

Claude will:
1. Read your current `~/.claude/settings.json`
2. Add the Google Sheets MCP server configuration
3. Update with the correct absolute path
4. Verify the configuration

**After configuration**: Restart Claude Code to load the new settings

**Manual configuration** (if needed):

Edit `~/.claude/settings.json`:

**Windows**:
```json
{
  "mcpServers": {
    "google-sheets": {
      "command": "node",
      "args": [
        "C:\\Users\\YourUsername\\path\\to\\gdocs-mcp\\dist\\index.js"
      ]
    }
  }
}
```

**Mac/Linux**:
```json
{
  "mcpServers": {
    "google-sheets": {
      "command": "node",
      "args": [
        "/absolute/path/to/gdocs-mcp/dist/index.js"
      ]
    }
  }
}
```

**Important**:
- Use absolute paths, not relative paths
- Replace with your actual project directory path
- If you have other MCP servers, add "google-sheets" to your existing config

---

## Step 6: Test the Setup

Ask Claude to test the connection:

```
"Test the Google Sheets MCP connection. What tools are available?"
```

Or test with a real spreadsheet:

```
"List all the sheets in this spreadsheet: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit"
```

**Success**: Claude returns information about your spreadsheet

**If it doesn't work**: See troubleshooting section below

---

## Available Tools

Once setup is complete, Claude can use these tools:

### Read Operations
- `google_sheets_get_info` - Get spreadsheet metadata (title, sheets, size)
- `google_sheets_list_tabs` - List all tabs/sheets in a spreadsheet
- `google_sheets_get_tab_data` - Read cell data from a specific tab

### Write Operations
- `google_sheets_append_data` - Append rows to a sheet
- `google_sheets_update_cells` - Update specific cells
- `google_sheets_create_sheet` - Create new sheets/tabs

---

## Troubleshooting

### "credentials.json not found"
- Verify file exists: `ls ~/.google-sheets-mcp-credentials.json`
- Make sure you saved it to your home directory (not the project directory)
- Contact maintainer to get the credentials file

### "token.json not found"
- Run `node exchange-token.js` to authenticate
- Make sure you complete the OAuth flow in the browser

### "MCP server not found" in Claude Code
- Check path in `~/.claude/settings.json` is absolute, not relative
- Verify `dist/index.js` exists: `ls dist/index.js`
- Restart Claude Code after editing settings

### "Permission denied" when accessing sheets
- Ask maintainer to add YOUR Google account to the sheet
- Verify you authenticated with the correct Google account
- Run `node exchange-token.js` again if needed

### "Cannot find module googleapis"
- Run `npm install` again
- Try deleting and reinstalling: `rm -rf node_modules && npm install`

### Token expired
- Run `node exchange-token.js` to refresh your token
- Tokens may expire after extended inactivity

---

## Security Notes

**Files Created** (in your home directory, NOT in the repo):
- `~/.google-sheets-mcp-credentials.json` - OAuth app credentials (from maintainer)
- `~/.google-sheets-mcp-token.json` - YOUR authentication token

**Important**:
- Never commit these files to git
- The token is tied to YOUR Google account
- You can only access sheets YOU have permission to access
- Read-only access by default (unless you modify scopes)

**Revoke Access**: Visit https://myaccount.google.com/permissions to revoke access anytime

---

## What You Can Do Now

Ask Claude to work with your sheets:

**Read Operations**:
```
"Get metadata about this spreadsheet: [URL]"
"List all tabs in this sheet: [URL]"
"Read data from the 'Results' tab in [URL]"
"Show me rows 1-10 from [URL]"
```

**Write Operations**:
```
"Append these test results to my sheet: [URL]"
"Update cells A1:C1 with these headers: [URL]"
"Create a new sheet called 'Archive' in [URL]"
```

---

## Need More Help?

1. Check the troubleshooting section above
2. Try re-authenticating: `node exchange-token.js`
3. Verify your Google account has been added to the sheets
4. Ensure `~/.claude/settings.json` uses absolute paths
5. Restart Claude Code after configuration changes
6. Review the main [README.md](./README.md) for detailed documentation

**Having issues?** Ask Claude: "I'm having trouble with the Google Sheets MCP setup" and share the error message.

---

## Quick Reference

**Get your project path**:
```bash
cd gdocs-mcp
pwd  # Copy this path
```

**Verify setup**:
```bash
# Check credentials exist
ls ~/.google-sheets-mcp-credentials.json

# Check token exists
ls ~/.google-sheets-mcp-token.json

# Check build succeeded
ls dist/index.js

# Check Claude settings
cat ~/.claude/settings.json
```

**Re-authenticate**:
```bash
node exchange-token.js
```

**Rebuild after changes**:
```bash
npm run build
```

---

Good luck! 🚀
