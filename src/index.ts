#!/usr/bin/env node
/**
 * Google Sheets MCP Server
 *
 * This server provides read-only access to Google Sheets via MCP tools.
 * Authentication uses OAuth 2.0 for secure access to user's spreadsheets.
 *
 * Tools:
 * - google_sheets_get_info: Get spreadsheet metadata from URL
 * - google_sheets_list_tabs: List all tabs/sheets in a spreadsheet
 * - google_sheets_get_tab_data: Get data from a specific tab
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Constants
const CHARACTER_LIMIT = 25000;
const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets.readonly",
  "https://www.googleapis.com/auth/drive.readonly"
];
const TOKEN_PATH = path.join(process.env.HOME || "", ".google-sheets-mcp-token.json");
const CREDENTIALS_PATH = path.join(process.env.HOME || "", ".google-sheets-mcp-credentials.json");

// Response format enum
enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json"
}

// Zod schemas (raw shapes for MCP SDK)
const GetInfoInputSchema = {
  url: z.string()
    .url("Must be a valid URL")
    .describe("Google Sheets URL (e.g., https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit)"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable")
};

const ListTabsInputSchema = {
  url: z.string()
    .url("Must be a valid URL")
    .describe("Google Sheets URL"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable")
};

const GetTabDataInputSchema = {
  url: z.string()
    .url("Must be a valid URL")
    .describe("Google Sheets URL"),
  tab_name: z.string()
    .min(1, "Tab name cannot be empty")
    .describe("Name of the tab/sheet to read (e.g., 'Sheet1', 'Data')"),
  range: z.string()
    .optional()
    .describe("Optional range in A1 notation (e.g., 'A1:D10'). If not specified, reads entire sheet"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable")
};

type GetInfoInput = z.infer<z.ZodObject<typeof GetInfoInputSchema>>;
type ListTabsInput = z.infer<z.ZodObject<typeof ListTabsInputSchema>>;
type GetTabDataInput = z.infer<z.ZodObject<typeof GetTabDataInputSchema>>;

// Utility functions
function extractSpreadsheetId(url: string): string {
  // Extract from: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit...
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match || !match[1]) {
    throw new Error("Invalid Google Sheets URL. Expected format: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit");
  }
  return match[1];
}

function handleError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("Invalid Google Sheets URL")) {
      return `Error: ${error.message}`;
    }
    if (error.message.includes("invalid_grant") || error.message.includes("Token has been expired")) {
      return "Error: Authentication token expired. Please delete ~/.google-sheets-mcp-token.json and restart the server to re-authenticate.";
    }
    if (error.message.includes("Unable to read spreadsheet")) {
      return "Error: Unable to read spreadsheet. Make sure you have access to this sheet.";
    }
    return `Error: ${error.message}`;
  }
  return `Error: Unknown error occurred: ${String(error)}`;
}

function formatCellValue(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

// Authentication
async function getAuthenticatedClient(): Promise<OAuth2Client> {
  // Check if credentials file exists
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(
      `Credentials file not found at ${CREDENTIALS_PATH}.\n` +
      `Please create OAuth 2.0 credentials and save them to this path.\n` +
      `See README.md for setup instructions.`
    );
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
  const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;

  const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

  // Check if we have a saved token
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  // Need to get new token
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  throw new Error(
    `No saved authentication token found.\n` +
    `Please authorize this app by visiting:\n${authUrl}\n\n` +
    `After authorization, the token will be saved automatically.`
  );
}

// Get file owner information from Google Drive
async function getFileOwner(spreadsheetId: string, auth: OAuth2Client): Promise<{ email: string; name: string; created_at: string } | null> {
  try {
    const drive = google.drive({ version: "v3", auth });

    const response = await drive.files.get({
      fileId: spreadsheetId,
      fields: "owners,createdTime,ownedByMe"
    });

    const owners = response.data.owners || [];
    if (owners.length > 0) {
      const owner = owners[0];
      return {
        email: owner.emailAddress || "Unknown",
        name: owner.displayName || "Unknown",
        created_at: response.data.createdTime || "Unknown"
      };
    }

    return null;
  } catch (error) {
    // Silently fail if we can't get owner info - may be permission issue
    return null;
  }
}

// Create MCP server instance
const server = new McpServer({
  name: "google-sheets-mcp-server",
  version: "1.0.0"
});

// Register tools
server.registerTool(
  "google_sheets_get_info",
  {
    title: "Get Google Sheets Info",
    description: `Get metadata and information about a Google Spreadsheet.

This tool retrieves basic information about a spreadsheet including its title, locale, timezone, and list of sheets/tabs. It does NOT read cell data - use google_sheets_get_tab_data for that.

Args:
  - url (string): Full Google Sheets URL (e.g., https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit)
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  For JSON format:
  {
    "spreadsheet_id": string,
    "title": string,
    "locale": string,
    "timezone": string,
    "sheets": [
      {
        "sheet_id": number,
        "title": string,
        "index": number,
        "row_count": number,
        "column_count": number
      }
    ]
  }

  For Markdown format: Human-readable formatted text

Examples:
  - Use when: "What sheets are in this spreadsheet?" -> provide URL
  - Use when: "Tell me about this Google Sheet" -> provide URL
  - Don't use when: You need actual cell data (use google_sheets_get_tab_data instead)

Error Handling:
  - Returns "Error: Invalid Google Sheets URL" if URL format is incorrect
  - Returns "Error: Unable to read spreadsheet" if you lack access
  - Returns "Error: Authentication token expired" if OAuth token needs refresh`,
    inputSchema: GetInfoInputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async (params: GetInfoInput) => {
    try {
      const spreadsheetId = extractSpreadsheetId(params.url);
      const auth = await getAuthenticatedClient();
      const sheets = google.sheets({ version: "v4", auth });

      const response = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: "spreadsheetId,properties,sheets.properties"
      });

      const spreadsheet = response.data;

      // Get owner information
      const ownerInfo = await getFileOwner(spreadsheetId, auth);

      if (params.response_format === ResponseFormat.JSON) {
        const result: any = {
          spreadsheet_id: spreadsheet.spreadsheetId,
          title: spreadsheet.properties?.title || "Untitled",
          locale: spreadsheet.properties?.locale || "unknown",
          timezone: spreadsheet.properties?.timeZone || "unknown"
        };

        // Add owner info if available
        if (ownerInfo) {
          result.owner = {
            name: ownerInfo.name,
            email: ownerInfo.email,
            created_at: ownerInfo.created_at
          };
        } else {
          result.owner = {
            name: "Unknown",
            email: "Not accessible",
            created_at: "Not accessible"
          };
        }

        result.sheets = spreadsheet.sheets?.map(sheet => ({
          sheet_id: sheet.properties?.sheetId || 0,
          title: sheet.properties?.title || "Untitled",
          index: sheet.properties?.index || 0,
          row_count: sheet.properties?.gridProperties?.rowCount || 0,
          column_count: sheet.properties?.gridProperties?.columnCount || 0
        })) || [];

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } else {
        // Markdown format
        const lines: string[] = [];
        lines.push(`# ${spreadsheet.properties?.title || "Untitled Spreadsheet"}`);
        lines.push("");
        lines.push(`**Spreadsheet ID**: ${spreadsheet.spreadsheetId}`);
        lines.push(`**Locale**: ${spreadsheet.properties?.locale || "unknown"}`);
        lines.push(`**Timezone**: ${spreadsheet.properties?.timeZone || "unknown"}`);

        // Add owner info
        if (ownerInfo) {
          lines.push(`**Owner**: ${ownerInfo.name} (${ownerInfo.email})`);
          lines.push(`**Created**: ${ownerInfo.created_at}`);
        } else {
          lines.push(`**Owner**: Not accessible (shared file)`);
        }

        lines.push("");
        lines.push("## Sheets");
        lines.push("");

        if (spreadsheet.sheets && spreadsheet.sheets.length > 0) {
          for (const sheet of spreadsheet.sheets) {
            const props = sheet.properties;
            lines.push(`### ${props?.title || "Untitled"}`);
            lines.push(`- **Sheet ID**: ${props?.sheetId || 0}`);
            lines.push(`- **Index**: ${props?.index || 0}`);
            lines.push(`- **Size**: ${props?.gridProperties?.rowCount || 0} rows × ${props?.gridProperties?.columnCount || 0} columns`);
            lines.push("");
          }
        } else {
          lines.push("No sheets found.");
        }

        return {
          content: [{
            type: "text",
            text: lines.join("\n")
          }]
        };
      }
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: handleError(error)
        }]
      };
    }
  }
);

server.registerTool(
  "google_sheets_list_tabs",
  {
    title: "List Google Sheets Tabs",
    description: `List all tabs/sheets in a Google Spreadsheet.

This tool returns a simple list of all sheet names in the spreadsheet. For more detailed metadata, use google_sheets_get_info instead.

Args:
  - url (string): Full Google Sheets URL
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  For JSON format:
  {
    "spreadsheet_id": string,
    "spreadsheet_title": string,
    "tabs": [
      {
        "title": string,
        "index": number,
        "sheet_id": number
      }
    ]
  }

  For Markdown format: Numbered list of tab names

Examples:
  - Use when: "List all tabs in this spreadsheet"
  - Use when: "What sheets are available?"
  - Don't use when: You need detailed metadata (use google_sheets_get_info)`,
    inputSchema: ListTabsInputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async (params: ListTabsInput) => {
    try {
      const spreadsheetId = extractSpreadsheetId(params.url);
      const auth = await getAuthenticatedClient();
      const sheets = google.sheets({ version: "v4", auth });

      const response = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: "spreadsheetId,properties.title,sheets.properties(title,index,sheetId)"
      });

      const spreadsheet = response.data;
      const tabs = spreadsheet.sheets?.map(sheet => ({
        title: sheet.properties?.title || "Untitled",
        index: sheet.properties?.index || 0,
        sheet_id: sheet.properties?.sheetId || 0
      })) || [];

      if (params.response_format === ResponseFormat.JSON) {
        const result = {
          spreadsheet_id: spreadsheet.spreadsheetId,
          spreadsheet_title: spreadsheet.properties?.title || "Untitled",
          tabs
        };

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } else {
        // Markdown format
        const lines: string[] = [];
        lines.push(`# Tabs in "${spreadsheet.properties?.title || "Untitled"}"`);
        lines.push("");

        if (tabs.length > 0) {
          tabs.sort((a, b) => a.index - b.index);
          for (const tab of tabs) {
            lines.push(`${tab.index + 1}. **${tab.title}** (ID: ${tab.sheet_id})`);
          }
        } else {
          lines.push("No tabs found.");
        }

        return {
          content: [{
            type: "text",
            text: lines.join("\n")
          }]
        };
      }
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: handleError(error)
        }]
      };
    }
  }
);

server.registerTool(
  "google_sheets_get_tab_data",
  {
    title: "Get Google Sheets Tab Data",
    description: `Read cell data from a specific tab/sheet in a Google Spreadsheet.

This tool retrieves the actual cell values from a sheet. You can read the entire sheet or specify a range using A1 notation.

Args:
  - url (string): Full Google Sheets URL
  - tab_name (string): Name of the tab/sheet (e.g., 'Sheet1', 'Data', 'Q4 Sales')
  - range (string, optional): Range in A1 notation (e.g., 'A1:D10', 'B:E'). If not provided, reads entire sheet
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  For JSON format:
  {
    "spreadsheet_id": string,
    "range": string,           // Actual range read (e.g., "Sheet1!A1:D10")
    "row_count": number,
    "column_count": number,
    "values": [
      ["cell1", "cell2", ...],  // Row 1
      ["cell1", "cell2", ...]   // Row 2
    ]
  }

  For Markdown format: Table representation of data

Examples:
  - Use when: "Read all data from the 'Sales' tab"
  - Use when: "Get cells A1 to D10 from Sheet1"
  - Use when: "Show me the data in the Data sheet"
  - Range examples: 'A1:D10', 'B:E', 'A1:Z', 'Sheet1!A1:D10'

Error Handling:
  - Returns "Error: Tab not found" if tab_name doesn't exist
  - Returns "Error: Response exceeds size limit" if data is too large (with guidance on using range parameter)
  - Returns "Error: Invalid range format" if range is malformed`,
    inputSchema: GetTabDataInputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async (params: GetTabDataInput) => {
    try {
      const spreadsheetId = extractSpreadsheetId(params.url);
      const auth = await getAuthenticatedClient();
      const sheetsApi = google.sheets({ version: "v4", auth });

      // Construct range
      let range = params.tab_name;
      if (params.range) {
        // If range doesn't include sheet name, prepend it
        if (!params.range.includes("!")) {
          range = `${params.tab_name}!${params.range}`;
        } else {
          range = params.range;
        }
      }

      const response = await sheetsApi.spreadsheets.values.get({
        spreadsheetId,
        range,
        valueRenderOption: "FORMATTED_VALUE",
        dateTimeRenderOption: "FORMATTED_STRING"
      });

      const values = response.data.values || [];
      const actualRange = response.data.range || range;

      if (values.length === 0) {
        return {
          content: [{
            type: "text",
            text: `No data found in range: ${actualRange}`
          }]
        };
      }

      const rowCount = values.length;
      const columnCount = Math.max(...values.map(row => row.length));

      if (params.response_format === ResponseFormat.JSON) {
        const result = {
          spreadsheet_id: spreadsheetId,
          range: actualRange,
          row_count: rowCount,
          column_count: columnCount,
          values: values
        };

        const jsonText = JSON.stringify(result, null, 2);

        // Check character limit
        if (jsonText.length > CHARACTER_LIMIT) {
          return {
            content: [{
              type: "text",
              text: `Error: Response exceeds size limit (${jsonText.length} > ${CHARACTER_LIMIT} characters).\n` +
                    `Try specifying a smaller range using the 'range' parameter (e.g., 'A1:Z100').`
            }]
          };
        }

        return {
          content: [{
            type: "text",
            text: jsonText
          }]
        };
      } else {
        // Markdown format - create table
        const lines: string[] = [];
        lines.push(`# Data from ${actualRange}`);
        lines.push("");
        lines.push(`**Rows**: ${rowCount} | **Columns**: ${columnCount}`);
        lines.push("");

        // Create markdown table (limit to reasonable size)
        const maxRowsToShow = 100;
        const rowsToShow = Math.min(values.length, maxRowsToShow);

        if (values.length > 0) {
          // Header row
          const headers = values[0].map((cell, idx) => formatCellValue(cell) || `Col${idx + 1}`);
          lines.push("| " + headers.join(" | ") + " |");
          lines.push("| " + headers.map(() => "---").join(" | ") + " |");

          // Data rows
          for (let i = 1; i < rowsToShow; i++) {
            const row = values[i];
            const cells = [];
            for (let j = 0; j < columnCount; j++) {
              cells.push(formatCellValue(row[j] || ""));
            }
            lines.push("| " + cells.join(" | ") + " |");
          }

          if (values.length > maxRowsToShow) {
            lines.push("");
            lines.push(`*... and ${values.length - maxRowsToShow} more rows not shown. Use 'response_format: json' or specify a smaller range for complete data.*`);
          }
        }

        const markdownText = lines.join("\n");

        // Check character limit
        if (markdownText.length > CHARACTER_LIMIT) {
          return {
            content: [{
              type: "text",
              text: `Error: Response exceeds size limit (${markdownText.length} > ${CHARACTER_LIMIT} characters).\n` +
                    `Try specifying a smaller range using the 'range' parameter (e.g., 'A1:Z50').`
            }]
          };
        }

        return {
          content: [{
            type: "text",
            text: markdownText
          }]
        };
      }
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: handleError(error)
        }]
      };
    }
  }
);

// Search tools
const SearchFilesInputSchema = {
  query: z.string()
    .describe("Search query (filename, creator email, etc.)"),
  file_type: z.enum(["spreadsheet", "document", "any"])
    .default("any")
    .describe("Type of files to search for"),
  max_results: z.number()
    .default(10)
    .describe("Maximum number of results to return (1-50)")
};

type SearchFilesInput = z.infer<z.ZodObject<typeof SearchFilesInputSchema>>;

server.registerTool(
  "google_drive_search_files",
  {
    title: "Search Google Drive by Filename",
    description: `Search your Google Drive for files by name and other properties.

This tool searches for files in your Google Drive based on filename, creator, and other metadata.

Args:
  - query (string): Search query (e.g., "V2-3043", "test", "pilar")
  - file_type (string): Filter by file type - "spreadsheet", "document", or "any" (default: "any")
  - max_results (number): Maximum results to return, 1-50 (default: 10)

Returns:
  List of files with:
  - id: File ID (can be used with other tools)
  - name: File name
  - owner: Owner email
  - created_time: Creation date
  - modified_time: Last modified date
  - web_view_link: Link to open in browser`,
    inputSchema: SearchFilesInputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async (params: SearchFilesInput) => {
    try {
      const auth = await getAuthenticatedClient();
      const drive = google.drive({ version: "v3", auth });

      // Build search query
      let q = `name contains '${params.query}' and trashed=false`;
      if (params.file_type === "spreadsheet") {
        q += ` and mimeType='application/vnd.google-apps.spreadsheet'`;
      } else if (params.file_type === "document") {
        q += ` and mimeType='application/vnd.google-apps.document'`;
      }

      const response = await drive.files.list({
        q,
        spaces: "drive",
        fields: "files(id,name,owners,createdTime,modifiedTime,webViewLink,mimeType)",
        pageSize: Math.min(params.max_results, 50),
        orderBy: "modifiedTime desc"
      });

      const files = response.data.files || [];

      if (files.length === 0) {
        return {
          content: [{
            type: "text",
            text: `No files found matching: "${params.query}"`
          }]
        };
      }

      const results = files.map(file => ({
        id: file.id,
        name: file.name,
        owner: file.owners?.[0]?.emailAddress || "Unknown",
        created_time: file.createdTime,
        modified_time: file.modifiedTime,
        web_view_link: file.webViewLink,
        mime_type: file.mimeType
      }));

      const text = `Found ${results.length} file(s):\n\n${results.map((f, i) =>
        `${i + 1}. **${f.name}**\n` +
        `   - ID: ${f.id}\n` +
        `   - Owner: ${f.owner}\n` +
        `   - Created: ${f.created_time}\n` +
        `   - Modified: ${f.modified_time}\n` +
        `   - Link: ${f.web_view_link}`
      ).join("\n\n")}`;

      return {
        content: [{
          type: "text",
          text
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: handleError(error)
        }]
      };
    }
  }
);

const SearchContentInputSchema = {
  search_term: z.string()
    .describe("Text to search for in spreadsheet contents"),
  spreadsheet_id: z.string()
    .optional()
    .describe("Optional: Specific spreadsheet ID to search in. If not provided, searches filenames instead."),
  max_results: z.number()
    .default(5)
    .describe("Maximum number of results to return")
};

type SearchContentInput = z.infer<z.ZodObject<typeof SearchContentInputSchema>>;

server.registerTool(
  "google_drive_search_content",
  {
    title: "Search Spreadsheet Contents",
    description: `Search for text within Google Sheets spreadsheet contents.

This tool searches through the data in your spreadsheets for specific text/values.

Args:
  - search_term (string): Text to search for
  - spreadsheet_id (string): Optional - Specific spreadsheet ID to search. Get from google_drive_search_files
  - max_results (number): Maximum matching rows to return (default: 5)

Returns:
  Matching rows with sheet name, row number, and cell values`,
    inputSchema: SearchContentInputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async (params: SearchContentInput) => {
    try {
      if (!params.spreadsheet_id) {
        return {
          content: [{
            type: "text",
            text: "Spreadsheet ID is required for content search. Use google_drive_search_files first to find the spreadsheet ID, then provide it here."
          }]
        };
      }

      const auth = await getAuthenticatedClient();
      const sheets = google.sheets({ version: "v4", auth });

      // Get all sheets in the spreadsheet
      const spreadsheetResponse = await sheets.spreadsheets.get({
        spreadsheetId: params.spreadsheet_id,
        fields: "sheets.properties"
      });

      const sheetsList = spreadsheetResponse.data.sheets || [];
      const results: any[] = [];

      // Search in each sheet
      for (const sheet of sheetsList) {
        if (results.length >= params.max_results) break;

        const sheetName = sheet.properties?.title || "Unknown";
        const dataResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: params.spreadsheet_id,
          range: `'${sheetName}'`
        });

        const values = dataResponse.data.values || [];

        // Search through all cells
        for (let rowIdx = 0; rowIdx < values.length; rowIdx++) {
          if (results.length >= params.max_results) break;

          const row = values[rowIdx];
          for (let colIdx = 0; colIdx < row.length; colIdx++) {
            const cell = String(row[colIdx]).toLowerCase();
            if (cell.includes(params.search_term.toLowerCase())) {
              results.push({
                sheet: sheetName,
                row: rowIdx + 1,
                column: colIdx + 1,
                value: row[colIdx],
                context: row.join(" | ")
              });
              break;
            }
          }
        }
      }

      if (results.length === 0) {
        return {
          content: [{
            type: "text",
            text: `No matches found for "${params.search_term}" in this spreadsheet`
          }]
        };
      }

      const text = `Found ${results.length} matching row(s):\n\n${results.map((r, i) =>
        `${i + 1}. **${r.sheet}** - Row ${r.row}, Column ${r.column}\n` +
        `   Value: ${r.value}\n` +
        `   Context: ${r.context.substring(0, 100)}...`
      ).join("\n\n")}`;

      return {
        content: [{
          type: "text",
          text
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: handleError(error)
        }]
      };
    }
  }
);

// Main function
async function main() {
  console.error("Google Sheets MCP Server starting...");

  // Check for credentials
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error(`\nERROR: OAuth credentials file not found at: ${CREDENTIALS_PATH}`);
    console.error("\nPlease follow setup instructions in README.md to create credentials.");
    process.exit(1);
  }

  // Create transport
  const transport = new StdioServerTransport();

  // Connect server to transport
  await server.connect(transport);

  console.error("Google Sheets MCP Server running via stdio");
}

// Run the server
main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
