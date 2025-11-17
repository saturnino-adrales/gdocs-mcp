# Setup Guide - Google Sheets MCP Server

Complete step-by-step setup instructions for the Google Sheets MCP Server.

## What You Need

Before starting, make sure you have:
- Node.js 18+ (`node --version`)
- npm (`npm --version`)
- A Google account

## Quick Overview

This setup process takes about **5 minutes** and involves:

1. Requesting Google OAuth credentials (`google.json`) from the project maintainer
2. Installing dependencies and building the project
3. Authorizing access to your Google account
4. Configuring Claude Desktop/Code
5. Testing the connection

---

## Step 1: Get Google OAuth Credentials

1. **Request the credentials file**:
   - Open an issue on the GitHub repository
   - Ask for `google.json` credentials
   - The maintainer will provide the file

2. **Save the file**:
   ```bash
   # macOS/Linux
   mv ~/Downloads/google.json ~/.google-sheets-mcp-credentials.json

   # Windows (PowerShell)
   Move-Item "$env:USERPROFILE\Downloads\google.json" "$env:USERPROFILE\.google-sheets-mcp-credentials.json"
   ```

3. **Verify it's saved**:
   ```bash
   # macOS/Linux
   ls -la ~/.google-sheets-mcp-credentials.json

   # Windows (PowerShell)
   Test-Path "$env:USERPROFILE\.google-sheets-mcp-credentials.json"
   ```

**Important Notes:**
- These credentials are shared among users (subject to Google API quotas)
- Your data remains **completely private** (each user gets their own access token)
- For production or high-volume use, see [README.md](./README.md#option-b-create-your-own-using-gcp-recommended-for-production) for instructions on creating your own credentials

---

## Step 2: Install and Build

```bash
# Navigate to the project directory
cd google-sheets-mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

**What happens:**
- Dependencies are installed
- TypeScript is compiled to JavaScript
- `dist/` directory is created with compiled code

**Verify build succeeded:**
```bash
ls dist/index.js
```

---

## Step 3: Authorize Access (First-Time Only)

The first time you use the MCP server, you need to authorize it to access your Google Sheets.

### Authorization Flow

1. When Claude tries to use the server for the first time, you'll see an error with an **authorization URL** like:
   ```
   https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=...
   ```

2. **Click or copy the URL** and open it in your browser

3. **Sign in** with your Google account

4. **Click "Allow"** to grant read access to Google Sheets

5. **You'll be redirected** to `http://localhost/?code=...`
   - The page won't load (that's normal!)
   - **Copy the entire URL** from your browser's address bar

6. **Extract the authorization code** from the URL:
   - Look for the part between `code=` and `&scope`
   - Example URL: `http://localhost/?code=4/0Ab32j90...&scope=...`
   - The code is: `4/0Ab32j90...`

7. **Exchange the code for access tokens**:

   ```bash
   # If you have jq installed (recommended):
   curl -s -X POST https://oauth2.googleapis.com/token \
     -d "code=YOUR_AUTHORIZATION_CODE_HERE" \
     -d "client_id=$(jq -r '.installed.client_id' ~/.google-sheets-mcp-credentials.json)" \
     -d "client_secret=$(jq -r '.installed.client_secret' ~/.google-sheets-mcp-credentials.json)" \
     -d "redirect_uri=http://localhost" \
     -d "grant_type=authorization_code" \
     > ~/.google-sheets-mcp-token.json
   ```

   **Don't have jq?** Use this method instead:
   ```bash
   # First, view your credentials to get client_id and client_secret:
   cat ~/.google-sheets-mcp-credentials.json

   # Then run curl with the values manually:
   curl -s -X POST https://oauth2.googleapis.com/token \
     -d "code=YOUR_AUTHORIZATION_CODE_HERE" \
     -d "client_id=YOUR_CLIENT_ID" \
     -d "client_secret=YOUR_CLIENT_SECRET" \
     -d "redirect_uri=http://localhost" \
     -d "grant_type=authorization_code" \
     > ~/.google-sheets-mcp-token.json
   ```

   Replace:
   - `YOUR_AUTHORIZATION_CODE_HERE` with the code from step 6
   - `YOUR_CLIENT_ID` with the value from credentials file
   - `YOUR_CLIENT_SECRET` with the value from credentials file

8. **Verify the token was saved**:
   ```bash
   # macOS/Linux
   ls -la ~/.google-sheets-mcp-token.json

   # Windows (PowerShell)
   Test-Path "$env:USERPROFILE\.google-sheets-mcp-token.json"
   ```

**Note**: The authorization code expires quickly and can only be used once. If you get an "invalid grant" error, start over from step 1 to get a fresh code.

---

## Step 4: Configure Claude Desktop/Code

### Get the Absolute Path

First, get the absolute path to the compiled server:

```bash
cd google-sheets-mcp-server
pwd
```

Copy the output and append `/dist/index.js` to it.

### Claude Desktop Configuration

