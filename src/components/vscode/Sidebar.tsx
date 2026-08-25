import React, { useState } from 'react';
import { 
  FilePlus, 
  FolderPlus, 
  RefreshCw, 
  Download, 
  Upload, 
  X, 
  Search, 
  Replace, 
  Check, 
  Copy, 
  Play, 
  Zap, 
  Settings2, 
  Cpu, 
  ExternalLink,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { FileNode, SidebarView, ThemeConfig, ThemeId, AIModel } from '../../types/vscode';
import { FileTreeItem } from './FileTreeItem';
import { VSCODE_THEMES } from '../../utils/themes';
import JSZip from 'jszip';

interface SidebarProps {
  activeView: SidebarView | null;
  onClose: () => void;
  files: FileNode[];
  activeFileId: string | null;
  onSelectFile: (file: FileNode) => void;
  onToggleFolder: (folderId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onRenameNode: (nodeId: string, newName: string) => void;
  onCreateNew: (parentId: string | null, type: 'file' | 'folder') => void;
  theme: ThemeConfig;
  onChangeTheme: (themeId: ThemeId) => void;
  colabStatus: string;
  onConnectColab: (url: string) => void;
  onRunActiveFile: () => void;
  models: AIModel[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  fontSize: number;
  onChangeFontSize: (size: number) => void;
  autoSave: boolean;
  onToggleAutoSave: () => void;
  onUploadFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onClose,
  files,
  activeFileId,
  onSelectFile,
  onToggleFolder,
  onDeleteNode,
  onRenameNode,
  onCreateNew,
  theme,
  onChangeTheme,
  colabStatus,
  onConnectColab,
  onRunActiveFile,
  models,
  selectedModel,
  onSelectModel,
  fontSize,
  onChangeFontSize,
  autoSave,
  onToggleAutoSave,
  onUploadFile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [colabUrlInput, setColabUrlInput] = useState('');
  const [copiedScript, setCopiedScript] = useState(false);

  if (!activeView) return null;

  // Root level nodes
  const rootNodes = files.filter((n) => n.parentId === null);
  const modifiedFiles = files.filter((n) => n.isModified);

  // Search matches
  const searchResults = searchQuery.trim()
    ? files.filter(f => f.type === 'file' && f.content?.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

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
    a.download = `kilo-colab-workspace-${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const colabBridgeSnippet = `# ==========================================================
# 🚀 KILO CODE + VS CODE GOOGLE COLAB BRIDGE
# Execute esta célula no Google Colab para habilitar o runtime
# ==========================================================
!pip install -q fastapi uvicorn pyngrok torch torchvision

print("✨ Ambiente Colab configurado com sucesso para o VS Code Web!")
`;

  const handleCopyColabScript = () => {
    navigator.clipboard.writeText(colabBridgeSnippet);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div
      id="vscode-sidebar"
      className="w-full md:w-64 lg:w-72 flex flex-col h-full select-none border-r shrink-0 z-10"
      style={{
        backgroundColor: theme.colors.sidebarBg,
        borderColor: theme.colors.editorBorder,
        color: theme.colors.editorText,
      }}
    >
      {/* Sidebar Title Bar */}
      <div 
        className="flex items-center justify-between px-3 py-2 text-xs font-semibold tracking-wider uppercase border-b"
        style={{
          borderColor: theme.colors.editorBorder,
          color: theme.colors.editorText,
        }}
      >
        <span className="truncate">
          {activeView === 'explorer' && 'EXPLORADOR: PROJETO COLAB'}
          {activeView === 'search' && 'PESQUISAR NO WORKSPACE'}
          {activeView === 'git' && 'CONTROLE DE CÓDIGO-FONTE'}
          {activeView === 'colab' && 'GOOGLE COLAB BRIDGE & GPU'}
          {activeView === 'extensions' && 'EXTENSÕES'}
          {activeView === 'settings' && 'CONFIGURAÇÕES'}
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 md:hidden"
          title="Fechar painel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* VIEW: EXPLORER */}
      {activeView === 'explorer' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Actions toolbar */}
          <div 
            className="flex items-center justify-between px-2 py-1.5 border-b text-xs"
            style={{ borderColor: theme.colors.editorBorder }}
          >
            <span className="font-semibold text-[11px] uppercase tracking-wide opacity-80">
              Arquivos
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onCreateNew(null, 'file')}
                title="Novo Arquivo"
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
              >
                <FilePlus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onCreateNew(null, 'folder')}
                title="Nova Pasta"
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
              <label 
                title="Carregar Arquivo"
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <input
                  type="file"
                  onChange={onUploadFile}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleDownloadWorkspaceZip}
                title="Baixar Workspace (.ZIP)"
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Files Tree */}
          <div className="flex-1 overflow-y-auto py-1">
            {rootNodes.map((node) => (
              <FileTreeItem
                key={node.id}
                node={node}
                allNodes={files}
                activeFileId={activeFileId}
                onSelectFile={onSelectFile}
                onToggleFolder={onToggleFolder}
                onDeleteNode={onDeleteNode}
                onRenameNode={onRenameNode}
                onCreateNew={onCreateNew}
                theme={theme}
              />
            ))}
          </div>
        </div>
      )}

      {/* VIEW: SEARCH */}
      {activeView === 'search' && (
        <div className="flex flex-col flex-1 p-3 overflow-y-auto gap-3 text-xs">
          <div>
            <label className="block mb-1 font-medium opacity-80">Pesquisar em arquivos</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex: train_synthetic_model, torch..."
                className="w-full px-2.5 py-1.5 rounded outline-hidden border text-xs"
                style={{
                  backgroundColor: theme.colors.inputBg,
                  borderColor: theme.colors.inputBorder,
                  color: theme.colors.inputText,
                }}
              />
              <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 opacity-50" />
            </div>
          </div>

          {searchQuery && (
            <div className="flex-1">
              <div className="text-[11px] opacity-70 mb-2">
                {searchResults.length} arquivo(s) correspondente(s)
              </div>
              <div className="space-y-1">
                {searchResults.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => onSelectFile(file)}
                    className="w-full text-left p-2 rounded border hover:opacity-90 flex flex-col gap-1 transition-colors"
                    style={{
                      borderColor: theme.colors.editorBorder,
                      backgroundColor: theme.colors.inputBg,
                    }}
                  >
                    <div className="font-semibold text-xs text-blue-400">{file.name}</div>
                    <div className="text-[11px] opacity-75 font-mono truncate">{file.path}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW: SOURCE CONTROL (GIT) */}
      {activeView === 'git' && (
        <div className="flex flex-col flex-1 p-3 overflow-y-auto gap-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold opacity-90">Alterações no Workspace ({modifiedFiles.length})</span>
          </div>

          {modifiedFiles.length === 0 ? (
            <div className="p-4 text-center opacity-60 border border-dashed rounded" style={{ borderColor: theme.colors.editorBorder }}>
              Nenhum arquivo alterado no momento. Edite arquivos ou use o Kilo Code AI para gerar patches!
            </div>
          ) : (
            <div className="space-y-1">
              {modifiedFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => onSelectFile(file)}
                  className="flex items-center justify-between p-2 rounded border cursor-pointer hover:opacity-90"
                  style={{
                    backgroundColor: theme.colors.inputBg,
                    borderColor: theme.colors.editorBorder,
                  }}
                >
                  <span className="font-medium truncate">{file.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-500/20 text-amber-400">
                    MODIFICADO
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW: GOOGLE COLAB BRIDGE */}
      {activeView === 'colab' && (
        <div className="flex flex-col flex-1 p-3 overflow-y-auto gap-3 text-xs">
          <div 
            className="p-3 rounded-lg border flex flex-col gap-2"
            style={{
              backgroundColor: theme.type === 'dark' ? '#1f242e' : '#f0f4ff',
              borderColor: theme.colors.accent,
            }}
          >
            <div className="flex items-center gap-2 font-semibold">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Status do Runtime Google Colab</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-medium">Pronto (Kernel Pyodide / Colab Bridge)</span>
            </div>
            <p className="text-[11px] opacity-80">
              Você pode rodar scripts Python com suporte a aceleração gráfica, comandos mágicos (<code className="px-1 py-0.5 bg-black/20 rounded">!pip</code>, <code className="px-1 py-0.5 bg-black/20 rounded">!nvidia-smi</code>) e saída em tempo real no Terminal.
            </p>
          </div>

          {/* 1-Click Code Snippet for Colab */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold opacity-90">Snippet de Pareamento no Colab:</label>
            <div 
              className="p-2.5 rounded font-mono text-[11px] overflow-x-auto border relative"
              style={{
                backgroundColor: theme.colors.terminalBg,
                borderColor: theme.colors.editorBorder,
                color: theme.colors.terminalText,
              }}
            >
              {colabBridgeSnippet}
              <button
                onClick={handleCopyColabScript}
                className="absolute top-2 right-2 px-2 py-1 rounded text-xs flex items-center gap-1 font-sans transition-colors shadow-xs"
                style={{
                  backgroundColor: theme.colors.accent,
                  color: '#ffffff',
                }}
              >
                {copiedScript ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedScript ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* Quick Run File */}
          <button
            onClick={onRunActiveFile}
            className="w-full py-2 px-3 rounded flex items-center justify-center gap-2 font-semibold text-white transition-opacity hover:opacity-90 shadow-xs"
            style={{ backgroundColor: theme.colors.accent }}
          >
            <Play className="w-4 h-4 fill-white" />
            Executar Arquivo Ativo no Kernel
          </button>
        </div>
      )}

      {/* VIEW: EXTENSIONS */}
      {activeView === 'extensions' && (
        <div className="flex flex-col flex-1 p-3 overflow-y-auto gap-3 text-xs">
          <div className="font-semibold opacity-90 mb-1">Extensões Ativas</div>
          
          <div 
            className="p-2.5 rounded border flex flex-col gap-1.5"
            style={{
              backgroundColor: theme.colors.inputBg,
              borderColor: theme.colors.editorBorder,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-400">🤖 Kilo Code AI Engine</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">Ativa</span>
            </div>
            <p className="text-[11px] opacity-80">
              Assistente autônomo com suporte a múltiplos modelos gratuitos (Gemini, DeepSeek, Qwen).
            </p>
          </div>

          <div 
            className="p-2.5 rounded border flex flex-col gap-1.5"
            style={{
              backgroundColor: theme.colors.inputBg,
              borderColor: theme.colors.editorBorder,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400">🐍 Python & Colab Runtime</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">Ativa</span>
            </div>
            <p className="text-[11px] opacity-80">
              Realce de sintaxe PEP 8, execução de scripts, terminal integrado e formatação.
            </p>
          </div>

          <div 
            className="p-2.5 rounded border flex flex-col gap-1.5"
            style={{
              backgroundColor: theme.colors.inputBg,
              borderColor: theme.colors.editorBorder,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-400">📓 Jupyter Notebooks Viewer</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">Ativa</span>
            </div>
            <p className="text-[11px] opacity-80">
              Renderização e visualização de arquivos .ipynb compatíveis com Google Colab.
            </p>
          </div>
        </div>
      )}

      {/* VIEW: SETTINGS */}
      {activeView === 'settings' && (
        <div className="flex flex-col flex-1 p-3 overflow-y-auto gap-4 text-xs">
          {/* Theme Selector */}
          <div>
            <label className="block mb-1 font-semibold opacity-90">Tema de Cores do VS Code</label>
            <select
              value={theme.id}
              onChange={(e) => onChangeTheme(e.target.value as ThemeId)}
              className="w-full px-2 py-1.5 rounded outline-hidden border text-xs"
              style={{
                backgroundColor: theme.colors.inputBg,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.inputText,
              }}
            >
              {Object.values(VSCODE_THEMES).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.type === 'dark' ? 'Escuro' : 'Claro'})
                </option>
              ))}
            </select>
          </div>

          {/* AI Model Selector */}
          <div>
            <label className="block mb-1 font-semibold opacity-90">Modelo Padrão do Kilo Code</label>
            <select
              value={selectedModel}
              onChange={(e) => onSelectModel(e.target.value)}
              className="w-full px-2 py-1.5 rounded outline-hidden border text-xs"
              style={{
                backgroundColor: theme.colors.inputBg,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.inputText,
              }}
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.free ? '⚡ Gratuito' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="font-semibold opacity-90">Tamanho da Fonte do Editor</label>
              <span className="font-mono">{fontSize}px</span>
            </div>
            <input
              type="range"
              min={11}
              max={22}
              value={fontSize}
              onChange={(e) => onChangeFontSize(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Auto Save Toggle */}
          <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: theme.colors.editorBorder }}>
            <div>
              <div className="font-semibold opacity-90">Salvamento Automático</div>
              <div className="text-[11px] opacity-70">Salva edições instantaneamente</div>
            </div>
            <input
              type="checkbox"
              checked={autoSave}
              onChange={onToggleAutoSave}
              className="w-4 h-4 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
