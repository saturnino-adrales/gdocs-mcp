#!/usr/bin/env node
import { OAuth2Client } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';

const TOKEN_PATH = path.join(process.env.HOME || "", ".google-sheets-mcp-token.json");
const CREDENTIALS_PATH = path.join(process.env.HOME || "", ".google-sheets-mcp-credentials.json");

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.readonly'
];

async function authenticate() {
  try {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
    const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;

    const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });

    console.log('🔑 Authentication required!');
    console.log('\n1. Open this URL in your browser:');
    console.log(authUrl);
    console.log('\n2. Complete the OAuth flow');
    console.log('3. After approval, you\'ll be redirected to: http://localhost/?code=<AUTHORIZATION_CODE>');
    console.log('4. Copy the authorization code and run:');
    console.log(`   node exchange-token.js <AUTHORIZATION_CODE>`);

  } catch (error) {
    console.error('❌ Error reading credentials:', error.message);
    console.log('\nMake sure you have saved the credentials file to:', CREDENTIALS_PATH);
    process.exit(1);
  }
}

authenticate();