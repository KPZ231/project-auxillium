"use client";

import React, { useCallback, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { EditorView, ViewUpdate } from '@codemirror/view';
import { VariableAutocomplete } from './VariableAutocomplete';

interface MarkdownPanelProps {
  value: string;
  onChange: (value: string) => void;
}

export const MarkdownPanel: React.FC<MarkdownPanelProps> = ({ value, onChange }) => {
  const [autocomplete, setAutocomplete] = useState<{ top: number; left: number; offset: number } | null>(null);

  const handleUpdate = useCallback((update: ViewUpdate) => {
    if (update.docChanged) {
      onChange(update.state.doc.toString());
    }

    // Check for {{ trigger
    const state = update.state;
    const cur = state.selection.main.head;
    const line = state.doc.lineAt(cur);
    const lineText = line.text.slice(0, cur - line.from);
    
    if (lineText.endsWith('{{')) {
      const coords = update.view.coordsAtPos(cur);
      if (coords) {
        setAutocomplete({ 
          top: coords.bottom + 5, 
          left: coords.left,
          offset: cur
        });
      }
    } else if (autocomplete && !lineText.includes('{{', lineText.lastIndexOf('{{'))) {
      setAutocomplete(null);
    }
  }, [onChange, autocomplete]);

  const selectVariable = useCallback((variable: string) => {
    if (!autocomplete) return;
    
    const newValue = value.slice(0, autocomplete.offset) + variable + '}}' + value.slice(autocomplete.offset);
    onChange(newValue);
    setAutocomplete(null);
  }, [value, onChange, autocomplete]);

  return (
    <div className="flex-1 relative h-full border-r border-[#E5E5E5] bg-white">
      <CodeMirror
        value={value}
        height="100%"
        theme="light"
        extensions={[
          markdown({ base: markdownLanguage, codeLanguages: languages }),
          EditorView.lineWrapping,
          EditorView.theme({
            '&': { fontSize: '14px', fontFamily: 'Inter, sans-serif' },
            '.cm-content': { padding: '20px' },
            '.cm-gutters': { display: 'none' }
          })
        ]}
        onUpdate={handleUpdate}
        className="h-full"
      />

      {autocomplete && (
        <VariableAutocomplete 
          position={{ top: autocomplete.top, left: autocomplete.left }}
          onSelect={selectVariable}
          onClose={() => setAutocomplete(null)}
        />
      )}
    </div>
  );
};
