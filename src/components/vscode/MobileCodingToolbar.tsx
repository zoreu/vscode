import React from 'react';
import { 
  Undo2, 
  Redo2, 
  Sparkles, 
  Play, 
  FolderOpen, 
  Terminal,
  CornerDownLeft
} from 'lucide-react';
import { ThemeConfig } from '../../types/vscode';

interface MobileCodingToolbarProps {
  onInsertSymbol: (symbol: string) => void;
  onOpenAI: () => void;
  onRunCode: () => void;
  onToggleSidebar: () => void;
  onToggleTerminal: () => void;
  theme: ThemeConfig;
}

export const MobileCodingToolbar: React.FC<MobileCodingToolbarProps> = ({
  onInsertSymbol,
  onOpenAI,
  onRunCode,
  onToggleSidebar,
  onToggleTerminal,
  theme,
}) => {
  const symbols = [
    { label: 'Tab', val: '    ' },
    { label: '{', val: '{' },
    { label: '}', val: '}' },
    { label: '(', val: '(' },
    { label: ')', val: ')' },
    { label: '[', val: '[' },
    { label: ']', val: ']' },
    { label: ':', val: ':' },
    { label: ';', val: ';' },
    { label: '=', val: '=' },
    { label: '<', val: '<' },
    { label: '>', val: '>' },
    { label: '"', val: '"' },
    { label: "'", val: "'" },
    { label: '#', val: '#' },
    { label: '_', val: '_' },
    { label: '$', val: '$' },
    { label: '!', val: '!' },
    { label: '%', val: '%' },
    { label: '.', val: '.' },
  ];

  return (
    <div 
      id="vscode-mobile-coding-bar"
      className="md:hidden flex flex-col border-t select-none shrink-0 z-30 shadow-lg"
      style={{
        backgroundColor: theme.colors.sidebarBg,
        borderColor: theme.colors.editorBorder,
      }}
    >
      {/* Top Mobile Quick Action Bar */}
      <div className="flex items-center justify-between px-2 py-1 border-b" style={{ borderColor: theme.colors.editorBorder }}>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleSidebar}
            title="Abrir Explorador de Arquivos"
            className="p-1.5 rounded text-xs flex items-center gap-1 font-medium bg-black/10 dark:bg-white/10"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Arquivos</span>
          </button>

          <button
            onClick={onToggleTerminal}
            title="Abrir Terminal"
            className="p-1.5 rounded text-xs flex items-center gap-1 font-medium bg-black/10 dark:bg-white/10"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenAI}
            className="px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 text-white animate-pulse shadow-xs"
            style={{ backgroundColor: theme.colors.accent }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kilo AI</span>
          </button>

          <button
            onClick={onRunCode}
            className="px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 text-white shadow-xs"
            style={{ backgroundColor: '#238636' }}
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Run</span>
          </button>
        </div>
      </div>

      {/* Touch Keys Bar */}
      <div className="flex items-center gap-1 p-1 overflow-x-auto no-scrollbar">
        {symbols.map((s, idx) => (
          <button
            key={idx}
            onClick={() => onInsertSymbol(s.val)}
            className="px-2.5 py-1.5 rounded font-mono text-xs font-bold border shrink-0 transition-transform active:scale-95 shadow-xs"
            style={{
              backgroundColor: theme.colors.inputBg,
              borderColor: theme.colors.editorBorder,
              color: theme.colors.editorText,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
};
