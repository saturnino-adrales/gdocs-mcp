# Setup Google Sheets MCP Server

**Purpose**: Automate the complete setup process for the Google Sheets MCP server so users can use it with Claude immediately.

**Inputs**:
- `google_cloud_project_name` (optional): Name for the Google Cloud project
- `auto_configure` (default: true): Automatically configure Claude settings

**Execution Flow**:
1. Verify prerequisites (Node.js, npm)
2. Guide OAuth credential setup in Google Cloud
3. Build the project
4. Exchange OAuth token
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

## Step 2: Get Google OAuth Credentials

This is a one-time manual step in Google Cloud Console:

### 2a. Create/Select Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Note the project ID (you'll need it)

### 2b. Enable Required APIs
1. Go to "APIs & Services" → "Library"
2. Search for and enable:
   - **Google Sheets API**
   - **Google Drive API**

### 2c. Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Choose "Desktop application"
4. Click "Create"
5. Download the JSON file
6. Save it as: `~/.google-sheets-mcp-credentials.json`

**Location by OS**:
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

## Step 4: Exchange OAuth Token

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

## Step 5: Configure Claude Code Settings

### 5a. Find Your Project Path

The MCP server needs the full path to this project. Run:

```bash
pwd
```

**Copy the output** - you'll need it in Step 5b.

### 5b. Update Claude Settings

Edit `~/.claude/settings.json` and add:

```json
{
  "mcpServers": {
    "google-sheets": {
      "command": "node",
      "args": ["<PASTE_PATH_FROM_5a>/dist/index.js"]
    }
  }
}
```

**Example (Windows)**:
```json
{
  "mcpServers": {
    "google-sheets": {
      "command": "node",
      "args": ["C:\\Users\\jonaz\\gdocs-mcp\\dist\\index.js"]
    }
  }
}
```

**Example (Mac/Linux)**:
```json
{
  "mcpServers": {
    "google-sheets": {
      "command": "node",
      "args": ["/Users/yourname/projects/google-sheets-mcp-server/dist/index.js"]
    }
  }
}
```

**After editing**: Restart Claude Code to load the new settings.

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
- Make sure you saved Google OAuth JSON to `~/.google-sheets-mcp-credentials.json`
- Check the file exists: `ls ~/.google-sheets-mcp-credentials.json`

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
