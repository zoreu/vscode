import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Trash2, 
  Edit3, 
  FilePlus, 
  FolderPlus,
  MoreVertical 
} from 'lucide-react';
import { FileNode, ThemeConfig } from '../../types/vscode';
import { getFileIcon } from '../../utils/fileIcons';

interface FileTreeItemProps {
  node: FileNode;
  allNodes: FileNode[];
  activeFileId: string | null;
  onSelectFile: (file: FileNode) => void;
  onToggleFolder: (folderId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onRenameNode: (nodeId: string, newName: string) => void;
  onCreateNew: (parentId: string | null, type: 'file' | 'folder') => void;
  theme: ThemeConfig;
  depth?: number;
}

export const FileTreeItem: React.FC<FileTreeItemProps> = ({
  node,
  allNodes,
  activeFileId,
  onSelectFile,
  onToggleFolder,
  onDeleteNode,
  onRenameNode,
  onCreateNew,
  theme,
  depth = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(node.name);

  const isFolder = node.type === 'folder';
  const isActive = activeFileId === node.id;
  const { icon, color } = getFileIcon(node.name, node.isOpen, isFolder);

  const childNodes = isFolder
    ? allNodes.filter((n) => n.parentId === node.id)
    : [];

  const handleFinishRename = () => {
    if (newName.trim() && newName !== node.name) {
      onRenameNode(node.id, newName.trim());
    } else {
      setNewName(node.name);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFinishRename();
    } else if (e.key === 'Escape') {
      setNewName(node.name);
      setIsEditing(false);
    }
  };

  return (
    <div className="w-full select-none text-[13px]">
      <div
        id={`file-tree-item-${node.id}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          if (isFolder) {
            onToggleFolder(node.id);
          } else {
            onSelectFile(node);
          }
        }}
        className={`group relative flex items-center justify-between py-1 px-2 cursor-pointer transition-colors ${
          isActive ? 'font-medium' : ''
        }`}
        style={{
          paddingLeft: `${depth * 14 + 10}px`,
          backgroundColor: isActive
            ? theme.type === 'dark' ? '#37373d' : '#e4e6f1'
            : isHovered
            ? theme.type === 'dark' ? '#2a2d2e' : '#f0f0f0'
            : 'transparent',
          color: isActive ? theme.colors.tabActiveText : theme.colors.editorText,
        }}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {/* Chevron for folder */}
          {isFolder ? (
            <span className="w-4 h-4 flex items-center justify-center shrink-0 opacity-70">
              {node.isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </span>
          ) : (
            <span className="w-4 shrink-0" />
          )}

          {/* File or Folder Icon */}
          <span style={{ color }} className="shrink-0 flex items-center">
            {icon}
          </span>

          {/* Name or Rename Input */}
          {isEditing ? (
            <input
              type="text"
              value={newName}
              autoFocus
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleFinishRename}
              onKeyDown={handleKeyDown}
              className="text-xs px-1 py-0.5 rounded outline-hidden border w-full"
              style={{
                backgroundColor: theme.colors.inputBg,
                borderColor: theme.colors.accent,
                color: theme.colors.inputText,
              }}
            />
          ) : (
            <span className="truncate flex-1" title={node.path}>
              {node.name}
            </span>
          )}

          {/* Modified badge dot */}
          {node.isModified && !isEditing && (
            <span 
              className="w-2 h-2 rounded-full shrink-0 mr-1 opacity-90"
              style={{ backgroundColor: theme.colors.accent }}
              title="Arquivo modificado"
            />
          )}
        </div>

        {/* Hover Action Buttons */}
        {isHovered && !isEditing && (
          <div 
            className="flex items-center gap-1 shrink-0 ml-1 opacity-80 group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            {isFolder && (
              <>
                <button
                  onClick={() => onCreateNew(node.id, 'file')}
                  title="Novo arquivo nesta pasta"
                  className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onCreateNew(node.id, 'folder')}
                  title="Nova pasta nesta pasta"
                  className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            <button
              onClick={() => setIsEditing(true)}
              title="Renomear"
              className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeleteNode(node.id)}
              title="Excluir"
              className="p-0.5 rounded hover:bg-red-500/20 text-red-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Render children if folder and open */}
      {isFolder && node.isOpen && childNodes.length > 0 && (
        <div className="w-full">
          {childNodes.map((child) => (
            <FileTreeItem
              key={child.id}
              node={child}
              allNodes={allNodes}
              activeFileId={activeFileId}
              onSelectFile={onSelectFile}
              onToggleFolder={onToggleFolder}
              onDeleteNode={onDeleteNode}
              onRenameNode={onRenameNode}
              onCreateNew={onCreateNew}
              theme={theme}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
