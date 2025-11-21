#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const HOME_DIR = process.env.HOME || "";
const CREDENTIALS_PATH = path.join(HOME_DIR, ".google-sheets-mcp-credentials.json");
const TOKEN_PATH = path.join(HOME_DIR, ".google-sheets-mcp-token.json");
const CLAUDE_SETTINGS_PATH = path.join(HOME_DIR, ".claude", "settings.json");

async function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function cleanup() {
  console.log('\n🧹 Google Sheets MCP Credential Cleanup');
  console.log('═'.repeat(60));
  console.log();
  console.log('This script will remove:');
  console.log('  1. OAuth credentials file');
  console.log('  2. Authentication token file');
  console.log('  3. MCP server configuration from Claude settings (optional)');
  console.log();

  const answer = await askQuestion('⚠️  Are you sure you want to remove all credentials? (yes/no): ');

  if (answer !== 'yes' && answer !== 'y') {
    console.log('\n❌ Cleanup cancelled.');
    process.exit(0);
  }

  console.log();
  let removedCount = 0;

  // Remove credentials file
  if (fs.existsSync(CREDENTIALS_PATH)) {
    fs.unlinkSync(CREDENTIALS_PATH);
    console.log('✅ Removed OAuth credentials:', CREDENTIALS_PATH);
    removedCount++;
  } else {
    console.log('ℹ️  OAuth credentials file not found (already removed)');
  }

  // Remove token file
  if (fs.existsSync(TOKEN_PATH)) {
    fs.unlinkSync(TOKEN_PATH);
    console.log('✅ Removed authentication token:', TOKEN_PATH);
    removedCount++;
  } else {
    console.log('ℹ️  Token file not found (already removed)');
  }

  // Ask about removing from Claude settings
  console.log();
  const removeFromClaude = await askQuestion('Remove Google Sheets MCP server from Claude settings? (yes/no): ');

  if (removeFromClaude === 'yes' || removeFromClaude === 'y') {
    if (fs.existsSync(CLAUDE_SETTINGS_PATH)) {
      try {
        const content = fs.readFileSync(CLAUDE_SETTINGS_PATH, 'utf-8');
        const settings = JSON.parse(content);

        if (settings.mcpServers && settings.mcpServers['google-sheets']) {
          delete settings.mcpServers['google-sheets'];
          fs.writeFileSync(CLAUDE_SETTINGS_PATH, JSON.stringify(settings, null, 2) + '\n');
          console.log('✅ Removed MCP server from Claude settings');
          removedCount++;
        } else {
          console.log('ℹ️  MCP server not found in Claude settings (already removed)');
        }
      } catch (error) {
        console.error('⚠️  Could not update Claude settings:', error.message);
      }
    } else {
      console.log('ℹ️  Claude settings file not found');
    }
  }

  console.log();
  console.log('═'.repeat(60));
  if (removedCount > 0) {
    console.log(`✅ Cleanup complete! Removed ${removedCount} item(s).`);
  } else {
    console.log('ℹ️  No credentials found to remove.');
  }
  console.log('═'.repeat(60));
  console.log();

  if (removeFromClaude === 'yes' || removeFromClaude === 'y') {
    console.log('⚠️  Don\'t forget to restart Claude Code for changes to take effect!');
    console.log();
  }
}

cleanup().catch(error => {
  console.error('❌ Error during cleanup:', error.message);
  process.exit(1);
});
