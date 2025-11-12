# Setup Google Sheets MCP Server

**Purpose**: Automate the complete setup process for the Google Sheets MCP server so users can use it with Claude immediately.

**Setup Model**: Each user authenticates with their own Google account. **Instead of sharing the maintainer's token** (which gives Claude access to the maintainer's files), each user uses their own token tied to their Google account.

**Inputs**:
- `auto_configure` (default: true): Automatically configure Claude settings

**Execution Flow**:
1. Verify prerequisites (Node.js, npm)
2. Get OAuth credentials file from maintainer
3. Build the project
4. Authenticate with YOUR Google account
5. Configure Claude Code settings
6. Verify the setup works

---

## Step 1: Verify Prerequisites

Check that you have Node.js 18+ and npm installed:

```bash
node --version
npm --version
```

**Expected**: Both commands should return version numbers (node v18+, npm v9+)

**If missing**:
- Download Node.js from https://nodejs.org/ (LTS recommended)
- Restart terminal after installation

---

## Step 2: Get OAuth Credentials File

Contact the repository maintainer to get the OAuth credentials file.

**What you'll receive**: `google-sheets-mcp-credentials.json`

**What this is**: OAuth app credentials (Client ID + Client Secret) that allow the authentication flow to work. This file is safe to share among team members - it's like the "app registration" with Google.

**Where to save it**:
- **Windows**: `C:\Users\YourUsername\.google-sheets-mcp-credentials.json`
- **Mac/Linux**: `~/.google-sheets-mcp-credentials.json`

---

## Step 3: Build the Project

```bash
npm install
npm run build
```

**What happens**:
- Installs dependencies
- Compiles TypeScript to JavaScript
- Creates `dist/` directory with compiled code

---

## Step 4: Authenticate with YOUR Google Account

Run the authentication script to create YOUR OWN token:

```bash
node exchange-token.js
```

**What happens**:
1. Opens your browser to Google login
2. **Log in with YOUR Google account** (the account that has access to the sheets)
3. Approve access to Sheets/Drive
4. Token automatically saved to `~/.google-sheets-mcp-token.json`

**Why YOUR account?**
- The token is tied to YOUR Google account
- You can only access sheets YOU have permission to access
- The maintainer will add YOUR Google account to the necessary sheets
- If your token is compromised, only your access is affected (not everyone's)

**If browser doesn't open**:
- Copy the URL from terminal output
- Paste it in your browser manually

⚠️ **Important**: Make sure you log in with the Google account that the maintainer has added to the shared sheets!

---

## Step 5: Configure Claude Code Settings

Claude will automatically configure your Claude Code settings. Just tell Claude:

> "Configure my Claude Code settings to use the Google Sheets MCP server at: [paste the output from pwd]"

Claude will:
1. Read your current `~/.claude/settings.json`
2. Add the Google Sheets MCP server configuration
3. Update the settings file with the correct path
4. Verify the configuration is correct

**After Claude configures it**: Restart Claude Code to load the new settings.

---

## Step 6: Verify Setup Works

Ask Claude to test the connection:

> "Test the Google Sheets MCP connection. Can you tell me what tools are available?"

Or provide a Google Sheets URL you have access to:

> "List all the sheets in this spreadsheet: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit"

**Success**: Claude returns information about your spreadsheet.

**Failure**: Check troubleshooting section below.

---

## Troubleshooting

### "credentials.json not found"
- Make sure you saved the OAuth credentials file to the correct location:
  - **Windows**: `C:\Users\YourUsername\.google-sheets-mcp-credentials.json`
  - **Mac/Linux**: `~/.google-sheets-mcp-credentials.json`
- Contact the maintainer to get the credentials file

### "token.json not found"
- Run `node exchange-token.js` to authenticate with YOUR Google account
- Make sure you complete the OAuth flow in the browser

### "MCP server not found" in Claude Code
- Check the path in `~/.claude/settings.json` is correct (absolute path, not relative)
- Make sure `dist/index.js` exists: `ls dist/index.js`
- Restart Claude Code after editing settings

### "Permission denied" or "Access denied" when accessing sheets
- Ask the maintainer to add YOUR Google account (the one you authenticated with) to the specific sheet
- Verify you authenticated with the correct Google account (run `node exchange-token.js` again if needed)
- Check that the sheet URL is correct
- Make sure you have View or Edit permissions on the sheet

### "Cannot find module googleapis"
- Run `npm install` again
- Delete `node_modules/` and reinstall: `rm -rf node_modules && npm install`

### Token expired or invalid
- Run `node exchange-token.js` again to refresh YOUR token
- Your token may expire after extended periods of inactivity

---

## What Gets Created

During setup, these files will be in your **home directory** (not the repo):

- `~/.google-sheets-mcp-credentials.json` - OAuth app credentials (provided by maintainer)
- `~/.google-sheets-mcp-token.json` - YOUR authentication token (created when you authenticate)

**⚠️ Important**: Never commit these files to git. The token is tied to YOUR Google account and provides access only to sheets YOU have permission to access.

---

## What You Can Now Do

Once setup is complete, ask Claude to:

**Read from Sheets**:
- "Get metadata about this spreadsheet: [URL]"
- "List all tabs in this sheet: [URL]"
- "Read the data from the 'Results' tab in [URL]"

**Write to Sheets**:
- "Append these test results to my sheet: [URL]"
- "Update cells A1:C1 with these values: [URL]"
- "Create a new sheet called 'Archive' in [URL]"

---

## Need More Help?

If you get stuck:
1. Check the **Troubleshooting** section above
2. Try re-authenticating: `node exchange-token.js`
3. Contact the maintainer to verify your Google account has been added to the necessary sheets
4. Make sure the path in `~/.claude/settings.json` uses absolute path (not relative)
5. Restart Claude Code after any configuration changes

Good luck! 🚀
