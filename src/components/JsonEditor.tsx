import React from "react";
import { Editor } from "@monaco-editor/react";

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: number;
}

/**
 * 轻量 JSON 编辑器（Monaco）
 */
export function JsonEditor({ value, onChange, height = 260 }: JsonEditorProps): JSX.Element {
  return (
    <div className="json-editor-container">
      <Editor
        height={height}
        defaultLanguage="json"
        value={value}
        onChange={(v) => onChange(v ?? "")}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          formatOnPaste: true,
          formatOnType: true
        }}
      />
    </div>
  );
}

