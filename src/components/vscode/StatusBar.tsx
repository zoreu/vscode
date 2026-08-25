import React from 'react';
import { 
  GitBranch, 
  AlertCircle, 
  Zap, 
  Bot, 
  Sparkles, 
  Check, 
  Bell,
  Sun,
  Moon
} from 'lucide-react';
import { ThemeConfig } from '../../types/vscode';

interface StatusBarProps {
  branch: string;
  problemsCount: number;
  colabStatus: string;
  cursorPos?: { line: number; col: number };
  language: string;
  theme: ThemeConfig;
  onToggleTerminal: () => void;
  onToggleColabModal: () => void;
  onToggleAI: () => void;
  onToggleTheme: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  branch,
  problemsCount,
  colabStatus,
  cursorPos = { line: 1, col: 1 },
  language,
  theme,
  onToggleTerminal,
  onToggleColabModal,
  onToggleAI,
  onToggleTheme,
}) => {
  return (
    <div
      id="vscode-status-bar"
      className="flex items-center justify-between px-2 h-6 text-[11px] select-none shrink-0 z-20"
      style={{
        backgroundColor: theme.colors.statusBarBg,
        color: theme.colors.statusBarText,
      }}
    >
      {/* Left items */}
      <div className="flex items-center gap-3 overflow-hidden">
        {/* Branch */}
        <button 
          className="flex items-center gap-1 hover:opacity-80 transition-opacity font-mono truncate"
          title="Git Branch"
        >
          <GitBranch className="w-3.5 h-3.5 shrink-0" />
          <span>{branch}</span>
        </button>

        {/* Problems */}
        <button 
          onClick={onToggleTerminal}
          className="flex items-center gap-1 hover:opacity-80 transition-opacity"
          title="Problemas"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{problemsCount}</span>
        </button>

        {/* Colab Status */}
        <button
          onClick={onToggleColabModal}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/20 hover:bg-black/30 transition-colors font-medium truncate"
          title="Google Colab GPU Runtime Status"
        >
          <Zap className="w-3 h-3 text-amber-300 fill-amber-300 shrink-0" />
          <span className="truncate">Colab: GPU Tesla T4</span>
        </button>
      </div>

      {/* Right items */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Kilo Code Assistant status */}
        <button
          onClick={onToggleAI}
          className="hidden sm:flex items-center gap-1 font-medium hover:opacity-80"
          title="Abrir Kilo Code AI Assistant"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Kilo Code AI</span>
        </button>

        {/* Cursor position */}
        <span className="hidden md:inline font-mono">
          Lin {cursorPos.line}, Col {cursorPos.col}
        </span>

        {/* Spaces */}
        <span className="hidden sm:inline">Espaços: 4</span>

        {/* Encoding */}
        <span className="hidden md:inline">UTF-8</span>

        {/* Language */}
        <span className="font-semibold uppercase tracking-wider text-[10px] px-1 bg-black/20 rounded">
          {language || 'PYTHON'}
        </span>

        {/* Theme button */}
        <button 
          onClick={onToggleTheme} 
          title="Alternar Tema" 
          className="p-0.5 rounded hover:bg-black/20"
        >
          {theme.type === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
