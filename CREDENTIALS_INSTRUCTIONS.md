# google.json Setup Instructions

Thank you for requesting the `google.json` file for the Google Sheets MCP Server!

## What You Received

You received `google.json` - this file contains OAuth credentials for accessing Google Sheets API.

## Important Notes

⚠️ **These credentials are shared** - This means:
- Usage is subject to Google API quotas
- Multiple users share the same quota
- For production or high-volume use, consider creating your own credentials

✅ **Your data is still private** - Even though credentials are shared:
- Each user gets their own personal access token
- Your spreadsheet data is never shared with others
- Only you can access your Google Sheets

## Installation Steps

### 1. Save google.json

Save the `google.json` file to your home directory as `~/.google-sheets-mcp-credentials.json`:

```bash
# macOS/Linux
mv ~/Downloads/google.json ~/.google-sheets-mcp-credentials.json

# Windows (PowerShell)
Move-Item "$env:USERPROFILE\Downloads\google.json" "$env:USERPROFILE\.google-sheets-mcp-credentials.json"
```

### 2. Verify File Location

Make sure the file is in the right place:

```bash
# macOS/Linux
ls -la ~/.google-sheets-mcp-credentials.json

# Windows (PowerShell)
Test-Path "$env:USERPROFILE\.google-sheets-mcp-credentials.json"
```

### 3. Continue Setup

Now continue with the main setup instructions:
- See [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Step 2: Configure Claude Desktop
- Or see [README.md](./README.md) - Claude Desktop Configuration section

### 4. First Authorization

The first time you use the MCP server:
1. Claude will show an authorization URL
2. Visit the URL in your browser
3. Sign in with YOUR Google account
4. Click "Allow" to grant access
5. Your personal access token will be saved

## Creating Your Own google.json (Recommended for Production)

If you need higher quotas or want full control:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Follow [Option B in README.md](./README.md#option-b-create-your-own-using-gcp-recommended-for-production)
3. Download your own `google.json` and save it as `~/.google-sheets-mcp-credentials.json`

## Need Help?

- See [README.md](./README.md) for full documentation
- See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for quick setup
- Open an issue on GitHub for support

## Security Notes

🔒 **What's Safe to Share:**
- The `google.json` file (OAuth credentials)

🚫 **NEVER Share:**
- Your `~/.google-sheets-mcp-token.json` file (your personal access token)
- Your Google account password
- Your spreadsheet data

---

**Note**: This `google.json` is shared among users. Your personal data remains private because each user gets their own access token when they authorize.
