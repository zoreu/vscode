import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Play, 
  Bot, 
  Palette, 
  FileCode, 
  Download, 
  Trash2, 
  Sparkles,
  Terminal,
  Zap
} from 'lucide-react';
import { FileNode, ThemeConfig, ThemeId } from '../../types/vscode';
import { VSCODE_THEMES } from '../../utils/themes';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileNode[];
  onSelectFile: (file: FileNode) => void;
  onRunCurrentFile: () => void;
  onOpenAI: () => void;
  onChangeTheme: (themeId: ThemeId) => void;
  onDownloadZip: () => void;
  onToggleTerminal: () => void;
  theme: ThemeConfig;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  files,
  onSelectFile,
  onRunCurrentFile,
  onOpenAI,
  onChangeTheme,
  onDownloadZip,
  onToggleTerminal,
  theme,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        // Toggle palette
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    {
      id: 'run-colab',
      title: 'Python: Executar no Google Colab / Terminal',
      icon: <Play className="w-4 h-4 text-emerald-400" />,
      action: () => { onRunCurrentFile(); onClose(); },
    },
    {
      id: 'kilo-ai',
      title: 'Kilo Code AI: Abrir Assistente de Código Autônomo',
      icon: <Bot className="w-4 h-4 text-blue-400" />,
      action: () => { onOpenAI(); onClose(); },
    },
    {
      id: 'toggle-term',
      title: 'Terminal: Alternar Painel do Terminal Integrado',
      icon: <Terminal className="w-4 h-4 text-amber-400" />,
      action: () => { onToggleTerminal(); onClose(); },
    },
    {
      id: 'download-zip',
      title: 'Workspace: Baixar Projeto Completo em .ZIP',
      icon: <Download className="w-4 h-4 text-purple-400" />,
      action: () => { onDownloadZip(); onClose(); },
    },
  ];

  // Also include files
  const fileCommands = files
    .filter((f) => f.type === 'file')
    .map((f) => ({
      id: `file-${f.id}`,
      title: `Arquivo: Abrir ${f.path}`,
      icon: <FileCode className="w-4 h-4 text-cyan-400" />,
      action: () => { onSelectFile(f); onClose(); },
    }));

  // Theme commands
  const themeCommands = Object.values(VSCODE_THEMES).map((t) => ({
    id: `theme-${t.id}`,
    title: `Tema: Mudar para ${t.name}`,
    icon: <Palette className="w-4 h-4 text-amber-300" />,
    action: () => { onChangeTheme(t.id); onClose(); },
  }));

  const allItems = [...commands, ...fileCommands, ...themeCommands];
  const filtered = query.trim()
    ? allItems.filter((it) => it.title.toLowerCase().includes(query.toLowerCase()))
    : allItems;

  return (
    <div 
      id="vscode-command-palette-overlay"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl rounded-xl border shadow-2xl overflow-hidden flex flex-col text-xs"
        style={{
          backgroundColor: theme.colors.sidebarBg,
          borderColor: theme.colors.editorBorder,
          color: theme.colors.editorText,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b" style={{ borderColor: theme.colors.editorBorder }}>
          <Search className="w-4 h-4 opacity-50 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite um comando ou nome de arquivo... (Ex: Executar, Tema, main.py)"
            className="flex-1 bg-transparent outline-hidden text-xs"
            style={{ color: theme.colors.inputText }}
          />
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-1 space-y-0.5">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={item.action}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-left hover:opacity-90 transition-colors"
              style={{
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.type === 'dark' ? '#2a2d2e' : '#e4e6f1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="truncate flex-1">{item.title}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-4 text-center opacity-60">Nenhum comando correspondente.</div>
          )}
        </div>
      </div>
    </div>
  );
};
