import { AIAction } from '../types/vscode';

export function parseAIActions(text: string): { cleanedText: string; actions: AIAction[] } {
  const actions: AIAction[] = [];
  let actionCounter = 1;

  // Regex to detect ```action:write_file\npath: ...\ncontent...```
  const writeFileRegex = /```(?:action:)?write_file\s*\npath:\s*([^\n]+)\n([\s\S]*?)```/g;
  let match;
  while ((match = writeFileRegex.exec(text)) !== null) {
    const path = match[1].trim();
    const content = match[2];
    actions.push({
      id: `act-write-${Date.now()}-${actionCounter++}`,
      type: 'write_file',
      path,
      content,
      status: 'pending',
    });
  }

  // Regex to detect ```action:edit_file\npath: ...\nsearch: <<<<<<< SEARCH\n...\n=======\n...\n>>>>>>> REPLACE\n```
  const editFileRegex = /```(?:action:)?edit_file\s*\npath:\s*([^\n]+)\s*\nsearch:\s*<<<<<<<\s*SEARCH\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>>\s*REPLACE\s*```/g;
  while ((match = editFileRegex.exec(text)) !== null) {
    const path = match[1].trim();
    const search = match[2];
    const replace = match[3];
    actions.push({
      id: `act-edit-${Date.now()}-${actionCounter++}`,
      type: 'edit_file',
      path,
      search,
      replace,
      status: 'pending',
    });
  }

  // Regex to detect colab command runs ```action:colab_run\n...```
  const colabRunRegex = /```(?:action:)?colab_run\s*\n([\s\S]*?)```/g;
  while ((match = colabRunRegex.exec(text)) !== null) {
    const content = match[1].trim();
    actions.push({
      id: `act-run-${Date.now()}-${actionCounter++}`,
      type: 'colab_run',
      content,
      status: 'pending',
    });
  }

  return { cleanedText: text, actions };
}
