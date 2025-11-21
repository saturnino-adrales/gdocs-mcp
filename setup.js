#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLAUDE_SETTINGS_PATH = path.join(process.env.HOME || "", ".claude", "settings.json");
const PROJECT_ROOT = __dirname;
const MCP_SERVER_PATH = path.join(PROJECT_ROOT, "dist", "index.js");

/**
 * Updates the global Claude Code settings to include this MCP server
 */
export function updateClaudeSettings() {
  console.log('\n⚙️  Configuring Claude Code Settings');
  console.log('═'.repeat(60));
  console.log();

  // Ensure .claude directory exists
  const claudeDir = path.dirname(CLAUDE_SETTINGS_PATH);
  if (!fs.existsSync(claudeDir)) {
    console.log(`📁 Creating Claude settings directory: ${claudeDir}`);
    fs.mkdirSync(claudeDir, { recursive: true });
  }

  // Read existing settings or create new
  let settings = {};
  if (fs.existsSync(CLAUDE_SETTINGS_PATH)) {
    try {
      const content = fs.readFileSync(CLAUDE_SETTINGS_PATH, 'utf-8');
      settings = JSON.parse(content);
      console.log('✅ Found existing Claude settings');
    } catch (error) {
      console.log('⚠️  Could not parse existing settings, creating new file');
      settings = {};
    }
  } else {
    console.log('📝 Creating new Claude settings file');
  }

  // Ensure mcpServers object exists
  if (!settings.mcpServers) {
    settings.mcpServers = {};
  }

  // Add or update google-sheets MCP server
  const serverConfig = {
    command: "node",
    args: [MCP_SERVER_PATH]
  };

  const existingConfig = settings.mcpServers["google-sheets"];
  if (existingConfig && JSON.stringify(existingConfig) === JSON.stringify(serverConfig)) {
    console.log('✅ Google Sheets MCP server already configured correctly');
  } else {
    settings.mcpServers["google-sheets"] = serverConfig;
    console.log('✅ Added Google Sheets MCP server configuration');
  }

  // Write updated settings
  try {
    fs.writeFileSync(CLAUDE_SETTINGS_PATH, JSON.stringify(settings, null, 2) + '\n');
    console.log();
    console.log('═'.repeat(60));
    console.log('✅ SUCCESS! Claude Code settings updated!');
    console.log('═'.repeat(60));
    console.log();
    console.log('📁 Settings file:', CLAUDE_SETTINGS_PATH);
    console.log('🔧 MCP server path:', MCP_SERVER_PATH);
    console.log();
    console.log('⚠️  IMPORTANT: Restart Claude Code for changes to take effect!');
    console.log();
  } catch (error) {
    console.error('❌ Error writing settings file:', error.message);
    console.error('\n💡 You may need to manually add this to your Claude settings:');
    console.error(JSON.stringify({ mcpServers: { "google-sheets": serverConfig } }, null, 2));
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateClaudeSettings();
}
