import React from 'react';
import { 
  Files, 
  Search, 
  GitBranch, 
  Bot, 
  Zap, 
  Blocks, 
  Settings, 
  Sun, 
  Moon,
  Sparkles
} from 'lucide-react';
import { SidebarView, ThemeConfig } from '../../types/vscode';

interface ActivityBarProps {
  activeView: SidebarView | null;
  onSelectView: (view: SidebarView) => void;
  theme: ThemeConfig;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  gitModifiedCount: number;
  aiPendingCount: number;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activeView,
  onSelectView,
  theme,
  onToggleTheme,
  onOpenSettings,
  gitModifiedCount,
  aiPendingCount,
}) => {
  const isDark = theme.type === 'dark';

  const items: { id: SidebarView; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'explorer', label: 'Explorador (Ctrl+Shift+E)', icon: <Files className="w-5 h-5" /> },
    { id: 'search', label: 'Pesquisar (Ctrl+Shift+F)', icon: <Search className="w-5 h-5" /> },
    { id: 'git', label: 'Controle de Código-Fonte', icon: <GitBranch className="w-5 h-5" />, badge: gitModifiedCount },
    { id: 'kilo-ai', label: 'Kilo Code AI Assistant', icon: <Bot className="w-5 h-5" />, badge: aiPendingCount },
    { id: 'colab', label: 'Google Colab Bridge & GPU', icon: <Zap className="w-5 h-5" /> },
    { id: 'extensions', label: 'Extensões', icon: <Blocks className="w-5 h-5" /> },
  ];

  return (
    <div 
      id="vscode-activity-bar"
      className="hidden md:flex flex-col justify-between items-center w-12 py-2 select-none border-r z-20 shrink-0"
      style={{
        backgroundColor: theme.colors.activityBarBg,
        borderColor: theme.colors.editorBorder,
        color: theme.colors.activityBarText,
      }}
    >
      {/* Top Icons */}
      <div className="flex flex-col items-center gap-1 w-full">
        {items.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              id={`activity-btn-${item.id}`}
              onClick={() => onSelectView(item.id)}
              title={item.label}
              className={`relative w-12 h-11 flex items-center justify-center transition-colors ${
                isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                color: isActive ? theme.colors.activityBarActiveText : theme.colors.activityBarText,
              }}
            >
              {/* Left active border indicator */}
              {isActive && (
                <div 
                  className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r"
                  style={{ backgroundColor: theme.colors.activityBarActive }}
                />
              )}
              {item.icon}
              
              {/* Badge if modified files or pending AI actions */}
              {Boolean(item.badge && item.badge > 0) && (
                <span 
                  className="absolute top-1.5 right-1.5 px-1 min-w-3.5 h-3.5 rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs"
                  style={{
                    backgroundColor: theme.colors.badgeBg,
                    color: theme.colors.badgeText,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Icons */}
      <div className="flex flex-col items-center gap-1 w-full">
        {/* Theme Quick Switcher */}
        <button
          id="theme-quick-toggle-btn"
          onClick={onToggleTheme}
          title={`Alternar para tema ${isDark ? 'Claro' : 'Escuro'}`}
          className="w-12 h-10 flex items-center justify-center opacity-70 hover:opacity-100 transition-colors"
          style={{ color: theme.colors.activityBarText }}
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
        </button>

        {/* Settings button */}
        <button
          id="activity-btn-settings"
          onClick={onOpenSettings}
          title="Configurações (Ctrl+,)"
          className={`w-12 h-10 flex items-center justify-center transition-colors ${
            activeView === 'settings' ? 'opacity-100' : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            color: activeView === 'settings' ? theme.colors.activityBarActiveText : theme.colors.activityBarText,
          }}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
