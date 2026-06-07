---
layout: home

hero:
  name: "Claude Code"
  text: "源码分析阅读站"
  tagline: "基于 2026 年 3 月泄露的完整 TypeScript 源码，系统解析这个本地代码 Agent 平台的架构设计、安全机制与工程实现"
  actions:
    - theme: brand
      text: 开始阅读
      link: /guide/reading-roadmap
    - theme: alt
      text: 架构总览
      link: /chapters/01-architecture-entry
    - theme: alt
      text: GitHub 仓库
      link: https://github.com/liuup/claude-code-analysis

features:
  - icon: 🏗️
    title: 六层分层架构
    details: CLI 引导层 → TUI/REPL 层 → Query/Agent 执行内核 → Tool/Permission 层 → Memory/Persist 层 → MCP/Remote/Swarm 扩展层，完整的本地 Agent 平台
    link: /chapters/01-architecture-entry
    linkText: 查看架构分析

  - icon: 🔐
    title: 多层安全防线
    details: 双重权限闸（应用层 + 系统层）、Sandbox 内核级隔离、Unicode 注入清洗、密钥扫描、遥测隐私分级，工程成熟度高
    link: /chapters/02-security-info-collection
    linkText: 查看安全分析

  - icon: 🧠
    title: 文件化 Memory 体系
    details: Auto Memory / Session Memory / Agent Memory / Team Memory 四层分立，可审计、可分发，跨会话长期协作能力突出
    link: /chapters/03-agent-memory
    linkText: 查看 Memory 机制

  - icon: 🔧
    title: Tool Call 执行引擎
    details: Schema 校验 → 权限判断 → 并发调度 → Hook 执行 → 结果回流，完整的工具调用流水线，支持并发安全分批
    link: /chapters/05-tool-call
    linkText: 查看 Tool Call

  - icon: 🌐
    title: MCP 深度集成
    details: 支持 stdio / SSE / WebSocket / HTTP 四种传输协议，OAuth 认证，工具名统一命名，既是 MCP Client 也是 MCP Server
    link: /chapters/06-mcp
    linkText: 查看 MCP 机制

  - icon: 🤖
    title: 三套 Multi-Agent 模型
    details: 普通 subagent、coordinator → workers 协调模式、swarm teammates 团队协作，完整的 mailbox、permission bridge、task list 体系
    link: /chapters/10-multi-agent
    linkText: 查看 Multi-Agent
---

<div class="home-content">

## 事件背景

2026 年 3 月 31 日凌晨 4:23，安全研究者 [Chaofan Shou](https://x.com/Fried_rice) 在 X 发现：Anthropic 发布到 npm 的 Claude Code 包中，官方未删除 **source map 文件**，导致完整 TypeScript 源码全部泄露——包含 **1902 个源文件、513,237 行代码**。

本站基于对该源码的静态分析，系统整理了 Claude Code 的技术实现文档，供开发者学习研究。

---

## 推荐阅读顺序

### 快速入门（1 小时）

1. [架构总览](/guide/architecture-overview) — 5 分钟理解整体分层
2. [第 1 章：软件架构与程序入口](/chapters/01-architecture-entry) — 主启动链路
3. [第 18 章：总结与结论](/chapters/18-summary) — 结论先行

### 系统阅读（1 天）

按章节顺序阅读，结合 [阅读路线图](/guide/reading-roadmap) 中的依赖关系图。

### 专题研究

| 研究方向 | 推荐章节 |
|---------|---------|
| 安全/隐私 | 第 2、7、13 章 |
| AI Agent 工程 | 第 1、3、5、10 章 |
| LLM 工具调用 | 第 5、6 章 |
| 上下文管理 | 第 8、9、11 章 |
| 产品分析 | 第 14、15、16 章 |

---

## 核心模块入口

<div class="module-grid">

| 模块 | 简介 | 链接 |
|------|------|------|
| 🏗️ 总体架构 | 六层分层设计，多入口多形态 | [查看](/chapters/01-architecture-entry) |
| 🔐 安全分析 | 信息收集、攻击防御、权限体系 | [查看](/chapters/02-security-info-collection) |
| 🧠 Memory | 四层文件化记忆系统 | [查看](/chapters/03-agent-memory) |
| ⚡ Skills | Markdown 驱动的技能扩展 | [查看](/chapters/04-skills) |
| 🔧 Tool Call | 工具调用完整执行链路 | [查看](/chapters/05-tool-call) |
| 🌐 MCP | 四协议外部能力集成 | [查看](/chapters/06-mcp) |
| 🛡️ Sandbox | 内核级命令隔离机制 | [查看](/chapters/07-sandbox) |
| 📏 Context | 动态上下文压缩管理 | [查看](/chapters/08-context) |
| 📝 Prompt | 六层分层 Prompt 组装 | [查看](/chapters/09-prompt) |
| 🤖 Multi-Agent | 三套 Agent 协作模型 | [查看](/chapters/10-multi-agent) |
| 💾 Session | Append-only 会话持久化 | [查看](/chapters/11-session-storage) |
| 🧩 组件体系 | TUI 组件完整拆解 | [查看](/components/component-overview) |
| 📊 流程图 | 核心流程 Mermaid 可视化 | [查看](/diagrams/startup-flow) |
| 🆚 产品对比 | 与 Codex / Gemini CLI / Aider / Cursor 对比 | [查看](/chapters/16-product-comparison) |

</div>

---

## 免责声明

> **本项目仅供学术研究与技术学习使用。**
>
> Claude Code 的所有权利归 [Anthropic](https://www.anthropic.com) 所有。
>
> 1. **无侵权意图**：本分析文档基于已在公共互联网上广泛流传的信息整理撰写，目的在于帮助开发者了解 AI Coding Agent 的安全边界、隐私设计与工程架构，属于正当的技术研究行为。
> 2. **禁止商业使用**：禁止将本站内容用于任何商业目的，或以此绕过、破坏 Claude Code 的安全机制与用户协议。
> 3. **免责**：作者不对因参考本文档而产生的任何直接或间接损失负责。如有合规疑虑，请以 Anthropic 官方文档与用户协议为准。
> 4. **如需删除**：若 Anthropic 认为内容侵权，请通过 [Issue](https://github.com/liuup/claude-code-analysis/issues) 联系，核实后第一时间处理。

</div>

<style>
.home-content {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

.module-grid table {
  width: 100%;
}
</style>
