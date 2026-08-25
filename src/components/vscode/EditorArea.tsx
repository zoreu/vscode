import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Play, 
  Search, 
  AlignLeft, 
  SplitSquareVertical, 
  Sparkles,
  Check, 
  Copy, 
  Terminal,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { EditorTab, FileNode, ThemeConfig } from '../../types/vscode';
import { getFileIcon } from '../../utils/fileIcons';

interface EditorAreaProps {
  tabs: EditorTab[];
  activeTabId: string | null;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  activeFile: FileNode | null;
  onUpdateFileContent: (fileId: string, content: string) => void;
  theme: ThemeConfig;
  fontSize: number;
  onRunFile: (file: FileNode) => void;
  onAskAIAboutSelection: (selectedCode: string) => void;
}

export const EditorArea: React.FC<EditorAreaProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  activeFile,
  onUpdateFileContent,
  theme,
  fontSize,
  onRunFile,
  onAskAIAboutSelection,
}) => {
  const [showFind, setShowFind] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [wordWrap, setWordWrap] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selection, setSelection] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const content = activeFile?.content || '';
  const lines = content.split('\n');
  const lineCount = lines.length;

  // Sync scrolling between line numbers and textarea
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (activeFile) {
      onUpdateFileContent(activeFile.id, e.target.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab key support
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newContent = content.substring(0, start) + '    ' + content.substring(end);
      if (activeFile) {
        onUpdateFileContent(activeFile.id, newContent);
      }
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
    // Ctrl+F for find
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      setShowFind(true);
    }
  };

  const handleSelectText = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      if (start !== end) {
        const text = content.substring(start, end);
        setSelection(text);
      } else {
        setSelection('');
      }
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReplaceAll = () => {
    if (!findText || !activeFile) return;
    const newContent = content.split(findText).join(replaceText);
    onUpdateFileContent(activeFile.id, newContent);
  };

  // If no files are open
  if (!activeFile || tabs.length === 0) {
    return (
      <div 
        id="vscode-empty-editor"
        className="flex-1 flex flex-col items-center justify-center p-6 select-none"
        style={{
          backgroundColor: theme.colors.editorBg,
          color: theme.colors.editorText,
        }}
      >
        <div className="max-w-md text-center flex flex-col items-center gap-4 opacity-75">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: theme.colors.accent, color: '#ffffff' }}
          >
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold">VS Code Web + Kilo Code</h2>
          <p className="text-sm leading-relaxed opacity-80">
            Selecione um arquivo no Explorador ou peça ao <strong>Kilo Code AI</strong> para gerar uma nova arquitetura, script de treino PyTorch ou notebook para Google Colab.
          </p>
          <div className="flex flex-wrap gap-2 justify-center text-xs opacity-90 pt-2 font-mono">
            <span className="px-2 py-1 rounded bg-black/10 dark:bg-white/10">Ctrl+Shift+E : Arquivos</span>
            <span className="px-2 py-1 rounded bg-black/10 dark:bg-white/10">Ctrl+Shift+P : Comandos</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="vscode-editor-container"
      className="flex-1 flex flex-col h-full overflow-hidden relative"
      style={{
        backgroundColor: theme.colors.editorBg,
        color: theme.colors.editorText,
      }}
    >
      {/* TABS BAR */}
      <div 
        id="vscode-tabs-bar"
        className="flex items-center justify-between overflow-x-auto border-b select-none shrink-0 no-scrollbar"
        style={{
          backgroundColor: theme.type === 'dark' ? '#252526' : '#ececec',
          borderColor: theme.colors.editorBorder,
        }}
      >
        {/* Tab Items */}
        <div className="flex items-center min-w-0">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            const { icon, color } = getFileIcon(tab.title);
            return (
              <div
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`group flex items-center gap-2 px-3 py-2 text-xs border-r cursor-pointer max-w-[200px] transition-colors relative ${
                  isActive ? 'font-medium' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: isActive ? theme.colors.tabActiveBg : theme.colors.tabInactiveBg,
                  color: isActive ? theme.colors.tabActiveText : theme.colors.tabInactiveText,
                  borderColor: theme.colors.tabBorder,
                }}
              >
                {/* Active top line */}
                {isActive && (
                  <div 
                    className="absolute top-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                )}

                <span style={{ color }} className="shrink-0">
                  {icon}
                </span>

                <span className="truncate">{tab.title}</span>

                {/* Dirty dot or Close button */}
                {tab.isDirty ? (
                  <span 
                    className="w-2 h-2 rounded-full shrink-0 group-hover:hidden"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                ) : null}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 shrink-0"
                  title="Fechar (Ctrl+W)"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Top Right Editor Actions */}
        <div className="flex items-center gap-1 px-2 shrink-0">
          {/* Run in Colab Button */}
          <button
            onClick={() => onRunFile(activeFile)}
            title="Executar no Google Colab / Python Terminal (Ctrl+F5)"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold text-white shadow-xs transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#238636' }}
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span className="hidden sm:inline">Executar</span>
          </button>

          {/* Find in file */}
          <button
            onClick={() => setShowFind(!showFind)}
            title="Localizar (Ctrl+F)"
            className={`p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 ${showFind ? 'text-blue-400' : ''}`}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Word Wrap */}
          <button
            onClick={() => setWordWrap(!wordWrap)}
            title="Alternar Quebra de Linha (Alt+Z)"
            className={`p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 ${wordWrap ? 'text-blue-400' : 'opacity-70'}`}
          >
            <AlignLeft className="w-4 h-4" />
          </button>

          {/* Copy Code */}
          <button
            onClick={handleCopyCode}
            title="Copiar Código"
            className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-70"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* BREADCRUMBS */}
      <div 
        className="flex items-center justify-between px-4 py-1 text-[11px] border-b select-none shrink-0"
        style={{
          backgroundColor: theme.colors.editorBg,
          borderColor: theme.colors.editorBorder,
          color: theme.colors.editorText,
          opacity: 0.8,
        }}
      >
        <div className="flex items-center gap-1 font-mono truncate">
          <span>workspace</span>
          <span>&gt;</span>
          <span className="font-semibold text-blue-400">{activeFile.path}</span>
        </div>

        {/* Selected text AI Action chip */}
        {selection && (
          <button
            onClick={() => onAskAIAboutSelection(selection)}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-sans font-medium text-white animate-pulse"
            style={{ backgroundColor: theme.colors.accent }}
          >
            <Sparkles className="w-3 h-3" />
            <span>Pedir ao Kilo Code AI ({selection.length} caracteres)</span>
          </button>
        )}
      </div>

      {/* INLINE FIND / REPLACE WIDGET */}
      {showFind && (
        <div 
          className="absolute top-16 right-4 z-20 p-2.5 rounded-lg border shadow-xl flex flex-col gap-2 text-xs w-80 animate-in fade-in"
          style={{
            backgroundColor: theme.colors.sidebarBg,
            borderColor: theme.colors.editorBorder,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold">Localizar e Substituir</span>
            <button onClick={() => setShowFind(false)} className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            <input
              type="text"
              placeholder="Localizar..."
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              className="px-2 py-1 rounded border text-xs outline-hidden"
              style={{
                backgroundColor: theme.colors.inputBg,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.inputText,
              }}
            />
            <input
              type="text"
              placeholder="Substituir por..."
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              className="px-2 py-1 rounded border text-xs outline-hidden"
              style={{
                backgroundColor: theme.colors.inputBg,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.inputText,
              }}
            />
            <button
              onClick={handleReplaceAll}
              className="mt-1 py-1 px-2 rounded font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: theme.colors.accent }}
            >
              Substituir Todos
            </button>
          </div>
        </div>
      )}

      {/* CODE EDITOR VIEWPORT */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Line Numbers Gutter */}
        <div 
          ref={lineNumbersRef}
          className="w-12 select-none overflow-hidden py-3 text-right pr-3 font-mono text-xs shrink-0 border-r"
          style={{
            backgroundColor: theme.colors.editorGutter,
            borderColor: theme.colors.editorBorder,
            color: theme.colors.editorLineNum,
            fontSize: `${fontSize}px`,
            lineHeight: `${fontSize * 1.55}px`,
          }}
        >
          {Array.from({ length: Math.max(lineCount, 1) }).map((_, i) => (
            <div key={i} className="leading-relaxed">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Text Area Code Editor */}
        <div className="flex-1 relative overflow-hidden h-full">
          <textarea
            ref={textareaRef}
            id="vscode-code-textarea"
            value={content}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            onSelect={handleSelectText}
            spellCheck={false}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            className={`w-full h-full p-3 font-mono outline-hidden resize-none bg-transparent ${
              wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre'
            }`}
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: `${fontSize * 1.55}px`,
              color: theme.colors.editorText,
              caretColor: theme.colors.accent,
              tabSize: 4,
            }}
          />
        </div>
      </div>
    </div>
  );
};
