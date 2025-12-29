import { useEffect, useState } from "react";
import { JsonEditor } from "./JsonEditor";

interface JsonEditorPageProps {
  onBack: () => void;
}

/**
 * 独立 JSON 编辑器页面
 */
export function JsonEditorPage({ onBack }: JsonEditorPageProps): JSX.Element {
  const [jsonText, setJsonText] = useState<string>(() => {
    try {
      return localStorage.getItem("customJsonDraft") || "{\n  \n}";
    } catch {
      return "{\n  \n}";
    }
  });
  const [jsonError, setJsonError] = useState<string>("");

  // JSON 内容校验与持久化
  useEffect(() => {
    try {
      JSON.parse(jsonText || "{}");
      setJsonError("");
    } catch (e) {
      setJsonError((e as Error).message || "JSON 解析失败");
    }

    try {
      localStorage.setItem("customJsonDraft", jsonText);
    } catch {
      // ignore storage error
    }
  }, [jsonText]);

  const handleFormatJson = (): void => {
    try {
      const formatted = JSON.stringify(JSON.parse(jsonText || "{}"), null, 2);
      setJsonText(formatted);
      setJsonError("");
    } catch (e) {
      setJsonError((e as Error).message || "JSON 解析失败");
    }
  };

  const handleResetJson = (): void => {
    setJsonText("{\n  \n}");
    setJsonError("");
  };

  return (
    <div className="settings-root">
      <div className="settings-header drag-region">
        <span className="settings-title">JSON 编辑器</span>
        <button className="settings-close" onClick={onBack}>
          返回
        </button>
      </div>
      <div className="settings-content">
        <div className="settings-section">
          <div className="settings-section-title">编辑</div>
          <div className="settings-field" style={{ alignItems: "center" }}>
            <span className="settings-label">JSON 文档</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="settings-close" onClick={handleFormatJson}>
                格式化
              </button>
              <button className="settings-close" onClick={handleResetJson}>
                重置为空
              </button>
            </div>
          </div>
          <JsonEditor value={jsonText} onChange={setJsonText} height={360} />
          <div style={{ marginTop: 6, fontSize: 12, color: jsonError ? "#d9534f" : "#2d8a34" }}>
            {jsonError ? `JSON 解析错误：${jsonError}` : "JSON 语法正常"}
          </div>
        </div>
      </div>
    </div>
  );
}

