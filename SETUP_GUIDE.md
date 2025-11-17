# Setup Guide

## Overview

This guide will help you set up the Google Sheets MCP server. You'll authenticate with your own Google account and can only access sheets that are shared with you.

**Setup Time**: 5-10 minutes

**What You'll Need**:
- Node.js 18+ and npm
- A Google account (the one you'll use to access sheets)
- OAuth credentials file (provided by your administrator)
- Your Google account email must be added as a test user in GCP (ask your administrator)

---

## Prerequisites

### Step 1: Verify Node.js Installation

Check that you have Node.js and npm installed:

```bash
node --version
npm --version
```

**Expected**: Node.js v18+ and npm v9+

**If missing**: Download from https://nodejs.org/ (LTS recommended) and restart your terminal

### Step 2: Get Access from Administrator

**Your administrator must complete these steps BEFORE you can authenticate**:

✅ Created OAuth 2.0 credentials in Google Cloud Platform (GCP)
✅ Added YOUR Google email as a test user in GCP OAuth consent screen
✅ Shared specific Google Sheets with YOUR Google account
✅ Provided you with the `google-sheets-mcp-credentials.json` file

**Don't have access yet?** Contact your administrator to complete these steps.

---

## Setup Steps

### Step 1: Get OAuth Credentials

Receive the OAuth credentials file from your administrator.

**What you'll receive**: `google-sheets-mcp-credentials.json`

**What this is**: OAuth app credentials that enable the authentication flow. This file is shared among all users.

**Important**: This is NOT your personal token - it's shared credentials for the OAuth app.

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

### Step 2: Build the Project

Clone the repository (if you haven't already) and build:

```bash
# Clone the repository
git clone <repository-url>
cd gdocs-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

**What this does**:
- Installs all required dependencies
- Compiles TypeScript to JavaScript
- Creates `dist/` directory with compiled code

---

### Step 3: Authenticate with YOUR Google Account

Run the authentication script:

```bash
node exchange-token.js
```

**What happens**:
1. Opens your browser to Google login page
2. **IMPORTANT**: Log in with YOUR Google account (the one your manager added as a test user)
3. Review and approve access to Google Sheets
4. Your personal token is automatically saved to `~/.google-sheets-mcp-token.json`

**Critical Points**:
- ✅ Use the Google account email your manager added as a GCP test user
- ✅ This creates YOUR personal authentication token
- ✅ You can only access sheets shared with YOUR Google account
- ✅ Your token is private and should never be shared with others

**Authentication Failed?**
- Verify your administrator added your Google account email as a test user in GCP
- Ensure you're logging in with the correct Google account
- If the browser doesn't open, copy the URL from terminal and paste manually
- Contact your administrator if you see "access_denied" errors

---

### Step 4: Configure Claude Code

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

### Step 5: Test the Setup

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
- Verify file exists: `ls ~/.google-sheets-mcp-credentials.json` (Mac/Linux) or check `C:\Users\YourUsername\.google-sheets-mcp-credentials.json` (Windows)
- Make sure you saved it to your home directory (not the project directory)
- Contact your administrator to get the credentials file

### "token.json not found" or "Authentication required"
- Run `node exchange-token.js` to authenticate with YOUR Google account
- Make sure you complete the OAuth flow in the browser
- Verify you're logging in with the Google account your administrator added as a test user

### "Access denied" or "Error 403: access_denied"
- **Most common issue**: Your Google account email was NOT added as a test user in GCP
- Contact your administrator to add YOUR Google account email as a test user
- Ensure your administrator added the EXACT email address you're using to authenticate
- After being added, run `node exchange-token.js` again

### "MCP server not found" in Claude Code
- Check path in `~/.claude/settings.json` uses absolute path, not relative
- Verify `dist/index.js` exists: `ls dist/index.js`
- Restart Claude Code after editing settings.json

### "Permission denied" when accessing specific sheets
- Ask your administrator to share the specific Google Sheet with YOUR Google account
- Verify the sheet URL is correct
- Make sure you authenticated with the correct Google account (check which account you used in the OAuth flow)
- Run `node exchange-token.js` again if you're unsure which account you used

### "Cannot find module googleapis"
- Run `npm install` in the project directory
- Try deleting and reinstalling: `rm -rf node_modules && npm install`

### "Token expired" error
- Run `node exchange-token.js` to refresh your personal token
- Tokens may expire after extended inactivity (typically 7 days)
- Your refreshed token will be saved automatically

---

## Security Notes

**Files in Your Home Directory** (NOT in the repo):
- `~/.google-sheets-mcp-credentials.json` - OAuth app credentials (shared among team, provided by manager)
- `~/.google-sheets-mcp-token.json` - YOUR personal authentication token (NEVER share this)

**Critical Security Points**:
- ✅ The credentials file can be shared among team members (it's just the OAuth app config)
- ❌ Your token file should NEVER be shared with anyone (it grants access as YOU)
- ✅ You can only access sheets that are shared with YOUR Google account
- ✅ All operations in Google Sheets will show YOUR name in the audit log
- ✅ If your token is compromised, only YOUR access is affected

**Access Control**:
- Administrator controls who can authenticate by adding/removing test users in GCP
- Administrator controls what sheets you can access by sharing/unsharing with your Google account
- You control when to revoke access at https://myaccount.google.com/permissions

**File Safety**:
- Both files are in `.gitignore` and should never be committed to git
- Both files are stored in your home directory, separate from the code repository

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
