#!/usr/bin/env node
import { OAuth2Client } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { exec } from 'child_process';
import * as http from 'http';
import { URL } from 'url';
import { updateClaudeSettings } from './setup.js';

const TOKEN_PATH = path.join(process.env.HOME || "", ".google-sheets-mcp-token.json");
const CREDENTIALS_PATH = path.join(process.env.HOME || "", ".google-sheets-mcp-credentials.json");
const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.readonly"
];

function openBrowser(url) {
  const platform = process.platform;
  let command;

  if (platform === 'darwin') {
    command = `open "${url}"`;
  } else if (platform === 'win32') {
    command = `start "" "${url}"`;
  } else {
    // Linux and other Unix-like systems
    command = `xdg-open "${url}"`;
  }

  exec(command, (error) => {
    if (error) {
      console.log('⚠️  Could not automatically open browser. Please copy the URL above manually.');
    } else {
      console.log('✅ Browser opened automatically!');
    }
  });
}

function startRedirectServer(oAuth2Client) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (!req.url.startsWith('/?code=')) {
        res.writeHead(400);
        res.end('Invalid request');
        return;
      }

      // Extract code from URL
      const urlParams = new URL(req.url, 'http://localhost:3000').searchParams;
      const code = urlParams.get('code');

      if (!code) {
        res.writeHead(400);
        res.end('No authorization code received');
        return;
      }

      // Send success response to browser
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authorization Successful</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; text-align: center; }
              h1 { color: #28a745; }
              p { color: #666; margin-top: 20px; }
            </style>
          </head>
          <body>
            <h1>✅ Authorization Successful!</h1>
            <p>You can close this window and return to your terminal.</p>
          </body>
        </html>
      `);

      // Close server and resolve with code
      server.close();
      resolve(code);
    });

    server.listen(3000, 'localhost', () => {
      console.log('✅ Local server listening on http://localhost:3000 (waiting for authorization...)');
    });

    server.on('error', (err) => {
      if (err.code === 'EACCES') {
        console.error('\n❌ Port 3000 requires elevated privileges');
        reject(err);
      } else if (err.code === 'EADDRINUSE') {
        console.error('\n❌ Port 3000 is already in use');
        reject(err);
      } else {
        reject(err);
      }
    });

    setTimeout(() => {
      if (server.listening) {
        server.close();
        reject(new Error('Authorization timeout - no redirect received within 5 minutes'));
      }
    }, 5 * 60 * 1000); // 5 minute timeout
  });
}

async function authenticate() {
  console.log('\n🔐 Google Sheets MCP Authentication');
  console.log('═'.repeat(60));
  console.log();

  // Check if credentials file exists
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error(`❌ Credentials file not found at: ${CREDENTIALS_PATH}`);
    console.error('\n📋 Please request the credentials file from the project maintainer.');
    console.error('   Once received, save it to: ~/.google-sheets-mcp-credentials.json\n');
    process.exit(1);
  }

  // Load credentials
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
  const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

  // Generate auth URL
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log('📝 Step 1: Authorize Access');
  console.log('─'.repeat(60));
  console.log('\nOpening your browser to Google\'s authorization page...\n');
  console.log('🔗 Authorization URL:');
  console.log(authUrl);
  console.log();

  // Auto-open browser
  openBrowser(authUrl);

  console.log('\n📋 In your browser:');
  console.log('   1. Sign in with YOUR Google account');
  console.log('   2. Click "Allow" to grant access');
  console.log('   3. You\'ll be automatically redirected back here');
  console.log('   4. A success page will appear in your browser');
  console.log();
  console.log('─'.repeat(60));
  console.log();

  try {
    // Start local server to capture redirect
    const authCode = await startRedirectServer(oAuth2Client);

    console.log('\n✅ Authorization code received!');
    console.log('\n🔄 Step 2: Exchanging code for token...\n');

    const { tokens } = await oAuth2Client.getToken(authCode);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));

    console.log('═'.repeat(60));
    console.log('✅ SUCCESS! Authentication complete!');
    console.log('═'.repeat(60));
    console.log();
    console.log('📁 Token saved to:', TOKEN_PATH);
    console.log();

    // Automatically update Claude settings
    updateClaudeSettings();

    console.log('🎉 Setup complete! You can now use the Google Sheets MCP server!');
    console.log();
    console.log('Next steps:');
    console.log('  1. Restart Claude Code to load the new MCP server');
    console.log('  2. Try asking Claude: "What Google Sheets tools are available?"');
    console.log();
  } catch (error) {
    console.error('\n❌ Error during authentication:');
    console.error('   ', error.message);
    console.log('\n💡 Common issues:');
    console.log('   - Port 80 is in use (try running with sudo)');
    console.log('   - Code expired (codes are single-use and expire quickly)');
    console.log('   - Network connectivity issues');
    console.log('\n🔄 Please run this script again to try again.\n');
    process.exit(1);
  }
}

authenticate();
