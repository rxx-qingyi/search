const { contextBridge, ipcRenderer, clipboard } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  onFocusSearch: (callback) => {
    ipcRenderer.on("focus-search", (_event, ...args) => callback(...args));
  },
  hideWindow: () => ipcRenderer.send("hide-window"),
  resizeWindow: (height) => ipcRenderer.send("resize-window", { height }),
  setStatusBarMode: (enabled) => ipcRenderer.send("set-status-bar-mode", !!enabled),
  windowDragStart: (coords) => ipcRenderer.send("window-drag-start", coords),
  windowDrag: (coords) => ipcRenderer.send("window-drag", coords),
  windowDragEnd: () => ipcRenderer.send("window-drag-end"),
  openExternal: (url) => ipcRenderer.invoke("open-external", url),
  writeClipboardText: (text) => clipboard.writeText(text),
  selectProjectRoot: () => ipcRenderer.invoke("select-project-root"),
  readProjects: (rootPath) => ipcRenderer.invoke("read-projects", rootPath),
  openProjectInEditor: (projectPath) => ipcRenderer.invoke("open-project-in-editor", projectPath),
  openTerminal: () => ipcRenderer.invoke("open-terminal")
});


