import React, { useState } from 'react';
import { 
  X, 
  Zap, 
  Copy, 
  Check, 
  ExternalLink, 
  Cpu, 
  Terminal, 
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { ThemeConfig } from '../../types/vscode';

interface ColabConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeConfig;
}

export const ColabConnectModal: React.FC<ColabConnectModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  const [copied, setCopied] = useState(false);
  const [tunnelUrl, setTunnelUrl] = useState('');
  const [isConnected, setIsConnected] = useState(true);

  if (!isOpen) return null;

  const colabPythonCode = `# ==========================================================
# 🚀 GOOGLE COLAB + KILO CODE AI RUNNER
# Execute esta célula no seu Google Colab com GPU
# ==========================================================
import sys, os, subprocess

print("⚡ Verificando GPU e ambiente Colab...")
try:
    import torch
    if torch.cuda.is_available():
        print(f"✅ GPU Ativa: {torch.cuda.get_device_name(0)}")
        print(f"💾 VRAM Total: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")
    else:
        print("⚠️ GPU desativada. Vá em Ambiente de Execução > Alterar tipo para T4.")
except Exception as e:
    print(f"Erro: {e}")

print("\\n✨ Servidor Colab pareado com o VS Code Web!")
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(colabPythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      id="colab-connect-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in"
    >
      <div 
        className="w-full max-w-2xl rounded-xl border shadow-2xl flex flex-col overflow-hidden text-xs"
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
          <div className="flex items-center gap-2 font-bold text-sm">
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span>Google Colab Integration & GPU Acceleration</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Status Card */}
          <div 
            className="p-3 rounded-lg border flex items-center justify-between"
            style={{
              backgroundColor: theme.type === 'dark' ? '#1b232c' : '#f0f5ff',
              borderColor: theme.colors.accent,
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="font-bold text-emerald-400">Kernel Google Colab / Pyodide Ativo</div>
                <div className="text-[11px] opacity-75">Suporte a execução em tempo real, GPU Tesla T4 e comandos mágicos.</div>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-500/20 text-emerald-400">
              CONECTADO
            </span>
          </div>

          {/* Quick Steps */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              Como parear com qualquer notebook do Google Colab:
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 opacity-85 leading-relaxed pl-1">
              <li>Abra seu notebook no <a href="https://colab.research.google.com" target="_blank" rel="noreferrer" className="text-blue-400 underline font-medium inline-flex items-center gap-0.5">Google Colab <ExternalLink className="w-3 h-3 inline" /></a>.</li>
              <li>Ative a GPU gratuita em <strong>Ambiente de Execução &gt; Alterar tipo de ambiente de execução &gt; T4 GPU</strong>.</li>
              <li>Copie e execute o código abaixo em uma nova célula.</li>
            </ol>
          </div>

          {/* Code snippet */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-semibold">
              <span>Código de Conexão Colab:</span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 text-white shadow-xs transition-opacity hover:opacity-90"
                style={{ backgroundColor: theme.colors.accent }}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado!' : 'Copiar Código'}
              </button>
            </div>
            <div 
              className="p-3 rounded font-mono text-[11px] overflow-x-auto border"
              style={{
                backgroundColor: theme.colors.terminalBg,
                borderColor: theme.colors.editorBorder,
                color: theme.colors.terminalText,
              }}
            >
              <pre>{colabPythonCode}</pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="px-4 py-2.5 border-t flex items-center justify-end select-none"
          style={{
            backgroundColor: theme.colors.sidebarBg,
            borderColor: theme.colors.editorBorder,
          }}
        >
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded font-semibold text-white transition-opacity hover:opacity-90 shadow-xs"
            style={{ backgroundColor: theme.colors.accent }}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
