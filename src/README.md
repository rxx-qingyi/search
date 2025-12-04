# 代码结构说明

## 目录结构

```
src/
├── components/          # React 组件 (TypeScript)
│   ├── DragBar.tsx     # 拖动条组件
│   ├── ResultItem.tsx  # 搜索结果项组件
│   ├── SearchView.tsx  # 搜索视图组件
│   └── SettingsView.tsx # 设置视图组件
├── constants.ts         # 常量定义（窗口尺寸等）
├── data/               # 数据文件
│   └── predefinedItems.ts # 预定义的搜索项
├── hooks/              # 自定义 Hooks (TypeScript)
│   ├── useActionHandler.ts # 操作处理 Hook
│   └── useWindowDrag.ts    # 窗口拖动 Hook
├── types/              # TypeScript 类型定义
│   └── index.ts        # 全局类型定义
├── utils/              # 工具函数 (TypeScript)
│   ├── search.ts       # 搜索相关函数
│   └── window.ts       # 窗口相关函数
├── App.tsx             # 主应用组件 (TypeScript)
├── main.tsx            # React 入口文件 (TypeScript)
└── styles.css          # 全局样式
```

## 文件说明

### 组件 (components/)

- **DragBar.tsx**: 顶部拖动条，用于拖动窗口
- **ResultItem.tsx**: 单个搜索结果项的展示组件
- **SearchView.tsx**: 搜索主界面，包含输入框和结果列表
- **SettingsView.tsx**: 设置页面，包含项目配置等

### 常量 (constants.ts)

定义应用中使用的基础常量：
- 窗口高度相关常量
- 最大可见结果数
- 设置页面高度

### 数据 (data/)

- **predefinedItems.ts**: 预定义的快速操作项（终端、PS、记事本等）

### Hooks (hooks/)

- **useWindowDrag.ts**: 封装窗口拖动逻辑
- **useActionHandler.ts**: 封装各种操作的处理逻辑（打开终端、计算器等）

### 类型定义 (types/)

- **index.ts**: 包含所有 TypeScript 类型定义
  - `SearchItem`: 搜索项类型
  - `Project`: 项目类型
  - `DragState`: 拖动状态类型
  - `ViewType`: 视图类型
  - `ElectronAPI`: Electron API 接口类型

### 工具函数 (utils/)

- **search.ts**: 搜索过滤函数 `filterItems()`
- **window.ts**: 窗口高度计算函数 `calculateHeight()`

### 主文件

- **App.tsx**: 主应用组件，整合所有子组件和逻辑
- **main.tsx**: React 应用入口
- **styles.css**: 全局样式定义

## TypeScript 支持

所有代码已采用 TypeScript 编写，提供完整的类型检查和智能提示。

## 使用方式

所有模块都已通过 ES6 import/export 导出，在 `App.tsx` 中统一引入使用。
