export type FileType = 'file' | 'folder';

export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: FileType;
  content?: string;
  language?: string;
  parentId: string | null;
  isOpen?: boolean;
  isModified?: boolean;
  isNew?: boolean;
}

export interface EditorTab {
  id: string;
  fileId: string;
  title: string;
  path: string;
  language: string;
  isDirty?: boolean;
  cursorPos?: { line: number; col: number };
}

export type ThemeId = 
  | 'vs-dark-plus' 
  | 'vs-light-plus' 
  | 'dracula' 
  | 'one-dark-pro' 
  | 'github-dark' 
  | 'github-light' 
  | 'monokai'
  | 'tokyo-night';

export interface ThemeColors {
  bg: string;
  sidebarBg: string;
  activityBarBg: string;
  activityBarActive: string;
  activityBarText: string;
  activityBarActiveText: string;
  statusBarBg: string;
  statusBarText: string;
  editorBg: string;
  editorGutter: string;
  editorLineNum: string;
  editorActiveLine: string;
  editorSelection: string;
  editorText: string;
  editorBorder: string;
  tabActiveBg: string;
  tabActiveText: string;
  tabInactiveBg: string;
  tabInactiveText: string;
  tabBorder: string;
  terminalBg: string;
  terminalText: string;
  accent: string;
  accentHover: string;
  panelHeaderBg: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  badgeBg: string;
  badgeText: string;
  // Syntax tokens
  tokenKeyword: string;
  tokenString: string;
  tokenFunction: string;
  tokenComment: string;
  tokenNumber: string;
  tokenType: string;
  tokenVariable: string;
  tokenOperator: string;
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  type: 'dark' | 'light';
  colors: ThemeColors;
}

export type SidebarView = 
  | 'explorer' 
  | 'search' 
  | 'git' 
  | 'kilo-ai' 
  | 'colab' 
  | 'extensions' 
  | 'settings';

export type BottomTab = 'terminal' | 'output' | 'problems' | 'colab-runner';

export interface AIAction {
  id: string;
  type: 'write_file' | 'edit_file' | 'colab_run' | 'create_folder';
  path?: string;
  content?: string;
  search?: string;
  replace?: string;
  status: 'pending' | 'applied' | 'rejected';
  diffPreview?: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model?: string;
  actions?: AIAction[];
  isStreaming?: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  provider: 'google' | 'kilo-openrouter' | 'custom';
  free: boolean;
  recommended: boolean;
  contextLength: string;
  description: string;
}

export interface ColabRuntimeState {
  status: 'disconnected' | 'connecting' | 'connected' | 'pyodide_ready';
  type: 'pyodide' | 'colab_tunnel' | 'websocket';
  url: string;
  token: string;
  gpuInfo: string;
  pythonVersion: string;
  ramUsage: string;
  gpuUsage: string;
  isRunning: boolean;
  executionCount: number;
  lastOutput?: string;
}

export interface TerminalLog {
  id: string;
  type: 'stdout' | 'stderr' | 'info' | 'command' | 'success';
  text: string;
  timestamp: string;
  executionId?: number;
}

export interface DiffReviewState {
  isOpen: boolean;
  fileId: string;
  filePath: string;
  originalContent: string;
  proposedContent: string;
  actionId?: string;
}
