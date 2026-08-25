import React from 'react';
import { Check, X, GitCompare, ArrowRight } from 'lucide-react';
import { ThemeConfig } from '../../types/vscode';

interface DiffViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  filePath: string;
  originalContent: string;
  proposedContent: string;
  onAccept: () => void;
  onReject: () => void;
  theme: ThemeConfig;
}

export const DiffViewerModal: React.FC<DiffViewerModalProps> = ({
  isOpen,
  onClose,
  filePath,
  originalContent,
  proposedContent,
  onAccept,
  onReject,
  theme,
}) => {
  if (!isOpen) return null;

  const originalLines = originalContent.split('\n');
  const proposedLines = proposedContent.split('\n');
  const maxLines = Math.max(originalLines.length, proposedLines.length);

  return (
    <div 
      id="vscode-diff-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in"
    >
      <div 
        className="w-full max-w-5xl h-[85vh] rounded-xl border shadow-2xl flex flex-col overflow-hidden"
        style={{
          backgroundColor: theme.colors.editorBg,
          borderColor: theme.colors.editorBorder,
          color: theme.colors.editorText,
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-4 py-3 border-b select-none shrink-0"
          style={{
            backgroundColor: theme.colors.sidebarBg,
            borderColor: theme.colors.editorBorder,
          }}
        >
          <div className="flex items-center gap-2 font-semibold">
            <GitCompare className="w-5 h-5 text-blue-400" />
            <span>Kilo Code AI Diff Review:</span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-black/20 text-emerald-400">{filePath}</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onReject}
              className="px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors bg-red-500/20 text-red-400 hover:bg-red-500/30"
            >
              <X className="w-4 h-4" />
              Rejeitar
            </button>
            <button
              onClick={onAccept}
              className="px-4 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 text-white transition-opacity hover:opacity-90 shadow-xs"
              style={{ backgroundColor: '#238636' }}
            >
              <Check className="w-4 h-4" />
              Aceitar e Salvar no Arquivo
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Diff Columns Header */}
        <div 
          className="grid grid-cols-2 text-xs font-semibold border-b py-1.5 px-4 font-mono select-none"
          style={{
            backgroundColor: theme.type === 'dark' ? '#1f242e' : '#f0f0f0',
            borderColor: theme.colors.editorBorder,
          }}
        >
          <div className="text-red-400 flex items-center gap-1">
            <span>🔴 Versão Atual do Arquivo ({originalLines.length} linhas)</span>
          </div>
          <div className="text-emerald-400 flex items-center gap-1">
            <span>🟢 Proposta do Kilo Code AI ({proposedLines.length} linhas)</span>
          </div>
        </div>

        {/* Diff View Body */}
        <div className="flex-1 grid grid-cols-2 overflow-y-auto font-mono text-xs divide-x divide-neutral-700/40">
          {/* Left: Original */}
          <div className="p-3 overflow-x-auto whitespace-pre space-y-0.5">
            {originalLines.map((line, idx) => (
              <div 
                key={idx} 
                className="flex items-start gap-3 py-0.5 px-1 rounded hover:bg-red-500/10"
              >
                <span className="w-6 text-right select-none opacity-40 shrink-0">{idx + 1}</span>
                <span className="flex-1 opacity-90">{line || ' '}</span>
              </div>
            ))}
          </div>

          {/* Right: Proposed */}
          <div 
            className="p-3 overflow-x-auto whitespace-pre space-y-0.5"
            style={{ backgroundColor: theme.type === 'dark' ? '#14231b' : '#edfbf2' }}
          >
            {proposedLines.map((line, idx) => (
              <div 
                key={idx} 
                className="flex items-start gap-3 py-0.5 px-1 rounded hover:bg-emerald-500/20 text-emerald-300 dark:text-emerald-300"
              >
                <span className="w-6 text-right select-none opacity-50 shrink-0 text-emerald-400">{idx + 1}</span>
                <span className="flex-1">{line || ' '}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
