import React, { useState, useEffect, useRef } from 'react';
import { 
  FileNode, 
  EditorTab, 
  ThemeId, 
  SidebarView, 
  AIModel, 
  AIMessage, 
  AIAction, 
  TerminalLog, 
  DiffReviewState 
} from './types/vscode';
import { VSCODE_THEMES } from './utils/themes';
import { INITIAL_WORKSPACE_FILES } from './utils/defaultWorkspace';
import { executePythonScript } from './utils/pythonRunner';
import { ActivityBar } from './components/vscode/ActivityBar';
import { Sidebar } from './components/vscode/Sidebar';
import { EditorArea } from './components/vscode/EditorArea';
import { KiloAIAssistant } from './components/vscode/KiloAIAssistant';
import { BottomPanel } from './components/vscode/BottomPanel';
import { StatusBar } from './components/vscode/StatusBar';
import { MobileCodingToolbar } from './components/vscode/MobileCodingToolbar';
import { DiffViewerModal } from './components/vscode/DiffViewerModal';
import { ColabConnectModal } from './components/vscode/ColabConnectModal';
import { CommandPalette } from './components/vscode/CommandPalette';
import JSZip from 'jszip';
import { 
  Bot, 
  Play, 
  Sparkles, 
  Zap, 
  Search, 
  Menu,
  Terminal,
  Files,
  Settings
} from 'lucide-react';

