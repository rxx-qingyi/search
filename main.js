const { app, BrowserWindow, globalShortcut, ipcMain, shell, dialog, Tray, nativeImage } = require("electron");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

let mainWindow = null;
let isDragging = false;
let dragStart = { mouseX: 0, mouseY: 0, winX: 0, winY: 0 };
let tray = null;
let statusBarMode = false;

function createTray() {
  if (tray || process.platform !== "darwin") return;

  // 使用纯文字状态栏图标，避免自定义图标在深色/浅色模式下不明显
  const emptyImage = nativeImage.createEmpty();
  tray = new Tray(emptyImage);
  tray.setToolTip("My Electron App");
  // 设置一个简短文字，作为状态栏入口
  tray.setTitle("Q");

  tray.on("click", () => {
    if (!mainWindow) {
      createWindow();
    }
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      const trayBounds = tray.getBounds();
      const [winWidth, winHeight] = mainWindow.getSize();
      const targetX = Math.round(trayBounds.x + trayBounds.width / 2 - winWidth / 2);
      const targetY = Math.round(trayBounds.y + trayBounds.height + 4);
      mainWindow.setPosition(targetX, targetY, false);
      mainWindow.show();
      mainWindow.focus();
      mainWindow.webContents.send("focus-search");
    }
  });
}

function destroyTray() {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}

function createWindow() {
  const isDev = !app.isPackaged;
  const iconFileName = isDev
    ? process.platform === "darwin"
      ? "icon_dev.icns"
      : "icon_dev.ico"
    : process.platform === "darwin"
      ? "icon.icns"
      : "icon.ico";
  
  const iconPath = path.join(__dirname, "build", iconFileName);

  mainWindow = new BrowserWindow({
    width: 500,
    height: 75,
    useContentSize: true,
    frame: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    skipTaskbar: true,
    icon: iconPath,
    transparent: process.platform === "darwin",
    alwaysOnTop: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function registerGlobalShortcuts() {
  // Shift+F 切换显示/隐藏
  globalShortcut.register("Shift+F", () => {
    if (!mainWindow) return;
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
      mainWindow.webContents.send("focus-search");
    }
  });
}

function setupIpc() {
  ipcMain.on("hide-window", () => {
    if (mainWindow) {
      mainWindow.hide();
    }
  });

  ipcMain.on("resize-window", (_event, { height }) => {
    if (!mainWindow || typeof height !== "number") return;
    const bounds = mainWindow.getBounds();
    const maxHeight = 800;
    const targetHeight = Math.min(height, maxHeight);
    mainWindow.setBounds({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: targetHeight
    });
  });

  // 切换是否在状态栏中显示图标（仅 macOS 有效）
  ipcMain.on("set-status-bar-mode", (_event, enabled) => {
    if (process.platform !== "darwin") return;
    statusBarMode = !!enabled;
    if (statusBarMode) {
      createTray();
      // 仅使用状态栏图标时，可以隐藏 Dock 图标，避免重复
      if (app.dock) {
        app.dock.hide();
      }
    } else {
      destroyTray();
      // 关闭状态栏模式时，恢复 Dock 图标
      if (app.dock) {
        app.dock.show();
      }
    }
  });

  // 拖动开始
  ipcMain.on("window-drag-start", (_event, { x, y }) => {
    if (!mainWindow) return;
    const [winX, winY] = mainWindow.getPosition();
    isDragging = true;
    dragStart = { mouseX: x, mouseY: y, winX, winY };
  });

  // 拖动中
  ipcMain.on("window-drag", (_event, { x, y }) => {
    if (!mainWindow || !isDragging) return;
    const deltaX = x - dragStart.mouseX;
    const deltaY = y - dragStart.mouseY;
    mainWindow.setPosition(dragStart.winX + deltaX, dragStart.winY + deltaY);
  });

  // 拖动结束
  ipcMain.on("window-drag-end", () => {
    isDragging = false;
  });

  // 搜索执行中需要用到的外部打开
  ipcMain.handle("open-external", async (_event, url) => {
    if (!url) return;
    await shell.openExternal(url);
  });

  // 选择项目根目录
  ipcMain.handle("select-project-root", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"]
    });
    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  });

  // 读取根目录下的所有子文件夹
  ipcMain.handle("read-projects", async (_event, rootPath) => {
    if (!rootPath) return [];
    try {
      const entries = await fs.promises.readdir(rootPath, { withFileTypes: true });
      return entries
        .filter((e) => e.isDirectory())
        .map((e) => ({
          name: e.name,
          path: path.join(rootPath, e.name)
        }));
    } catch (e) {
      console.error("read-projects error:", e);
      return [];
    }
  });

  // 通过编辑器打开项目，这里以 macOS + Cursor 为例
  ipcMain.handle("open-project-in-editor", async (_event, projectPath) => {
    if (!projectPath) return;
    if (process.platform === "darwin") {
      // 使用 open -a Cursor <path>
      exec(`open -a "Cursor" "${projectPath.replace(/"/g, '\\"')}"`);
    } else {
      // 其他平台可以根据需要扩展
      await shell.openPath(projectPath);
    }
  });

  // 打开系统默认终端
  ipcMain.handle("open-terminal", async () => {
    if (process.platform === "darwin") {
      // macOS：使用系统 Terminal.app
      exec('open -a Terminal "$HOME"');
    } else if (process.platform === "win32") {
      // Windows：优先使用 cmd，回落到 powershell
      const comspec = process.env.COMSPEC || "C:\\Windows\\System32\\cmd.exe";
      // start 一个新的终端窗口
      exec(`start "" "${comspec}"`, { shell: "cmd.exe" });
    } else {
      // 其他平台暂时打开用户主目录
      await shell.openPath(process.env.HOME || process.cwd());
    }
  });
}

app.whenReady().then(() => {
  // macOS 下设置 Dock 图标（开发模式和打包后都会生效）
  if (process.platform === "darwin" && app.dock) {
    const isDev = !app.isPackaged;
    const dockIconFileName = isDev ? "icon_dev.icns" : "icon.icns";
    const dockIcon = path.join(__dirname, "build", dockIconFileName);
    try {
      app.dock.setIcon(dockIcon);
    } catch {
      // 图标缺失时忽略，不影响应用正常运行
    }
  }

  createWindow();
  // 默认创建状态栏入口，避免手动隐藏窗口后找不到入口
  createTray();
  registerGlobalShortcuts();
  setupIpc();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});


