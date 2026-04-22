export const ALLOWED_EXTENSIONS = ['.md', '.txt'];
export const IGNORE_PATTERNS = [
    '.git/**',
    '.obsidian/**',
    'node_modules/**',
  '.buildflowignore',
    '.*/**'
];
export const DEFAULT_VAULT_FOLDER = 'BuildFlow/Inbox/';
export const TOOL_CALL_TIMEOUT = 20000; // 20 seconds
export const CONFIG_DIR = '~/.buildflow';
export const CONFIG_FILE = 'config.json';
export const AUDIT_LOG_FILE = 'audit.log';
export const INDEX_FILE = 'index.json';
