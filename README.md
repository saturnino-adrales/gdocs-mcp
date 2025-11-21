# Google Sheets MCP Server

A Model Context Protocol (MCP) server that provides read-only access to Google Sheets. This allows Claude Desktop and other MCP clients to read data from your Google Spreadsheets using simple URL-based tools.

## Quick Setup Guides

**Choose your setup method**:

### Recommended: Individual Authentication (Production-Ready)

- 📗 **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Individual authentication setup (~5-10 minutes)
  - Each user authenticates with their own Google account
  - Individual audit trails and access control
  - **Best for**: Production use, compliance, individual accountability
  - **Requirements**: Administrator must provide credentials file and add you as test user

### Alternative: Shared Token (Quick Testing)

- 📘 **[QUICK_SETUP.md](./QUICK_SETUP.md)** - Fastest setup (~2 minutes) using shared token
  - All users share administrator's token
  - **Best for**: Small teams, prototypes, quick testing only
  - **Trade-off**: No individual audit trails, all changes appear as administrator

**For detailed technical information**, continue reading below.

## Features

- **Read-only access** to your Google Sheets
- **OAuth 2.0 authentication** for secure access
- **Three simple tools**:
  - `google_sheets_get_info` - Get spreadsheet metadata
  - `google_sheets_list_tabs` - List all tabs/sheets
  - `google_sheets_get_tab_data` - Read cell data from tabs
- **Flexible output formats** (Markdown and JSON)
- **A1 notation** support for range selection

## Installation

### 1. Install Dependencies

```bash
# Clone or download this repository, then:
cd google-sheets-mcp-server
npm install
```

### 2. Build the Server

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

## Google Cloud Setup

You need OAuth 2.0 credentials for authentication.

### For Team Members

**Your administrator will provide**:
1. OAuth credentials file (`google-sheets-mcp-credentials.json`)
2. Add your Google account email as a test user in GCP
3. Share relevant Google Sheets with your Google account

**Your setup**: Follow [SETUP_GUIDE.md](./SETUP_GUIDE.md)

**Benefits**:
- Individual user accountability
- Administrator controls who can authenticate
- Each user's actions show their name in audit logs
- Secure and compliant

---

### For Individual Developers (DIY)

**If you're setting this up for yourself only**:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google Sheets API
4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services** → **Credentials**
   - Create **OAuth client ID** → **Desktop app**
   - Download the JSON file
