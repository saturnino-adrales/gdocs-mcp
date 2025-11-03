# Quick Setup Guide

## ✅ Step-by-Step Setup (5-10 minutes)

### Step 1: Google Cloud OAuth Credentials

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**

2. **Create a New Project**:
   - Click "Select a project" → "New Project"
   - Name: "MCP Sheets Access" (or anything you like)
   - Click "Create"

3. **Enable Google Sheets API**:
   - Go to "APIs & Services" → "Library"
   - Search: "Google Sheets API"
   - Click it → Press "Enable"

4. **Configure OAuth Consent Screen**:
   - Go to "APIs & Services" → "OAuth consent screen"
   - User Type: Choose "External"
   - App name: "MCP Sheets Client"
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: Click "Add or Remove Scopes"
     - Search for: `https://www.googleapis.com/auth/spreadsheets.readonly`
     - Check the box next to it
     - Click "Update"
   - Test users: Click "Add Users" → Add your email
   - Click "Save and Continue" through remaining steps

5. **Create OAuth Client ID**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Desktop app**
   - Name: "MCP Sheets Desktop Client"
   - Click "Create"
   - **Download the JSON** (click download icon ⬇️)

6. **Save Credentials File**:
   ```bash
   # Rename and move downloaded file
   mv ~/Downloads/client_secret_*.json ~/.google-sheets-mcp-credentials.json
   ```

### Step 2: Configure Claude Desktop

Edit your Claude config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

Add this configuration:

```json
{
  "mcpServers": {
    "google-sheets": {
      "command": "node",
      "args": [
        "/Users/adralessaturino/ai_projects/mcps/gdocs/dist/index.js"
      ]
    }
  }
}
```

**Important**: If you already have other MCP servers, add the "google-sheets" entry to your existing config.

### Step 3: Restart Claude Desktop

Completely quit and restart Claude Desktop for changes to take effect.

### Step 4: First Authorization

The first time you use a Google Sheets tool in Claude:

1. Claude will show an error with an authorization URL
2. **Copy the URL** and open it in your browser
3. Sign in with your Google account
4. Click "Allow" to grant read access
5. You'll see a success message
6. The token is automatically saved to `~/.google-sheets-mcp-token.json`
7. Try the command again in Claude - it should work now!

## 🧪 Test It Out

In Claude Desktop, try:

```
"List the tabs in this spreadsheet: https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit"
```

Replace `YOUR_SPREADSHEET_ID` with an actual spreadsheet you have access to.

## 🔧 Troubleshooting

### "Credentials file not found"

Make sure the file exists:
```bash
ls -la ~/.google-sheets-mcp-credentials.json
```

If not, re-download from Google Cloud Console and save to that exact path.

### "Authorization URL not showing in Claude"

1. Check Claude's MCP logs:
   - macOS: `~/Library/Logs/Claude/mcp*.log`
2. Ensure the path in config is correct (absolute path to `dist/index.js`)
3. Try running manually to see the auth URL:
   ```bash
   node /Users/adralessaturino/ai_projects/mcps/gdocs/dist/index.js
   ```
   (Press Ctrl+C after seeing the auth URL)

### "Token has expired"

Delete the token and re-authorize:
```bash
rm ~/.google-sheets-mcp-token.json
```

Restart Claude Desktop and try again.

### "Unable to read spreadsheet"

1. Make sure you're signed in with the Google account that has access
2. Check that the spreadsheet is shared with you
3. Verify the URL format is correct

## 📚 Available Tools

Once setup is complete, you can use these tools:

### 1. google_sheets_get_info
Get spreadsheet metadata (title, tabs, size)

### 2. google_sheets_list_tabs
List all tabs/sheets in a spreadsheet

### 3. google_sheets_get_tab_data
Read cell data from a specific tab (supports A1 notation ranges)

## 🔒 Security

- Read-only access (can't modify your sheets)
- OAuth tokens stored locally on your machine
- No data sent to third parties
- Revoke access anytime at: https://myaccount.google.com/permissions

## 📖 Full Documentation

See [README.md](./README.md) for complete documentation and advanced usage.
