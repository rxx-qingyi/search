# 应用图标说明

此目录用于存放打包时使用的应用图标：

- `icon.icns`：macOS 应用与 DMG 的图标（推荐 512x512 或更高，使用 macOS icns 格式）
- `icon.ico`：Windows 安装包与应用的图标（包含 16/32/48/256 多尺寸）

使用方式：

1. 使用图标制作工具（如 Icon Set 或在线转换工具）从你的 PNG/SVG 生成对应的 `.icns` 与 `.ico`。
2. 将生成的文件重命名为：
   - `icon.icns`
   - `icon.ico`
3. 放到本目录下后，再执行：

```bash
# macOS 打包
yarn dist:mac

# Windows 上打包
yarn dist:win
```