**macOS**: Edit `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: Edit `%APPDATA%\Claude\claude_desktop_config.json`

Add or update the configuration:

```json
{
  "mcpServers": {
    "google-sheets": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/google-sheets-mcp-server/dist/index.js"
      ]
    }
  }
}
```

**Important**:
- Replace `/ABSOLUTE/PATH/TO/google-sheets-mcp-server` with your actual path from above
- Use absolute paths, not relative paths (e.g., don't use `~/` or `./`)
- If you already have other MCP servers configured, add `"google-sheets"` to the existing `mcpServers` object

**Example paths**:
- macOS: `/Users/yourname/projects/google-sheets-mcp-server/dist/index.js`
- Linux: `/home/yourname/projects/google-sheets-mcp-server/dist/index.js`
- Windows: `C:\\Users\\yourname\\projects\\google-sheets-mcp-server\\dist\\index.js`

### Claude Code Configuration

Claude Code typically auto-detects MCP servers or you can configure via `~/.claude/settings.json` with the same format as above.

---

## Step 5: Restart and Test

### Restart Claude

**Completely quit and restart** Claude Desktop/Code for the changes to take effect.

### Test the Connection

In Claude, try one of these commands:

**List available tools:**
```
What Google Sheets tools are available?
```

**Test with a real spreadsheet:**
```
List the tabs in this spreadsheet: https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit
```

**Success**: Claude returns information about your spreadsheet!

---

## Troubleshooting

### "Credentials file not found" or "google.json not found"

**Check the file exists:**
```bash
# macOS/Linux
ls -la ~/.google-sheets-mcp-credentials.json

# Windows
dir $env:USERPROFILE\.google-sheets-mcp-credentials.json
```

**Solution**: Make sure you completed [Step 1](#step-1-get-google-oauth-credentials) and saved the file to the correct location.

---

### "Token not found" or "Authorization required"

**Solution**: You need to authorize access. See [Step 3: Authorize Access](#step-3-authorize-access-first-time-only).

---

### "Token has expired"

**Solution**: Delete the token and re-authorize:
```bash
# macOS/Linux
rm ~/.google-sheets-mcp-token.json

# Windows
del $env:USERPROFILE\.google-sheets-mcp-token.json
```

Then restart Claude and follow the authorization flow again.

---

### "MCP server not found" in Claude

**Check these:**

1. **Verify the path in config is correct**:
   - Must be an absolute path
   - Must point to `dist/index.js`
   - Check for typos

2. **Verify dist/index.js exists**:
   ```bash
   ls dist/index.js
   ```
   If missing, run `npm run build`

3. **Restart Claude completely** after config changes

4. **Check Claude's logs** for errors:
   - macOS: `~/Library/Logs/Claude/mcp*.log`
   - Windows: `%APPDATA%\Claude\logs\mcp*.log`

---

### "Unable to read spreadsheet"

**Possible causes:**

1. **Wrong Google account**: Make sure you authorized with the account that has access to the spreadsheet
2. **No access**: Verify the spreadsheet is shared with your account
3. **Invalid URL**: URL must be in format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

---

### "Invalid grant" during authorization

**Solution**: The authorization code expired or was already used. Get a fresh code by starting the authorization flow again from step 1.

---

### Authorization URL not showing

**Try running the server manually to see the auth URL:**
```bash
cd google-sheets-mcp-server
node dist/index.js
```

Press Ctrl+C after seeing the URL, then copy it to your browser.

---

## Security Notes

### What's Safe to Share

- The `google.json` / `~/.google-sheets-mcp-credentials.json` file (OAuth app credentials)
- This project's source code

### NEVER Share

- Your `~/.google-sheets-mcp-token.json` file (personal access token)
- Your Google account password
- Your spreadsheet data

### Privacy & Access

- **Read-only access**: The server only requests `spreadsheets.readonly` scope
- **Local storage**: Tokens are stored locally on your machine
- **No data transmission**: Data flows only between Google Sheets API and your local Claude instance
- **Your data is private**: Even with shared credentials (Option A), each user gets their own personal access token
- **Revoke access anytime**: https://myaccount.google.com/permissions

---

## What's Next?

Once setup is complete, you can use these tools through Claude:

### Available Tools

1. **google_sheets_get_info** - Get spreadsheet metadata (title, tabs, size)
2. **google_sheets_list_tabs** - List all tabs/sheets in a spreadsheet
3. **google_sheets_get_tab_data** - Read cell data from a specific tab

### Example Usage

```
"Get info about this spreadsheet: [URL]"
"List all sheets in [URL]"
"Read the 'Sales Data' tab from [URL]"
"Get cells A1:D10 from the Results sheet in [URL]"
```

See [README.md](./README.md) for complete documentation and advanced usage.

---

## Files Created During Setup

These files are created in your **home directory** (not in the repo):

- `~/.google-sheets-mcp-credentials.json` - OAuth app credentials from Google Cloud
- `~/.google-sheets-mcp-token.json` - Your personal access token

**Important**: These files are ignored by git and contain sensitive information. Never commit them to version control.

---

## Need More Help?

- Check the [README.md](./README.md) for full documentation
- Look at [Claude's MCP logs](#mcp-server-not-found-in-claude) for error details
- Open an issue on GitHub for support

---

**Ready to use?** Ask Claude: "What Google Sheets tools are available?" 🚀
