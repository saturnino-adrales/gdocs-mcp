#!/usr/bin/env node
import { OAuth2Client } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const TOKEN_PATH = path.join(process.env.HOME || "", ".google-sheets-mcp-token.json");
const CREDENTIALS_PATH = path.join(process.env.HOME || "", ".google-sheets-mcp-credentials.json");

async function exchangeCodeForToken(authCode) {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
  const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;

  const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

  try {
    const { tokens } = await oAuth2Client.getToken(authCode);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    console.log('✅ Token saved successfully to:', TOKEN_PATH);
    console.log('You can now use the Google Sheets MCP server!');
  } catch (error) {
    console.error('❌ Error exchanging code:', error.message);
    process.exit(1);
  }
}

const authCode = process.argv[2];

if (!authCode) {
  console.log('Usage: node exchange-token.js <authorization-code>');
  console.log('\nTo get the authorization code:');
  console.log('1. Visit the OAuth URL from the error message');
  console.log('2. Click "Allow"');
  console.log('3. You\'ll be redirected to http://localhost/?code=<CODE>');
  console.log('4. Copy the code part and run: node exchange-token.js <CODE>');
  process.exit(0);
}

exchangeCodeForToken(authCode);
