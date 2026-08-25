import React, { useState } from 'react';
import { 
  Terminal as TerminalIcon, 
  AlertTriangle, 
  CheckCircle, 
  Play, 
  Trash2, 
  X, 
  Maximize2, 
  Minimize2, 
  Zap,
  Activity
} from 'lucide-react';
import { BottomTab, TerminalLog, ThemeConfig } from '../../types/vscode';

interface BottomPanelProps {
  isOpen: boolean;
  onClose: () => void;
  logs: TerminalLog[];
  onClearLogs: () => void;
  onRunCustomCommand: (cmd: string) => void;
  theme: ThemeConfig;
  activeFileTitle?: string;
  onRunCurrentFile: () => void;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
  onRunCustomCommand,
  theme,
  activeFileTitle,
  onRunCurrentFile,
}) => {
  const [activeTab, setActiveTab] = useState<BottomTab>('terminal');
  const [commandInput, setCommandInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isOpen) return null;

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    onRunCustomCommand(commandInput.trim());
    setCommandInput('');
  };

  return (
    <div
      id="vscode-bottom-panel"
      className={`border-t flex flex-col select-none shrink-0 transition-all ${
        isExpanded ? 'h-96' : 'h-60'
      }`}
      style={{
        backgroundColor: theme.colors.terminalBg,
        borderColor: theme.colors.editorBorder,
        color: theme.colors.terminalText,
      }}
    >
      {/* Panel Tab Header */}
      <div 
        className="flex items-center justify-between px-3 py-1 border-b text-xs select-none shrink-0"
        style={{
          backgroundColor: theme.colors.sidebarBg,
          borderColor: theme.colors.editorBorder,
        }}
      >
        {/* Left Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-1.5 px-2 py-1 uppercase tracking-wider font-semibold border-b-2 transition-colors ${
              activeTab === 'terminal' ? 'opacity-100' : 'opacity-60 hover:opacity-90 border-transparent'
            }`}
            style={{
              borderColor: activeTab === 'terminal' ? theme.colors.accent : 'transparent',
              color: activeTab === 'terminal' ? theme.colors.tabActiveText : theme.colors.editorText,
            }}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            Terminal (Python Colab)
          </button>

          <button
            onClick={() => setActiveTab('colab-runner')}
            className={`flex items-center gap-1.5 px-2 py-1 uppercase tracking-wider font-semibold border-b-2 transition-colors ${
              activeTab === 'colab-runner' ? 'opacity-100' : 'opacity-60 hover:opacity-90 border-transparent'
            }`}
            style={{
              borderColor: activeTab === 'colab-runner' ? theme.colors.accent : 'transparent',
              color: activeTab === 'colab-runner' ? theme.colors.tabActiveText : theme.colors.editorText,
            }}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Monitor GPU / Métricas
          </button>

          <button
            onClick={() => setActiveTab('problems')}
            className={`flex items-center gap-1.5 px-2 py-1 uppercase tracking-wider font-semibold border-b-2 transition-colors ${
              activeTab === 'problems' ? 'opacity-100' : 'opacity-60 hover:opacity-90 border-transparent'
            }`}
            style={{
              borderColor: activeTab === 'problems' ? theme.colors.accent : 'transparent',
              color: activeTab === 'problems' ? theme.colors.tabActiveText : theme.colors.editorText,
            }}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-emerald-400" />
            Problemas (0)
          </button>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onRunCurrentFile}
            title="Executar Arquivo Atual no Terminal"
            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-emerald-400"
          >
            <Play className="w-3.5 h-3.5 fill-emerald-400" />
          </button>
          <button
            onClick={onClearLogs}
            title="Limpar Terminal"
            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Reduzir Painel' : 'Expandir Painel'}
            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            title="Fechar Painel (Ctrl+`)"
            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* TAB: TERMINAL */}
      {activeTab === 'terminal' && (
        <div className="flex-1 flex flex-col p-2.5 overflow-hidden font-mono text-xs select-text">
          {/* Logs List */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 font-mono text-[12px] leading-relaxed">
            {logs.length === 0 ? (
              <div className="opacity-50 select-none py-2">
                Google Colab Terminal inicializado. Digite comandos ou clique em 'Executar' no topo do editor.
              </div>
            ) : (
              logs.map((log) => {
                let colorClass = 'text-neutral-300';
                if (log.type === 'command') colorClass = 'text-blue-400 font-bold';
                if (log.type === 'stderr') colorClass = 'text-red-400';
                if (log.type === 'info') colorClass = 'text-cyan-400';
                if (log.type === 'success') colorClass = 'text-emerald-400 font-semibold';

                return (
                  <div key={log.id} className={`whitespace-pre-wrap ${colorClass}`}>
                    {log.type === 'command' && <span className="text-emerald-400 select-none mr-2">colab@gpu:~$</span>}
                    {log.text}
                  </div>
                );
              })
            )}
          </div>

          {/* Interactive Shell Input */}
          <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 pt-1 border-t border-neutral-700/30">
            <span className="text-emerald-400 select-none font-bold">colab@gpu:~$</span>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Ex: python src/main.py, !nvidia-smi, !pip install..."
              className="flex-1 bg-transparent outline-hidden font-mono text-xs"
              style={{ color: theme.colors.terminalText }}
            />
          </form>
        </div>
      )}

      {/* TAB: COLAB RUNNER / METRICS */}
      {activeTab === 'colab-runner' && (
        <div className="flex-1 p-3 overflow-y-auto grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs select-none">
          <div 
            className="p-3 rounded border flex flex-col gap-1"
            style={{ backgroundColor: theme.colors.inputBg, borderColor: theme.colors.editorBorder }}
          >
            <div className="font-semibold text-blue-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              <span>Acelerador GPU</span>
            </div>
            <div className="text-sm font-bold">NVIDIA Tesla T4 (15 GB)</div>
            <div className="text-[11px] opacity-70">Uso de VRAM: 1.4 GB / 15.0 GB</div>
          </div>

          <div 
            className="p-3 rounded border flex flex-col gap-1"
            style={{ backgroundColor: theme.colors.inputBg, borderColor: theme.colors.editorBorder }}
          >
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              <span>RAM do Sistema</span>
            </div>
            <div className="text-sm font-bold">2.8 GB / 12.7 GB</div>
            <div className="text-[11px] opacity-70">Disco: 28.4 GB livres</div>
          </div>

          <div 
            className="p-3 rounded border flex flex-col gap-1"
            style={{ backgroundColor: theme.colors.inputBg, borderColor: theme.colors.editorBorder }}
          >
            <div className="font-semibold text-purple-400 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>Ambiente Python</span>
            </div>
            <div className="text-sm font-bold">Python 3.11.8 / PyTorch 2.2</div>
            <div className="text-[11px] opacity-70">CUDA Version: 12.2</div>
          </div>
        </div>
      )}

      {/* TAB: PROBLEMS */}
      {activeTab === 'problems' && (
        <div className="flex-1 p-4 flex items-center justify-center text-xs opacity-75 select-none">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Nenhum problema detectado no workspace (0 erros, 0 avisos).</span>
          </div>
        </div>
      )}
    </div>
  );
};