5. Configure OAuth consent screen (add yourself as test user)
6. Save credentials as `~/.google-sheets-mcp-credentials.json`
7. Continue to [First-Time Authorization](#first-time-authorization)

---

### First-Time Authorization

After setting up credentials, authenticate by running:

```bash
node exchange-token.js
```

**What happens**:
1. Opens browser to Google login
2. Sign in with your Google account
3. Click **Allow** to grant access
4. Token automatically saved to `~/.google-sheets-mcp-token.json`

**Note**: Each user authenticates with their own Google account (even though credentials file is shared).

## Claude Desktop Configuration

Add this to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

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

**Important**: Replace `/ABSOLUTE/PATH/TO/google-sheets-mcp-server` with the actual absolute path where you installed this server.

**Example paths**:
- macOS: `/Users/yourname/projects/google-sheets-mcp-server/dist/index.js`
- Linux: `/home/yourname/projects/google-sheets-mcp-server/dist/index.js`
- Windows: `C:\Users\yourname\projects\google-sheets-mcp-server\dist\index.js`

**Tip**: Get the absolute path by running `pwd` in the project directory:
```bash
cd google-sheets-mcp-server
pwd  # Copy this path and append /dist/index.js
```

**Restart Claude Desktop** after updating the config.

## Usage Examples

Once configured in Claude Desktop, you can use natural language:

### Get Spreadsheet Info

```
"Tell me about this Google Sheet: https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit"
```

### List All Tabs

```
"What tabs are in this spreadsheet: [URL]"
```

### Read Data from a Tab

```
"Read all data from the 'Sales' tab in this sheet: [URL]"
```

```
"Get cells A1 to D10 from Sheet1 in this spreadsheet: [URL]"
```

### Specify Output Format

```
"Read the Data tab from [URL] and return it as JSON"
```

## Tools Reference

### google_sheets_get_info

Get metadata about a spreadsheet.

**Parameters**:
- `url` (string, required): Google Sheets URL
- `response_format` (string, optional): `"markdown"` or `"json"` (default: `"markdown"`)

**Example**:
```json
{
  "url": "https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit",
  "response_format": "json"
}
```

### google_sheets_list_tabs

List all tabs/sheets in a spreadsheet.

**Parameters**:
- `url` (string, required): Google Sheets URL
- `response_format` (string, optional): `"markdown"` or `"json"` (default: `"markdown"`)

### google_sheets_get_tab_data

Read cell data from a specific tab.

**Parameters**:
- `url` (string, required): Google Sheets URL
- `tab_name` (string, required): Name of the tab (e.g., "Sheet1")
- `range` (string, optional): A1 notation range (e.g., "A1:D10")
- `response_format` (string, optional): `"markdown"` or `"json"` (default: `"markdown"`)

**Range Examples**:
- `"A1:D10"` - Specific rectangular range
- `"B:E"` - Columns B through E (all rows)
- `"A1:Z"` - All columns from row 1 onward
- Omit range to read entire sheet

## Development

### Run in Development Mode

```bash
npm run dev
```

This uses `tsx watch` for auto-reloading during development.

### Build for Production

```bash
npm run build
```

### Clean Build Artifacts

```bash
npm run clean
```

## Troubleshooting

### "Credentials file not found"

**Cause**: OAuth credentials file is missing

**Solution**:
- **Team members**: Get the credentials file from your administrator
- **DIY users**: Create credentials in Google Cloud Console (see Google Cloud Setup above)
- Verify file location: `ls ~/.google-sheets-mcp-credentials.json`

### "Access denied" or "Error 403"

**Cause**: Not added as a test user in GCP

**Solution**:
- Contact your administrator to add your Google account email as a test user in GCP OAuth consent screen
- Ensure you're using the correct Google account to authenticate
- Re-run: `node exchange-token.js`

### "Authentication token expired"

**Cause**: Token needs refresh

**Solution**:
```bash
# Delete expired token
rm ~/.google-sheets-mcp-token.json

# Re-authenticate
node exchange-token.js
```

### "Unable to read spreadsheet" or "Permission denied"

**Cause**: Sheet not shared with your Google account

**Solution**:
1. Verify the spreadsheet URL is correct
2. Ensure the sheet is shared with YOUR Google account email
3. Check you authenticated with the correct Google account
4. Ask your administrator to share the sheet with your Google account

### "Invalid Google Sheets URL"

**Cause**: Incorrect URL format

**Required format**:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

## Security Notes

### Individual Authentication Model
- **Individual Accountability**: Each user authenticates with their own Google account
- **Audit Trails**: All operations show the individual user's name in Google Sheets history
- **Access Control**: Administrator controls who can authenticate and what sheets they can access
- **Token Isolation**: Each user has their own token; compromised token only affects one user

### File Security
- **Credentials file** (`~/.google-sheets-mcp-credentials.json`): OAuth app config, safe to share within team
- **Token file** (`~/.google-sheets-mcp-token.json`): Personal authentication token, NEVER share

### Data Protection
- **Local authentication**: OAuth tokens stored locally on your machine
- **No data transmission**: Data flows only between Google Sheets API and your local Claude instance
- **Minimal scopes**: Only requests necessary permissions (spreadsheets access)
- **Revoke access**: Visit https://myaccount.google.com/permissions anytime

### Administrator Controls
- Add/remove users via GCP test users
- Share/unshare specific sheets with individual users
- Monitor activity via Google Sheets version history
- Revoke credentials file to disable all access

## License

MIT

## Contributing

Issues and pull requests welcome!
