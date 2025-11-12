# Setup Google Sheets MCP Server

**Purpose**: Automate the complete setup process for the Google Sheets MCP server so users can use it with Claude immediately.

**Setup Model**: Shared workspace - all users access the same Google Sheets using a shared authentication token.

**Inputs**:
- `auto_configure` (default: true): Automatically configure Claude settings

**Execution Flow**:
1. Verify prerequisites (Node.js, npm)
2. Build the project
3. Get shared authentication token from maintainer
4. Configure Claude Code settings
5. Verify the setup works

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

## Step 2: Build the Project

```bash
npm install
npm run build
```

**What happens**:
- Installs dependencies
- Compiles TypeScript to JavaScript
- Creates `dist/` directory with compiled code

---

## Step 3: Get Shared Authentication Token

Contact the repository maintainer to get the shared authentication token file.

**What you'll receive**: `google-sheets-mcp-token.json`

**Where to save it**:
- **Windows**: `C:\Users\YourUsername\.google-sheets-mcp-token.json`
- **Mac/Linux**: `~/.google-sheets-mcp-token.json`

⚠️ **Important**: This token provides access to the shared Google Sheets. Keep it secure and never commit it to git.

**Sheet Access**: The maintainer will also add your Google account to the specific sheets you need to access (View or Edit permissions as needed).

---

## Step 4: Configure Claude Code Settings

Claude will automatically configure your Claude Code settings. Just tell Claude:

> "Configure my Claude Code settings to use the Google Sheets MCP server at: [paste the output from pwd]"

Claude will:
1. Read your current `~/.claude/settings.json`
2. Add the Google Sheets MCP server configuration
3. Update the settings file with the correct path
4. Verify the configuration is correct

**After Claude configures it**: Restart Claude Code to load the new settings.

---

## Step 5: Verify Setup Works

Ask Claude to test the connection:

> "Test the Google Sheets MCP connection. Can you tell me what tools are available?"

Or provide a Google Sheets URL you have access to:

> "List all the sheets in this spreadsheet: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit"

**Success**: Claude returns information about your spreadsheet.

**Failure**: Check troubleshooting section below.

---

## Troubleshooting

### "token.json not found"
- Make sure you saved the shared token file to the correct location:
  - **Windows**: `C:\Users\YourUsername\.google-sheets-mcp-token.json`
  - **Mac/Linux**: `~/.google-sheets-mcp-token.json`
- Contact the maintainer to get a fresh copy of the token file

### "MCP server not found" in Claude Code
- Check the path in `~/.claude/settings.json` is correct (absolute path, not relative)
- Make sure `dist/index.js` exists: `ls dist/index.js`
- Restart Claude Code after editing settings

### "Permission denied" or "Access denied" when accessing sheets
- Ask the maintainer to add your Google account to the specific sheet
- Make sure you're using the correct Google account that was added to the sheet
- Check that the sheet URL is correct

### "Cannot find module googleapis"
- Run `npm install` again
- Delete `node_modules/` and reinstall: `rm -rf node_modules && npm install`

### Token expired or invalid
- Contact the maintainer to get a refreshed token file
- The token may need to be regenerated periodically

---

## What Gets Created

During setup, this file should be in your **home directory** (not the repo):

- `~/.google-sheets-mcp-token.json` - Shared authentication token (provided by maintainer)

**⚠️ Important**: Never commit this file to git - it provides access to the shared Google Sheets workspace.

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
2. Contact the maintainer if you need a fresh token file
3. Make sure the path in `~/.claude/settings.json` uses absolute path (not relative)
4. Restart Claude Code after any configuration changes

Good luck! 🚀
