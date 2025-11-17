# Quick Setup Guide (Shared Token)

**Setup Time**: 2 minutes per user

**Use Case**: Fastest setup when individual audit trails are not required and team trusts shared access.

---

## Overview

This is the **fastest setup method** where all team members share the manager's authentication token. All Google Sheets operations will appear as done by the manager's account.

### Trade-offs

✅ **Benefits**:
- Fastest setup (~2 minutes vs ~10 minutes)
- No OAuth flow for each user
- No GCP test user management
- Uniform access for all team members

⚠️ **Limitations**:
- All changes appear as manager in Google audit logs
- No individual user accountability
- Everyone has same access as manager
- Can't revoke access for individual users

**Alternative**: See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for individual authentication (better for production use)

---

## Manager: One-Time Setup

### Step 1: Complete Your Own Authentication

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Authenticate with YOUR Google account
node exchange-token.js
```

This creates two files in your home directory:
- `~/.google-sheets-mcp-credentials.json` (OAuth app credentials)
- `~/.google-sheets-mcp-token.json` (your authentication token)

### Step 2: Share Files with Team

Share these two files with your team members:

**Windows**:
```
C:\Users\YourUsername\.google-sheets-mcp-credentials.json
C:\Users\YourUsername\.google-sheets-mcp-token.json
```

**Mac/Linux**:
```
~/.google-sheets-mcp-credentials.json
~/.google-sheets-mcp-token.json
```

**Sharing Methods**:
- Secure file share (OneDrive, Google Drive, Dropbox)
- Team communication tool (Slack, Teams) - use private channels
- Email with encryption

⚠️ **Security Note**: These files grant access to Google Sheets, so share securely within your team only.

---

## Team Members: Quick Setup

### Step 1: Get Files from Manager

Receive these two files from your manager:
- `google-sheets-mcp-credentials.json`
- `google-sheets-mcp-token.json`

### Step 2: Copy Files to Home Directory

**Windows**:
```powershell
# Save to your home directory
copy google-sheets-mcp-credentials.json C:\Users\YourUsername\.google-sheets-mcp-credentials.json
copy google-sheets-mcp-token.json C:\Users\YourUsername\.google-sheets-mcp-token.json
```

**Mac/Linux**:
```bash
# Save to your home directory
cp google-sheets-mcp-credentials.json ~/.google-sheets-mcp-credentials.json
cp google-sheets-mcp-token.json ~/.google-sheets-mcp-token.json
```

### Step 3: Build the Project

```bash
# Clone the repository (if you haven't already)
git clone https://github.com/saturnino-adrales/gdocs-mcp.git
cd gdocs-mcp

# Install dependencies and build
npm install
npm run build
```

### Step 4: Configure Claude Code

Edit `~/.claude/settings.json` and add:

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
- Use the **absolute path** to your project directory
- Replace `YourUsername` and `path/to` with your actual paths
- To get your absolute path: `cd gdocs-mcp && pwd`

**Or ask Claude to configure it**:
```
"Configure my Claude Code settings to use the Google Sheets MCP server at: [paste output from pwd]"
```

### Step 5: Restart Claude Code

Restart Claude Code to load the new MCP server configuration.

### Step 6: Test the Setup

Ask Claude:

```
"Test the Google Sheets MCP connection. What tools are available?"
```

Or test with a real spreadsheet:

```
"List all the sheets in this spreadsheet: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit"
```

**Success**: Claude returns spreadsheet information → You're ready to go! 🚀

---

## Automated Setup Script

For even faster setup, use the automated script:

### Step 1: Get Files from Manager

Save the credentials and token files somewhere temporary.

### Step 2: Run Setup Script

```bash
# Run the quick setup script
node scripts/quick-setup.js /path/to/credentials.json /path/to/token.json
```

The script will:
1. Copy files to your home directory
2. Install dependencies
3. Build the project
4. Show you the configuration for Claude Code

---

## Troubleshooting

### "credentials.json not found" or "token.json not found"
- Verify files exist in your home directory:
  ```bash
  ls ~/.google-sheets-mcp-credentials.json
  ls ~/.google-sheets-mcp-token.json
  ```
- Re-copy the files from manager if missing

### "MCP server not found" in Claude Code
- Check `~/.claude/settings.json` has the correct absolute path
- Verify `dist/index.js` exists: `ls dist/index.js`
- Restart Claude Code after editing settings

### "Permission denied" when accessing sheets
- Ask manager to share the specific Google Sheet with their account
- Verify the sheet URL is correct
- Check that manager's account has access to the sheet

### "Cannot find module googleapis"
- Run `npm install` to install dependencies
- Check that `node_modules/` directory exists

### Token expired
- Manager needs to re-authenticate: `node exchange-token.js`
- Manager shares the new token file with team
- Team members replace their `~/.google-sheets-mcp-token.json`

---

## Security Considerations

### What You're Sharing
- **Credentials file**: OAuth app registration (safe to share within team)
- **Token file**: Manager's authentication token (grants access to sheets)

### Access Control
- All users have the same access as the manager
- All operations appear as manager in Google audit logs
- To revoke access: Manager revokes token at https://myaccount.google.com/permissions

### Best Practices
- Only share within trusted team
- Use secure file sharing methods
- Don't commit these files to git (already in `.gitignore`)
- Consider switching to individual authentication for production use

---

## What You Can Do Now

Ask Claude to work with Google Sheets:

**Read Operations**:
```
"Get metadata about this spreadsheet: [URL]"
"List all tabs in this sheet: [URL]"
"Read data from the 'Results' tab in [URL]"
```

**Write Operations**:
```
"Append these test results to my sheet: [URL]"
"Update cells A1:C1 with these values: [URL]"
"Create a new sheet called 'Archive' in [URL]"
```

---

## Switching to Individual Authentication Later

If you later want individual audit trails and access control:

1. Each user runs: `node exchange-token.js`
2. Manager adds users as GCP test users (if app in testing mode)
3. Users authenticate with their own Google accounts
4. Manager shares specific sheets with individual user accounts

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for full instructions.

---

## Quick Reference

**Verify setup**:
```bash
# Check files exist
ls ~/.google-sheets-mcp-credentials.json
ls ~/.google-sheets-mcp-token.json

# Check build succeeded
ls dist/index.js

# Check Claude settings
cat ~/.claude/settings.json
```

**Get project path for Claude config**:
```bash
cd gdocs-mcp
pwd  # Copy this path
```

**Rebuild after code changes**:
```bash
npm run build
```

---

**Need help?** Ask Claude: "I'm having trouble with the Google Sheets MCP quick setup" and share the error message.

Good luck! 🚀
