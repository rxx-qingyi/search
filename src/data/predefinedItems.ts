import type { SearchItem } from "../types";

// 预定义的搜索项
export const predefinedItems: SearchItem[] = [
  {
    type: "action",
    icon: "🖥️",
    title: "打开终端",
    desc: "terminal 终端 shell",
    content: "快速打开系统终端",
    action: "terminal"
  },
  {
    type: "action",
    icon: "🎨",
    title: "打开 Photoshop",
    desc: "ps photoshop 图像 编辑",
    content: "启动 Adobe Photoshop",
    action: "photoshop"
  },
  {
    type: "action",
    icon: "📝",
    title: "打开记事本",
    desc: "notepad 记事本 文本 editor",
    content: "打开简单文本编辑器",
    action: "notepad"
  },
  {
    type: "action",
    icon: "🌏",
    title: "打开 Safari",
    desc: "safari 浏览器 browser web",
    content: "启动 Safari 浏览器",
    action: "safari"
  },
  {
    type: "calc",
    icon: "🧮",
    title: "计算器",
    desc: "calc 计算 公式 表达式",
    content: "输入数学表达式自动计算结果",
    action: "calc"
  }
];

