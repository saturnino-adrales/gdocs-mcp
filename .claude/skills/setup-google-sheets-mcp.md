# Setup Google Sheets MCP Server

**Purpose**: Automate the complete setup process for the Google Sheets MCP server so users can use it with Claude immediately.

**Inputs**:
- `google_cloud_project_name` (optional): Name for the Google Cloud project
- `auto_configure` (default: true): Automatically configure Claude settings

**Execution Flow**:
1. Request tester access on GitHub
2. Verify prerequisites (Node.js, npm)
3. Get OAuth credentials file from maintainer
4. Build the project
5. Exchange OAuth token
6. Configure Claude Code settings
7. Verify the setup works

---

## Step 1: Request Tester Access (Required First!)

Before you can authenticate with Google, you need to be added as a tester on the Google Cloud Platform project.

### Why This Is Needed

This MCP server uses OAuth authentication that's currently in testing mode. Only authorized test users can authenticate. Without tester access, the OAuth flow will fail with "Access Denied" errors.

### How to Request Access

1. **Go to the GitHub repository**: [Open the Issues page](../../issues)
2. **Create a new issue** with:
   - **Title**: "Request GCP Tester Access"
   - **Body**:
     ```
     Please add me as a tester on the GCP project.

     My Google account email: your-email@gmail.com
     ```
3. **Wait for approval**: The repository maintainer will add you and notify you
4. **Check your email**: You'll receive a confirmation when you're added

⚠️ **Do not proceed** to the next steps until you've been added as a tester!

---

## Step 2: Verify Prerequisites

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

## Step 3: Get OAuth Credentials File

Once you've been added as a tester, you'll need the OAuth credentials file:

1. **Check if it's in the repo**: Some maintainers include it
2. **Ask the maintainer**: Request the `google-sheets-mcp-credentials.json` file
3. **Save it** to your home directory:
   - **Windows**: `C:\Users\YourUsername\.google-sheets-mcp-credentials.json`
   - **Mac/Linux**: `~/.google-sheets-mcp-credentials.json`

⚠️ **Security Note**: This file contains OAuth app credentials (not secrets) but should not be committed to public repos.

---

## Step 4: Build the Project

```bash
npm install
npm run build
```

**What happens**:
- Installs dependencies
- Compiles TypeScript to JavaScript
- Creates `dist/` directory with compiled code

---

## Step 5: Exchange OAuth Token

```bash
node exchange-token.js
```

**What happens**:
1. Opens your browser to Google login
2. You approve access to Sheets/Drive
3. Token automatically saved to `~/.google-sheets-mcp-token.json`
4. Ready to use!

**If browser doesn't open**:
- Copy the URL from terminal output
- Paste it in your browser manually

---

## Step 6: Configure Claude Code Settings

Claude will automatically configure your Claude Code settings. Just tell Claude:

> "Configure my Claude Code settings to use the Google Sheets MCP server at: [paste the output from pwd]"

Claude will:
1. Read your current `~/.claude/settings.json`
2. Add the Google Sheets MCP server configuration
3. Update the settings file with the correct path
4. Verify the configuration is correct

**After Claude configures it**: Restart Claude Code to load the new settings.

---

## Step 7: Verify Setup Works

Ask Claude to test the connection:

> "Test the Google Sheets MCP connection. Can you tell me what tools are available?"

Or provide a Google Sheets URL you have access to:

> "List all the sheets in this spreadsheet: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit"

**Success**: Claude returns information about your spreadsheet.

**Failure**: Check troubleshooting section below.

---

## Troubleshooting

### "Access Denied" or "Authorization Error" during OAuth
⚠️ **Most Common Issue**: You haven't been added as a tester yet!
- Go back to **Step 1** and request tester access on GitHub
- Wait for confirmation that you've been added to the GCP project
- Make sure you're using the same Google account email you provided

### "token.json not found"
- Run `node exchange-token.js` again
- Complete the OAuth flow in browser

### "MCP server not found" in Claude Code
- Check the path in `~/.claude/settings.json` is correct (absolute path, not relative)
- Make sure `dist/index.js` exists: `ls dist/index.js`
- Restart Claude Code after editing settings

### "Permission denied" accessing sheets
- Verify you're using the correct Google account
- Make sure you have access to the spreadsheet
- Re-authenticate: `node exchange-token.js`

### "Cannot find module googleapis"
- Run `npm install` again
- Delete `node_modules/` and reinstall: `rm -rf node_modules && npm install`

---

## What Gets Created

During setup, these files are created in your **home directory** (not the repo):

- `~/.google-sheets-mcp-credentials.json` - OAuth app credentials from Google Cloud
- `~/.google-sheets-mcp-token.json` - Your authentication token

**⚠️ Important**: Never commit these files to git - they contain sensitive auth info.

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
2. Run `node exchange-token.js` to refresh authentication
3. Make sure the path in `~/.claude/settings.json` uses absolute path (not relative)
4. Restart Claude Code after any configuration changes

Good luck! 🚀
