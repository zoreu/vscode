import React from 'react';
import { 
  FileCode, 
  FileJson, 
  FileText, 
  Folder, 
  FolderOpen, 
  Terminal, 
  Cpu, 
  Layers, 
  FileSpreadsheet, 
  FileCheck,
  BookOpen
} from 'lucide-react';

export function getFileIcon(name: string, isOpen: boolean = false, isFolder: boolean = false): { icon: React.ReactNode; color: string } {
  if (isFolder) {
    return {
      icon: isOpen ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />,
      color: '#dcb67a',
    };
  }

  const ext = name.split('.').pop()?.toLowerCase() || '';

  switch (ext) {
    case 'py':
      return {
        icon: <Cpu className="w-4 h-4" />,
        color: '#3776ab',
      };
    case 'ipynb':
      return {
        icon: <BookOpen className="w-4 h-4" />,
        color: '#da5b0b',
      };
    case 'js':
    case 'jsx':
      return {
        icon: <FileCode className="w-4 h-4" />,
        color: '#f7df1e',
      };
    case 'ts':
    case 'tsx':
      return {
        icon: <FileCode className="w-4 h-4" />,
        color: '#3178c6',
      };
    case 'json':
      return {
        icon: <FileJson className="w-4 h-4" />,
        color: '#cbcb41',
      };
    case 'md':
      return {
        icon: <FileText className="w-4 h-4" />,
        color: '#519aba',
      };
    case 'txt':
    case 'env':
    case 'gitignore':
      return {
        icon: <FileText className="w-4 h-4" />,
        color: '#8a8a8a',
      };
    case 'sh':
    case 'bash':
      return {
        icon: <Terminal className="w-4 h-4" />,
        color: '#4eaa25',
      };
    case 'csv':
      return {
        icon: <FileSpreadsheet className="w-4 h-4" />,
        color: '#217346',
      };
    case 'css':
    case 'scss':
      return {
        icon: <Layers className="w-4 h-4" />,
        color: '#42a5f5',
      };
    default:
      return {
        icon: <FileCheck className="w-4 h-4" />,
        color: '#8a8a8a',
      };
  }
}
