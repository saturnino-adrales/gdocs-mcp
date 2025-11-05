# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-11-05

### Added
- Initial release of Google Sheets MCP Server
- OAuth 2.0 authentication for secure Google Sheets access
- Two setup options: request pre-configured credentials or create your own
- Read-only access to Google Sheets and Google Drive
- Three core tools:
  - `google_sheets_get_info` - Get spreadsheet metadata (title, tabs, owner, creation date)
  - `google_sheets_list_tabs` - List all tabs/sheets in a spreadsheet
  - `google_sheets_get_tab_data` - Read cell data from specific tabs with A1 notation support
- Two search tools:
  - `google_drive_search_files` - Search Google Drive by filename
  - `google_drive_search_content` - Search within spreadsheet contents
- Flexible output formats (Markdown and JSON)
- Character limit protection (25,000 characters) with helpful error messages
- Comprehensive error handling and user-friendly error messages
- TypeScript implementation with full type safety
- Detailed setup documentation (README.md and SETUP_GUIDE.md)

### Security
- Read-only Google Sheets API scope (`spreadsheets.readonly`)
- Read-only Google Drive API scope (`drive.readonly`)
- Local OAuth token storage in user's home directory
- No third-party data transmission
- Secure credential management with `.gitignore` protection

[1.0.0]: https://github.com/saturnino-adrales/gdocs-mcp/releases/tag/v1.0.0
