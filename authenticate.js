#!/usr/bin/env node
import { OAuth2Client } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { exec } from 'child_process';
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
  console.log('   3. You\'ll be redirected to: http://localhost/?code=...');
  console.log('   4. The page won\'t load (that\'s normal!)');
  console.log();
  console.log('─'.repeat(60));
  console.log();

  // Prompt for auth code
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('📥 Paste the FULL redirect URL (or just the code part): ', async (input) => {
    rl.close();

    // Extract code from URL or use input directly
    let authCode = input.trim();

    // If user pasted full URL, extract code
    if (authCode.includes('code=')) {
      const match = authCode.match(/code=([^&]+)/);
      if (match) {
        authCode = match[1];
        console.log('\n✅ Extracted authorization code from URL');
      }
    }

    console.log('\n🔄 Step 2: Exchanging code for token...\n');

    try {
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
      console.error('\n❌ Error exchanging authorization code:');
      console.error('   ', error.message);
      console.log('\n💡 Common issues:');
      console.log('   - Code expired (codes are single-use and expire quickly)');
      console.log('   - Invalid code format');
      console.log('   - Network connectivity issues');
      console.log('\n🔄 Please run this script again to get a fresh authorization URL.\n');
      process.exit(1);
    }
  });
}

authenticate();
