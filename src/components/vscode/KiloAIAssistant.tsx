import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  FileCode, 
  Play, 
  Check, 
  Copy, 
  GitCompare, 
  FilePlus, 
  RefreshCw, 
  Trash2, 
  Paperclip,
  Zap,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { AIMessage, AIModel, FileNode, ThemeConfig, AIAction } from '../../types/vscode';
import { parseAIActions } from '../../utils/aiActionParser';

interface KiloAIAssistantProps {
  messages: AIMessage[];
  onSendMessage: (text: string, contextFiles: FileNode[]) => void;
  onClearHistory: () => void;
  files: FileNode[];
  activeFile: FileNode | null;
  models: AIModel[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  onApplyAction: (action: AIAction) => void;
  onReviewDiff: (filePath: string, proposedContent: string, actionId: string) => void;
  onRunInColab: (code: string, fileName?: string) => void;
  theme: ThemeConfig;
  isLoading: boolean;
}

export const KiloAIAssistant: React.FC<KiloAIAssistantProps> = ({
  messages,
  onSendMessage,
  onClearHistory,
  files,
  activeFile,
  models,
  selectedModel,
  onSelectModel,
  onApplyAction,
  onReviewDiff,
  onRunInColab,
  theme,
  isLoading,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedContextIds, setSelectedContextIds] = useState<string[]>([]);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Set active file as default context on load
  useEffect(() => {
    if (activeFile && !selectedContextIds.includes(activeFile.id)) {
      setSelectedContextIds((prev) => [...prev, activeFile.id]);
    }
  }, [activeFile?.id]);

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    const contextFiles = files.filter((f) => selectedContextIds.includes(f.id));
    onSendMessage(inputText, contextFiles);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleContextFile = (fileId: string) => {
    setSelectedContextIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    { label: '⚡ Otimizar para GPU Colab', prompt: 'Analise este código e adicione otimizações para GPU/CUDA no Google Colab, com tratamento de exceções e medição de memória.' },
    { label: '✍️ Criar Script PyTorch', prompt: 'Crie um novo arquivo src/train_cifar.py completo com carregamento de dataset, modelo CNN e loop de treinamento.' },
    { label: '🐛 Encontrar e Corrigir Bugs', prompt: 'Revise o arquivo ativo em busca de possíveis bugs de sintaxe, tipos ou memory leak em Python.' },
    { label: '📊 Gerar Gráfico Matplotlib', prompt: 'Adicione uma função que plote curvas de Perda (Loss) e Acurácia ao final do treinamento usando matplotlib.' },
  ];

  const currentModelObj = models.find((m) => m.id === selectedModel) || models[0];

  return (
    <div
      id="vscode-kilo-ai-panel"
      className="flex flex-col h-full overflow-hidden border-l select-none shrink-0 w-full md:w-80 lg:w-96"
      style={{
        backgroundColor: theme.colors.sidebarBg,
        borderColor: theme.colors.editorBorder,
        color: theme.colors.editorText,
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-3 py-2.5 border-b shrink-0"
        style={{ borderColor: theme.colors.editorBorder }}
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded-md flex items-center justify-center text-white"
            style={{ backgroundColor: theme.colors.accent }}
          >
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs flex items-center gap-1.5">
              <span>Kilo Code AI</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-500/20 text-emerald-400">
                PRO FREE
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onClearHistory}
          title="Limpar histórico de conversa"
          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Model Selector Bar */}
      <div 
        className="flex items-center justify-between px-3 py-1.5 border-b text-[11px] shrink-0"
        style={{
          backgroundColor: theme.type === 'dark' ? '#1e222b' : '#f0f3fa',
          borderColor: theme.colors.editorBorder,
        }}
      >
        <div className="flex items-center gap-1.5 truncate">
          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-semibold truncate">{currentModelObj?.name || 'Gemini 3.7 Flash'}</span>
        </div>
        <select
          value={selectedModel}
          onChange={(e) => onSelectModel(e.target.value)}
          className="text-[11px] px-1.5 py-0.5 rounded border outline-hidden max-w-[140px]"
          style={{
            backgroundColor: theme.colors.inputBg,
            borderColor: theme.colors.inputBorder,
            color: theme.colors.inputText,
          }}
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name.split(' ')[0]} ({m.free ? 'Free' : ''})
            </option>
          ))}
        </select>
      </div>

      {/* Active Context Chips */}
      <div 
        className="flex items-center gap-1 px-3 py-1.5 border-b overflow-x-auto text-[10px] shrink-0 no-scrollbar"
        style={{ borderColor: theme.colors.editorBorder }}
      >
        <span className="opacity-60 flex items-center gap-0.5 shrink-0">
          <Paperclip className="w-3 h-3" /> Contexto:
        </span>
        {files.filter(f => f.type === 'file').map((file) => {
          const isSelected = selectedContextIds.includes(file.id);
          return (
            <button
              key={file.id}
              onClick={() => toggleContextFile(file.id)}
              className={`px-1.5 py-0.5 rounded border font-mono shrink-0 transition-colors ${
                isSelected ? 'font-bold' : 'opacity-50'
              }`}
              style={{
                backgroundColor: isSelected ? theme.colors.accent : 'transparent',
                color: isSelected ? '#ffffff' : theme.colors.editorText,
                borderColor: isSelected ? theme.colors.accent : theme.colors.editorBorder,
              }}
            >
              @{file.name}
            </button>
          );
        })}
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs select-text">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 opacity-75 gap-3">
            <Sparkles className="w-8 h-8 text-blue-400 animate-bounce" />
            <h3 className="font-bold text-sm">Como posso ajudar seu código hoje?</h3>
            <p className="text-xs leading-relaxed opacity-80">
              O Kilo Code AI pode gerar scripts completos para Colab, refatorar pipelines de machine learning e aplicar edições direto nos seus arquivos.
            </p>
            {/* Quick Prompts */}
            <div className="flex flex-col gap-1.5 w-full pt-2">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(qp.prompt, files.filter(f => selectedContextIds.includes(f.id)))}
                  className="w-full text-left p-2 rounded border hover:opacity-90 transition-colors font-medium text-[11px]"
                  style={{
                    backgroundColor: theme.colors.inputBg,
                    borderColor: theme.colors.editorBorder,
                  }}
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            const { actions } = parseAIActions(msg.content);

            return (
              <div
                key={msg.id}
                className={`flex flex-col gap-1.5 p-3 rounded-lg border text-xs leading-relaxed ${
                  isUser ? 'ml-6' : 'mr-2'
                }`}
                style={{
                  backgroundColor: isUser
                    ? theme.type === 'dark' ? '#264f78' : '#e1f0ff'
                    : theme.colors.inputBg,
                  borderColor: isUser ? theme.colors.accent : theme.colors.editorBorder,
                  color: isUser ? (theme.type === 'dark' ? '#ffffff' : '#003366') : theme.colors.editorText,
                }}
              >
                {/* Role Header */}
                <div className="flex items-center justify-between opacity-70 text-[10px] select-none">
                  <span className="font-bold">
                    {isUser ? 'Você' : '🤖 Kilo Code AI'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Content */}
                <div className="whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>

                {/* Detected Action Cards (Write File / Edit / Colab Run) */}
                {!isUser && actions.length > 0 && (
                  <div className="mt-2 space-y-2 pt-2 border-t" style={{ borderColor: theme.colors.editorBorder }}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Ações Autônomas Detectadas
                    </div>
                    {actions.map((act, aIdx) => (
                      <div
                        key={aIdx}
                        className="p-2.5 rounded border flex flex-col gap-2"
                        style={{
                          backgroundColor: theme.type === 'dark' ? '#1a1e24' : '#f8f9fa',
                          borderColor: theme.colors.accent,
                        }}
                      >
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="font-bold text-blue-400">
                            {act.type === 'write_file' && `📄 Criar/Atualizar: ${act.path}`}
                            {act.type === 'edit_file' && `✏️ Modificar: ${act.path}`}
                            {act.type === 'colab_run' && `⚡ Executar no Colab`}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5">
                          {act.type === 'write_file' && act.content && (
                            <>
                              <button
                                onClick={() => onApplyAction(act)}
                                className="px-2.5 py-1 rounded text-xs font-semibold text-white flex items-center gap-1 transition-opacity hover:opacity-90 shadow-xs"
                                style={{ backgroundColor: '#238636' }}
                              >
                                <Check className="w-3.5 h-3.5" />
                                Aplicar Arquivo
                              </button>
                              <button
                                onClick={() => onReviewDiff(act.path || 'file.py', act.content || '', act.id)}
                                className="px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 border hover:bg-black/10 dark:hover:bg-white/10"
                                style={{ borderColor: theme.colors.editorBorder }}
                              >
                                <GitCompare className="w-3.5 h-3.5 text-blue-400" />
                                Ver Diff
                              </button>
                            </>
                          )}

                          {act.type === 'colab_run' && act.content && (
                            <button
                              onClick={() => onRunInColab(act.content || '')}
                              className="px-3 py-1 rounded text-xs font-semibold text-white flex items-center gap-1 transition-opacity hover:opacity-90 shadow-xs"
                              style={{ backgroundColor: theme.colors.accent }}
                            >
                              <Play className="w-3.5 h-3.5 fill-white" />
                              Executar no Terminal
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div 
        className="p-2.5 border-t shrink-0 flex flex-col gap-2"
        style={{ borderColor: theme.colors.editorBorder }}
      >
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Peça para criar código, otimizar para Colab GPU ou editar arquivos..."
            rows={2}
            className="w-full p-2 pr-9 text-xs rounded border outline-hidden resize-none"
            style={{
              backgroundColor: theme.colors.inputBg,
              borderColor: theme.colors.inputBorder,
              color: theme.colors.inputText,
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="absolute right-2 bottom-3 p-1.5 rounded transition-opacity disabled:opacity-30 text-white"
            style={{ backgroundColor: theme.colors.accent }}
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
