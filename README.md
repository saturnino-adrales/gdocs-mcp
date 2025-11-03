# Google Sheets MCP Server

A Model Context Protocol (MCP) server that provides read-only access to Google Sheets. This allows Claude Desktop and other MCP clients to read data from your Google Spreadsheets using simple URL-based tools.

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
cd /Users/adralessaturino/ai_projects/mcps/gdocs
npm install
```

### 2. Build the Server

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

## Google Cloud Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Enter a project name (e.g., "MCP Sheets Access")
4. Click **Create**

### Step 2: Enable Google Sheets API

1. In your project, go to **APIs & Services** → **Library**
2. Search for "Google Sheets API"
3. Click on it and press **Enable**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - Choose **External** user type
   - Fill in required fields (app name, user support email, developer email)
   - Add your email to **Test users**
   - Save and continue
4. Back to **Create OAuth client ID**:
   - Application type: **Desktop app**
   - Name: "MCP Sheets Client" (or any name)
   - Click **Create**
5. Download the JSON file (click the download icon)
6. Save it as: `~/.google-sheets-mcp-credentials.json`

```bash
# Move downloaded file to home directory
mv ~/Downloads/client_secret_*.json ~/.google-sheets-mcp-credentials.json
```

### Step 4: First-Time Authorization

The first time you use the MCP server, you'll need to authorize it:

1. Start the server (it will show an authorization URL)
2. Visit the URL in your browser
3. Sign in with your Google account
4. Click **Allow** to grant access
5. The authorization token will be saved automatically to `~/.google-sheets-mcp-token.json`

**Note**: The server will guide you through this process when you first run it.

## Claude Desktop Configuration

Add this to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

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

Make sure you've saved your OAuth credentials to:
```
~/.google-sheets-mcp-credentials.json
```

### "Authentication token expired"

Delete the saved token and re-authorize:
```bash
rm ~/.google-sheets-mcp-token.json
```

Then restart Claude Desktop to trigger re-authorization.

### "Unable to read spreadsheet"

Ensure:
1. The spreadsheet URL is correct
2. You have access to the spreadsheet (it's shared with your Google account)
3. You've granted the app permission during OAuth flow

### "Invalid Google Sheets URL"

The URL must be in this format:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

## Security Notes

- **Read-only access**: This server only requests `spreadsheets.readonly` scope
- **Local authentication**: OAuth tokens are stored locally at `~/.google-sheets-mcp-token.json`
- **No data transmission**: All data stays between Google Sheets API and your local Claude Desktop
- **Revoke access**: You can revoke access anytime at https://myaccount.google.com/permissions

## License

MIT

## Contributing

Issues and pull requests welcome!