export default function App() {
  // 1. Files State with LocalStorage cache
  const [files, setFiles] = useState<FileNode[]>(() => {
    const saved = localStorage.getItem('kilo_vscode_workspace');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved workspace:', e);
      }
    }
    return INITIAL_WORKSPACE_FILES;
  });

  // 2. Tabs State
  const [tabs, setTabs] = useState<EditorTab[]>([
    {
      id: 'tab-main-py',
      fileId: 'file-main-py',
      title: 'main.py',
      path: 'src/main.py',
      language: 'python',
      isDirty: false,
    },
    {
      id: 'tab-model-py',
      fileId: 'file-model-py',
      title: 'model.py',
      path: 'src/model.py',
      language: 'python',
      isDirty: false,
    },
  ]);

  const [activeTabId, setActiveTabId] = useState<string | null>('tab-main-py');

  // 3. UI Panels State
  const [activeView, setActiveView] = useState<SidebarView | null>('explorer');
  const [isAIPanelOpen, setIsAIPanelOpen] = useState<boolean>(true);
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState<boolean>(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // 4. Themes State
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>(() => {
    return (localStorage.getItem('kilo_vscode_theme') as ThemeId) || 'vs-dark-plus';
  });
  const theme = VSCODE_THEMES[currentThemeId] || VSCODE_THEMES['vs-dark-plus'];

  // 5. Editor Config
  const [fontSize, setFontSize] = useState<number>(13);
  const [autoSave, setAutoSave] = useState<boolean>(true);

  // 6. Terminal & Execution Logs
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([
    {
      id: 'init-1',
      type: 'info',
      text: '🚀 VS Code Web + Kilo Code AI Engine inicializado.',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 'init-2',
      type: 'success',
      text: '⚡ [Google Colab Bridge] Runtime pronto: Python 3.11 / CUDA 12.2 / Tesla T4.',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  // 7. Kilo AI State
  const [models, setModels] = useState<AIModel[]>([
    {
      id: 'gemini-3.7-flash',
      name: 'Gemini 3.7 Flash',
      provider: 'google',
      free: true,
      recommended: true,
      contextLength: '1M tokens',
      description: 'Modelo híbrido rápido para raciocínio e geração de código.',
    },
    {
      id: 'gemini-3.1-flash-lite',
      name: 'Gemini 3.1 Flash Lite',
      provider: 'google',
      free: true,
      recommended: false,
      contextLength: '1M tokens',
      description: 'Ultra-rápido para edições rápidas e correções.',
    },
    {
      id: 'deepseek-coder-v3',
      name: 'DeepSeek Coder V3',
      provider: 'kilo-openrouter',
      free: true,
      recommended: true,
      contextLength: '64k tokens',
      description: 'Especialista em síntese de código e frameworks ML.',
    },
    {
      id: 'qwen-2.5-coder-32b',
      name: 'Qwen 2.5 Coder 32B',
      provider: 'kilo-openrouter',
      free: true,
      recommended: false,
      contextLength: '32k tokens',
      description: 'Excelente para pipelines complexos e manipulação de tensores.',
    },
    {
      id: 'llama-3.3-70b-instruct',
      name: 'Llama 3.3 70B Instruct',
      provider: 'kilo-openrouter',
      free: true,
      recommended: false,
      contextLength: '128k tokens',
      description: 'Raciocínio avançado de dados e machine learning.',
    },
  ]);

  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.7-flash');
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Olá! Sou o **Kilo Code AI Assistant**. 🚀

Estou conectado ao seu workspace e posso:
1. ✍️ **Criar e editar arquivos** diretamente no seu projeto (como novos modelos PyTorch ou notebooks).
2. ⚡ **Otimizar código para GPU do Google Colab** (CUDA / cuDNN).
3. 🔍 **Revisar diffs** antes de aceitar alterações.
4. 🧪 **Executar scripts** no terminal integrado.

Como posso ajudar no seu projeto hoje?`,
      timestamp: new Date().toLocaleTimeString(),
      model: 'gemini-3.7-flash',
    },
  ]);
  const [isAILoading, setIsAILoading] = useState<boolean>(false);

  // 8. Modals
  const [diffReview, setDiffReview] = useState<DiffReviewState>({
    isOpen: false,
    fileId: '',
    filePath: '',
    originalContent: '',
    proposedContent: '',
  });
  const [isColabModalOpen, setIsColabModalOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  // Save workspace to localStorage when modified
  useEffect(() => {
    localStorage.setItem('kilo_vscode_workspace', JSON.stringify(files));
  }, [files]);

  // Save theme
  useEffect(() => {
    localStorage.setItem('kilo_vscode_theme', currentThemeId);
  }, [currentThemeId]);

  // Keyboard shortcut listener (Ctrl+Shift+P, Ctrl+`, Ctrl+S, etc.)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+P or F1 for Command Palette
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      // Ctrl+` for Terminal
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        setIsBottomPanelOpen((prev) => !prev);
      }
      // Ctrl+B for Sidebar
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setActiveView((prev) => (prev ? null : 'explorer'));
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Active File Node
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const activeFile = files.find((f) => f.id === activeTab?.fileId) || null;

  // File Handlers
  const handleSelectFile = (file: FileNode) => {
    if (file.type !== 'file') return;

    const existingTab = tabs.find((t) => t.fileId === file.id);
    if (existingTab) {
      setActiveTabId(existingTab.id);
    } else {
      const newTab: EditorTab = {
        id: `tab-${file.id}`,
        fileId: file.id,
        title: file.name,
        path: file.path,
        language: file.language || 'plaintext',
        isDirty: false,
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTab.id);
    }
  };

  const handleCloseTab = (tabId: string) => {
    const newTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null);
    }
  };

  const handleUpdateFileContent = (fileId: string, newContent: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, content: newContent, isModified: true } : f))
    );
    // Mark active tab dirty if autoSave is off
    if (!autoSave) {
      setTabs((prev) =>
        prev.map((t) => (t.fileId === fileId ? { ...t, isDirty: true } : t))
      );
    }
  };

  const handleToggleFolder = (folderId: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === folderId ? { ...f, isOpen: !f.isOpen } : f))
    );
  };

  const handleDeleteNode = (nodeId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== nodeId && f.parentId !== nodeId));
    // Close tab if deleted
    const tabToRemove = tabs.find((t) => t.fileId === nodeId);
    if (tabToRemove) {
      handleCloseTab(tabToRemove.id);
    }
  };

  const handleRenameNode = (nodeId: string, newName: string) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id === nodeId) {
          const parts = f.path.split('/');
          parts[parts.length - 1] = newName;
          const newPath = parts.join('/');
          return { ...f, name: newName, path: newPath };
        }
        return f;
      })
    );
    // Update tab title
    setTabs((prev) =>
      prev.map((t) => (t.fileId === nodeId ? { ...t, title: newName } : t))
    );
  };

  const handleCreateNew = (parentId: string | null, type: 'file' | 'folder') => {
    const id = `node-${Date.now()}`;
    const defaultName = type === 'file' ? 'novo_script.py' : 'nova_pasta';
    const parent = files.find((f) => f.id === parentId);
    const parentPath = parent ? `${parent.path}/` : '';
    const newPath = `${parentPath}${defaultName}`;

    const newNode: FileNode = {
      id,
      name: defaultName,
      path: newPath,
      type,
      parentId,
      isOpen: type === 'folder' ? true : undefined,
      content: type === 'file' ? '# Código criado no VS Code Web\n\n' : undefined,
      language: type === 'file' ? 'python' : undefined,
      isModified: true,
    };

    setFiles((prev) => [...prev, newNode]);

    if (type === 'file') {
      handleSelectFile(newNode);
    }
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const newNode: FileNode = {
        id: `file-uploaded-${Date.now()}`,
        name: file.name,
        path: file.name,
        type: 'file',
        parentId: null,
        content: content || '',
        language: file.name.endsWith('.py') ? 'python' : file.name.endsWith('.json') ? 'json' : 'plaintext',
        isModified: true,
      };
      setFiles((prev) => [...prev, newNode]);
      handleSelectFile(newNode);
    };
    reader.readAsText(file);
  };

  // Run File in Python Kernel / Colab
  const handleRunFile = async (file: FileNode | null) => {
    const target = file || activeFile;
    if (!target || !target.content) return;

    setIsBottomPanelOpen(true);
    await executePythonScript(target.content, target.path, (log) => {
      setTerminalLogs((prev) => [...prev, log]);
    });
  };

  const handleRunCustomCommand = async (cmd: string) => {
    setTerminalLogs((prev) => [
      ...prev,
      {
        id: `cmd-${Date.now()}`,
        type: 'command',
        text: cmd,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);

    if (cmd.startsWith('python ') || cmd.endsWith('.py')) {
      const fileName = cmd.replace('python ', '').trim();
      const matched = files.find((f) => f.path === fileName || f.name === fileName);
      if (matched && matched.content) {
        await executePythonScript(matched.content, matched.path, (log) => {
          setTerminalLogs((prev) => [...prev, log]);
        });
      } else {
        setTerminalLogs((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            type: 'stderr',
            text: `python: can't open file '${fileName}': [Errno 2] No such file or directory`,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }
    } else if (cmd.startsWith('!nvidia-smi') || cmd === 'nvidia-smi') {
      setTerminalLogs((prev) => [
        ...prev,
        {
          id: `gpu-${Date.now()}`,
          type: 'info',
          text: `+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 535.104.05             Driver Version: 535.104.05   CUDA Version: 12.2     |
|   0  Tesla T4                       Off |   00000000:00:04.0 Off |                    0 |
| N/A   42C    P0             28W /  70W  |    1420MiB / 15360MiB  |      8%      Default |
+-----------------------------------------------------------------------------------------+`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } else if (cmd.startsWith('!pip') || cmd.startsWith('pip ')) {
      setTerminalLogs((prev) => [
        ...prev,
        {
          id: `pip-${Date.now()}`,
          type: 'stdout',
          text: `Requirement already satisfied: torch in /usr/local/lib/python3.11/dist-packages`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } else if (cmd === 'clear' || cmd === 'cls') {
      setTerminalLogs([]);
    } else {
      setTerminalLogs((prev) => [
        ...prev,
        {
          id: `out-${Date.now()}`,
          type: 'stdout',
          text: `[Executed: ${cmd}] (Exit status 0)`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }
  };

  // AI Chat & Code Actions
  const handleSendMessageToAI = async (userPrompt: string, contextFiles: FileNode[]) => {
    if (!userPrompt.trim() || isAILoading) return;

    const userMessage: AIMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: userPrompt,
      timestamp: new Date().toLocaleTimeString(),
    };

    setAiMessages((prev) => [...prev, userMessage]);
    setIsAILoading(true);

    const assistantMessageId = `msg-ai-${Date.now()}`;
    const initialAssistantMessage: AIMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString(),
      model: selectedModel,
      isStreaming: true,
    };

    setAiMessages((prev) => [...prev, initialAssistantMessage]);

    try {
      const response = await fetch('/api/kilo/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...aiMessages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model: selectedModel,
          workspaceFiles: files.filter((f) => f.type === 'file').map((f) => ({
            path: f.path,
            content: f.content,
            language: f.language,
          })),
          activeFile: activeFile ? { path: activeFile.path, content: activeFile.content } : null,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errJson.error || `HTTP ${response.status}`);
      }

      // Read SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';

      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.replace('data: ', ''));
                  if (data.text) {
                    accumulatedText += data.text;
                    setAiMessages((prev) =>
                      prev.map((m) =>
                        m.id === assistantMessageId ? { ...m, content: accumulatedText } : m
                      )
                    );
                  }
                } catch (e) {
                  // Ignore JSON parse chunk boundary
                }
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Kilo AI stream error:', err);
      setAiMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                content: `⚠️ Desculpe, ocorreu um erro ao se comunicar com o modelo ${selectedModel}:\n${err.message}\n\nVerifique se o backend está ativo ou selecione outro modelo gratuito no menu superior.`,
                isStreaming: false,
              }
            : m
        )
      );
    } finally {
      setIsAILoading(false);
      setAiMessages((prev) =>
        prev.map((m) => (m.id === assistantMessageId ? { ...m, isStreaming: false } : m))
      );
    }
  };

  // Apply Action (Autonomous File Creation or Update)
  const handleApplyAIAction = (action: AIAction) => {
    if (!action.path || !action.content) return;

    const existingFile = files.find((f) => f.path === action.path || f.name === action.path);

    if (existingFile) {
      // Update existing
      handleUpdateFileContent(existingFile.id, action.content);
      handleSelectFile(existingFile);
    } else {
      // Create new
      const newId = `file-${Date.now()}`;
      const name = action.path.split('/').pop() || action.path;
      const newNode: FileNode = {
        id: newId,
        name,
        path: action.path,
        type: 'file',
        parentId: null,
        content: action.content,
        language: action.path.endsWith('.py') ? 'python' : 'plaintext',
        isModified: true,
      };
      setFiles((prev) => [...prev, newNode]);
      handleSelectFile(newNode);
    }

    setTerminalLogs((prev) => [
      ...prev,
      {
        id: `act-${Date.now()}`,
        type: 'success',
        text: `✨ [Kilo Code AI] Arquivo '${action.path}' criado/atualizado com sucesso no workspace!`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const handleReviewDiff = (filePath: string, proposedContent: string, actionId: string) => {
    const existing = files.find((f) => f.path === filePath || f.name === filePath);
    const originalContent = existing?.content || '';

    setDiffReview({
      isOpen: true,
      fileId: existing?.id || '',
      filePath,
      originalContent,
      proposedContent,
      actionId,
    });
  };

  const handleAcceptDiff = () => {
    if (!diffReview.filePath || !diffReview.proposedContent) return;

    handleApplyAIAction({
      id: diffReview.actionId || `act-${Date.now()}`,
      type: 'write_file',
      path: diffReview.filePath,
      content: diffReview.proposedContent,
      status: 'applied',
    });

    setDiffReview((prev) => ({ ...prev, isOpen: false }));
  };

  const handleDownloadWorkspaceZip = async () => {
    const zip = new JSZip();
    files.forEach((file) => {
      if (file.type === 'file' && file.content !== undefined) {
        zip.file(file.path, file.content);
      }
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kilo-vscode-colab-${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleTheme = () => {
    const themeKeys = Object.keys(VSCODE_THEMES) as ThemeId[];
    const currentIdx = themeKeys.indexOf(currentThemeId);
    const nextTheme = themeKeys[(currentIdx + 1) % themeKeys.length];
    setCurrentThemeId(nextTheme);
  };

  return (
    <div
      id="vscode-root-application"
      className="flex flex-col h-screen w-screen overflow-hidden font-sans select-none"
      style={{
        backgroundColor: theme.colors.bg,
        color: theme.colors.editorText,
      }}
    >
      {/* TOP HEADER / APP BAR */}
      <div 
        id="vscode-top-titlebar"
        className="flex items-center justify-between px-3 h-9 border-b select-none shrink-0 z-20"
        style={{
          backgroundColor: theme.colors.sidebarBg,
          borderColor: theme.colors.editorBorder,
          color: theme.colors.editorText,
        }}
      >
        {/* Left branding */}
        <div className="flex items-center gap-2">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
            className="md:hidden p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
            title="Abrir Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-1.5 font-bold text-xs">
            <span 
              className="w-4 h-4 rounded-xs flex items-center justify-center text-[10px] text-white font-mono"
              style={{ backgroundColor: theme.colors.accent }}
            >
              V
            </span>
            <span className="hidden sm:inline">VS Code</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-normal bg-blue-500/20 text-blue-400">
              Kilo Code + Colab
            </span>
          </div>
        </div>

        {/* Center Command Palette Bar */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center justify-center gap-2 px-3 py-1 rounded-md border text-xs max-w-sm w-full mx-2 opacity-85 hover:opacity-100 transition-opacity"
          style={{
            backgroundColor: theme.colors.inputBg,
            borderColor: theme.colors.inputBorder,
            color: theme.colors.inputText,
          }}
        >
          <Search className="w-3.5 h-3.5 opacity-50" />
          <span className="truncate">workspace: {activeFile?.name || 'main.py'} (Ctrl+Shift+P)</span>
        </button>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Colab Connect Button */}
          <button
            onClick={() => setIsColabModalOpen(true)}
            className="flex items-center gap-1 px-2 py-0.8 rounded text-xs font-semibold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
            title="Conectar ao Google Colab GPU"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-300" />
            <span className="hidden sm:inline">Colab GPU</span>
          </button>

          {/* Toggle AI Button */}
          <button
            onClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
            className={`p-1.5 rounded transition-colors ${
              isAIPanelOpen ? 'text-white' : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: isAIPanelOpen ? theme.colors.accent : 'transparent',
            }}
            title="Alternar Kilo Code AI Assistant"
          >
            <Bot className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MAIN BODY (Activity Bar + Sidebar + Editor + AI Assistant) */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Activity Bar (Desktop) */}
        <ActivityBar
          activeView={activeView}
          onSelectView={(v) => setActiveView(activeView === v ? null : v)}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenSettings={() => setActiveView('settings')}
          gitModifiedCount={files.filter((f) => f.isModified).length}
          aiPendingCount={0}
        />

        {/* Sidebar Panel (Collapsible) */}
        {(activeView || isMobileDrawerOpen) && (
          <Sidebar
            activeView={activeView || 'explorer'}
            onClose={() => {
              setActiveView(null);
              setIsMobileDrawerOpen(false);
            }}
            files={files}
            activeFileId={activeFile?.id || null}
            onSelectFile={(f) => {
              handleSelectFile(f);
              setIsMobileDrawerOpen(false);
            }}
            onToggleFolder={handleToggleFolder}
            onDeleteNode={handleDeleteNode}
            onRenameNode={handleRenameNode}
            onCreateNew={handleCreateNew}
            theme={theme}
            onChangeTheme={setCurrentThemeId}
            colabStatus="connected"
            onConnectColab={() => setIsColabModalOpen(true)}
            onRunActiveFile={() => handleRunFile(activeFile)}
            models={models}
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
            fontSize={fontSize}
            onChangeFontSize={setFontSize}
            autoSave={autoSave}
            onToggleAutoSave={() => setAutoSave(!autoSave)}
            onUploadFile={handleUploadFile}
          />
        )}

        {/* Center Workspace (Editor + Bottom Panel) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Code Editor */}
          <EditorArea
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={setActiveTabId}
            onCloseTab={handleCloseTab}
            activeFile={activeFile}
            onUpdateFileContent={handleUpdateFileContent}
            theme={theme}
            fontSize={fontSize}
            onRunFile={handleRunFile}
            onAskAIAboutSelection={(selectedText) => {
              setIsAIPanelOpen(true);
              handleSendMessageToAI(
                `Explique e refatore o seguinte trecho selecionado:\n\`\`\`python\n${selectedText}\n\`\`\``,
                activeFile ? [activeFile] : []
              );
            }}
          />

          {/* Bottom Terminal & Colab Panel */}
          <BottomPanel
            isOpen={isBottomPanelOpen}
            onClose={() => setIsBottomPanelOpen(false)}
            logs={terminalLogs}
            onClearLogs={() => setTerminalLogs([])}
            onRunCustomCommand={handleRunCustomCommand}
            theme={theme}
            activeFileTitle={activeFile?.name}
            onRunCurrentFile={() => handleRunFile(activeFile)}
          />
        </div>

        {/* Right Kilo Code AI Assistant (Desktop & Toggleable) */}
        {isAIPanelOpen && (
          <KiloAIAssistant
            messages={aiMessages}
            onSendMessage={handleSendMessageToAI}
            onClearHistory={() => setAiMessages([])}
            files={files}
            activeFile={activeFile}
            models={models}
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
            onApplyAction={handleApplyAIAction}
            onReviewDiff={handleReviewDiff}
            onRunInColab={(code) => {
              setIsBottomPanelOpen(true);
              executePythonScript(code, 'colab_cell.py', (log) => {
                setTerminalLogs((prev) => [...prev, log]);
              });
            }}
            theme={theme}
            isLoading={isAILoading}
          />
        )}
      </div>

      {/* MOBILE CODING TOUCH TOOLBAR */}
      <MobileCodingToolbar
        onInsertSymbol={(symbol) => {
          if (activeFile) {
            handleUpdateFileContent(activeFile.id, (activeFile.content || '') + symbol);
          }
        }}
        onOpenAI={() => setIsAIPanelOpen(true)}
        onRunCode={() => handleRunFile(activeFile)}
        onToggleSidebar={() => setActiveView(activeView ? null : 'explorer')}
        onToggleTerminal={() => setIsBottomPanelOpen(!isBottomPanelOpen)}
        theme={theme}
      />

      {/* BOTTOM STATUS BAR */}
      <StatusBar
        branch="main"
        problemsCount={0}
        colabStatus="connected"
        cursorPos={{ line: 1, col: 1 }}
        language={activeFile?.language || 'python'}
        theme={theme}
        onToggleTerminal={() => setIsBottomPanelOpen(!isBottomPanelOpen)}
        onToggleColabModal={() => setIsColabModalOpen(true)}
        onToggleAI={() => setIsAIPanelOpen(!isAIPanelOpen)}
        onToggleTheme={toggleTheme}
      />

      {/* DIFF VIEWER MODAL */}
      <DiffViewerModal
        isOpen={diffReview.isOpen}
        onClose={() => setDiffReview((prev) => ({ ...prev, isOpen: false }))}
        filePath={diffReview.filePath}
        originalContent={diffReview.originalContent}
        proposedContent={diffReview.proposedContent}
        onAccept={handleAcceptDiff}
        onReject={() => setDiffReview((prev) => ({ ...prev, isOpen: false }))}
        theme={theme}
      />

      {/* COLAB PAIRING MODAL */}
      <ColabConnectModal
        isOpen={isColabModalOpen}
        onClose={() => setIsColabModalOpen(false)}
        theme={theme}
      />

      {/* COMMAND PALETTE */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        files={files}
        onSelectFile={handleSelectFile}
        onRunCurrentFile={() => handleRunFile(activeFile)}
        onOpenAI={() => setIsAIPanelOpen(true)}
        onChangeTheme={setCurrentThemeId}
        onDownloadZip={handleDownloadWorkspaceZip}
        onToggleTerminal={() => setIsBottomPanelOpen(true)}
        theme={theme}
      />
    </div>
  );
}
