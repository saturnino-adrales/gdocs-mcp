# OAuth Credentials Setup Instructions

Thank you for receiving the OAuth credentials file for the Google Sheets MCP Server!

## What You Received

You received `google-sheets-mcp-credentials.json` - this file contains OAuth 2.0 application credentials created by your administrator in Google Cloud Platform.

## Important Notes

✅ **Team Credentials** - This file is:
- Created and managed by your administrator in Google Cloud Platform
- Safe to share among all users
- Just the OAuth app configuration (client ID and client secret)
- NOT your personal authentication token

✅ **Your Data Stays Private** - Even though credentials are shared:
- You authenticate with YOUR own Google account
- You get YOUR own personal access token
- You can only access sheets shared with YOUR Google account
- Your operations show YOUR name in Google Sheets audit logs
- Other users cannot access your personal token

⚠️ **Prerequisites**:
- Your administrator must have added YOUR Google account email as a test user in GCP
- Your administrator must share specific Google Sheets with YOUR email
- Without these, authentication will fail with "access_denied"

---

## Installation Steps

### Step 1: Save the Credentials File

Save the credentials file to your home directory:

**macOS/Linux**:
```bash
# Move from Downloads (or wherever you saved it)
mv ~/Downloads/google-sheets-mcp-credentials.json ~/.google-sheets-mcp-credentials.json
```

**Windows (PowerShell)**:
```powershell
# Move from Downloads
Move-Item "$env:USERPROFILE\Downloads\google-sheets-mcp-credentials.json" "$env:USERPROFILE\.google-sheets-mcp-credentials.json"
```

**Windows (Command Prompt)**:
```cmd
# Move from Downloads
move "%USERPROFILE%\Downloads\google-sheets-mcp-credentials.json" "%USERPROFILE%\.google-sheets-mcp-credentials.json"
```

### Step 2: Verify File Location

Confirm the file is in the correct location:

**macOS/Linux**:
```bash
ls -la ~/.google-sheets-mcp-credentials.json
```

**Windows (PowerShell)**:
```powershell
Test-Path "$env:USERPROFILE\.google-sheets-mcp-credentials.json"
```

**Expected**: Should return `True` or show the file details

### Step 3: Continue with User Setup

Now continue with the complete setup process:
- **Main Guide**: [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Full user setup instructions
- **Overview**: [README.md](./README.md) - Project documentation

---

## What Happens Next

### When You Authenticate

The first time you use the MCP server (by running `node exchange-token.js`):

1. **Browser Opens**: You'll see a Google login page
2. **Login**: Sign in with YOUR Google account (the one your manager added as a test user)
3. **Grant Access**: Click "Allow" to grant the app access to Google Sheets
4. **Token Saved**: Your personal token is saved to `~/.google-sheets-mcp-token.json`

### Your Personal Token

After authentication, you'll have two files:
- `~/.google-sheets-mcp-credentials.json` - OAuth app credentials (shared with team)
- `~/.google-sheets-mcp-token.json` - YOUR personal token (NEVER share this!)

**Critical**: Your token file is personal and should NEVER be shared with anyone.

---

## Troubleshooting

### "Access denied" or "Error 403"

**Cause**: Your Google account email is not added as a test user in GCP

**Solution**:
1. Contact your administrator
2. Provide them with the EXACT Google account email you're using
3. Ask them to add you as a test user in GCP OAuth consent screen
4. After they add you, run `node exchange-token.js` again

### "Credentials file not found"

**Cause**: File not in the correct location

**Solution**:
- Verify the file exists: Run the verification command in Step 2 above
- Check you saved it to your home directory, not the project directory
- Make sure the filename is exactly `google-sheets-mcp-credentials.json` (with the dot at the start)

### "Cannot access sheet"

**Cause**: The specific Google Sheet is not shared with your account

**Solution**:
1. Contact your administrator
2. Ask them to share the specific Google Sheet with YOUR Google account email
3. Verify the sheet URL is correct

---

## Security Notes

### What's Safe to Share

🔒 **The credentials file** (`google-sheets-mcp-credentials.json`):
- Contains OAuth app client ID and client secret
- Safe to share within your team
- Enables the authentication flow
- Does NOT grant access to any data by itself

### What to NEVER Share

🚫 **Your token file** (`~/.google-sheets-mcp-token.json`):
- Contains YOUR personal authentication token
- Grants access to sheets as YOU
- Should NEVER be shared with anyone
- Stored only on your computer

🚫 **Your Google account password**:
- Never share your Google password with anyone
- The OAuth flow never asks for your password in the terminal

### Access Control

**Administrator Controls**:
- Who can authenticate (via GCP test users)
- What sheets each user can access (via sheet sharing)

**You Control**:
- When to authenticate and use the service
- When to revoke access: https://myaccount.google.com/permissions

---

## Need Help?

### For Setup Issues
- Review [SETUP_GUIDE.md](./SETUP_GUIDE.md) troubleshooting section
- Verify your administrator added you as a test user
- Confirm sheets are shared with your Google account

### For Technical Issues
- See [README.md](./README.md) for detailed documentation
- Open an issue on GitHub for support

---

**Ready?** Continue to [SETUP_GUIDE.md](./SETUP_GUIDE.md) to complete your setup!
