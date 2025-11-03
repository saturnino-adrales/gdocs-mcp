#!/bin/bash
# Helper script to show OAuth authorization URL

echo "==================================="
echo "Google Sheets MCP Authorization"
echo "==================================="
echo ""

# Check if credentials exist
if [ ! -f ~/.google-sheets-mcp-credentials.json ]; then
    echo "❌ Error: Credentials file not found!"
    echo ""
    echo "Please create OAuth credentials first:"
    echo "1. Go to https://console.cloud.google.com/"
    echo "2. Create a project and enable Google Sheets API"
    echo "3. Create OAuth 2.0 Desktop credentials"
    echo "4. Download and save to: ~/.google-sheets-mcp-credentials.json"
    echo ""
    echo "See SETUP_GUIDE.md for detailed instructions."
    exit 1
fi

# Check if already authorized
if [ -f ~/.google-sheets-mcp-token.json ]; then
    echo "✅ Already authorized!"
    echo ""
    echo "Token found at: ~/.google-sheets-mcp-token.json"
    echo ""
    echo "To re-authorize, delete the token file:"
    echo "  rm ~/.google-sheets-mcp-token.json"
    echo ""
    exit 0
fi

echo "⚠️  No authorization token found."
echo ""
echo "Starting server to get authorization URL..."
echo "Press Ctrl+C after copying the URL."
echo ""
echo "-----------------------------------"
echo ""

# Run the server to show auth URL
# It will error with the auth URL since no token exists
timeout 10s node dist/index.js 2>&1 | grep -A 5 "authorize this app" || true

echo ""
echo "-----------------------------------"
echo ""
echo "Next steps:"
echo "1. Copy the authorization URL above"
echo "2. Open it in your browser"
echo "3. Sign in and allow access"
echo "4. Token will be saved automatically"
echo "5. Restart Claude Desktop and try again"
echo ""
