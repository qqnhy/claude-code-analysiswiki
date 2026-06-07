# 项目概览

## 这是什么

本站是对 **Claude Code** 泄露源码的系统性技术分析文档集，整理自 GitHub 仓库 [liuup/claude-code-analysis](https://github.com/liuup/claude-code-analysis)。

Claude Code 是 Anthropic 开发的本地代码 Agent 平台，基于终端运行，能够读写文件、执行命令、调用外部工具，并通过 MCP 协议接入第三方能力。

## 事件背景

2026 年 3 月 31 日，安全研究者 Chaofan Shou 发现 Anthropic 发布到 npm 的 Claude Code 包中，**未删除 source map 文件**，导致完整 TypeScript 源码全部泄露：

- **源文件数量**：1902 个
- **代码行数**：513,237 行
- **语言**：TypeScript / TSX

这是一次意外泄露，本站的分析基于公开信息的二次整理，目的是帮助开发者理解 AI Coding Agent 的工程设计。

## 本站涵盖内容

| 分析维度 | 章节 | 核心问题 |
|---------|------|---------|
| 总体架构 | 第 1、12 章 | 项目如何启动，各层如何协作 |
| 安全与隐私 | 第 2、13 章 | 收集哪些数据，有哪些防线 |
| Memory 机制 | 第 3 章 | 如何跨会话记忆，文件怎么组织 |
| 能力扩展 | 第 4、5、6 章 | Skills / Tool Call / MCP 如何实现 |
| 系统隔离 | 第 7 章 | Sandbox 如何做到内核级隔离 |
| 上下文管理 | 第 8、9、11 章 | Context 压缩、Prompt 组装、会话持久化 |
| 多 Agent | 第 10 章 | 三套协作模型的源码实现 |
| 扩展发现 | 第 13、14、15 章 | 隐藏功能、Feature Flags、情绪检测 |
| 产品对比 | 第 16 章 | 与 Codex / Gemini CLI / Aider / Cursor 对比 |
| 组件体系 | 组件系列 | TUI 界面全组件拆解 |

## 适合哪些读者

- **AI 工程师**：想理解 Agent 平台的工程化实现
- **安全研究者**：关注 AI 工具的隐私和安全边界
- **产品研究者**：研究 AI Coding Agent 的产品设计
- **开发者**：想基于 Claude Code 做二次开发或集成

## 不适合哪些读者

- 希望找到绕过 Claude Code 安全机制方法的读者——本站不含此类内容
- 寻求商业用途分析的读者——本站仅供学术研究

## 声明

> 本项目仅供学术研究与技术学习使用。Claude Code 版权归 Anthropic 所有。详见[首页免责声明](/)。
