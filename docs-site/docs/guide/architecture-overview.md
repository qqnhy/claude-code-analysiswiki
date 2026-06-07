# 架构快览

> 5 分钟建立 Claude Code 的整体架构心智模型。

## 一句话定义

Claude Code **不是**命令行聊天工具，而是一套"本地优先、可扩展到远端"的代码 Agent 平台，具备独立的执行内核、分层 Memory 系统和多 Agent 运行时。

## 六层分层架构

```
┌─────────────────────────────────────┐
│  第一层：CLI 引导层                  │  ← 快路径分流，避免完整初始化
│  entrypoints/cli.tsx / main.tsx     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  第二层：初始化层                    │  ← trust 前/后分阶段初始化
│  init.ts / setup.ts                 │
└──────┬───────────────┬──────────────┘
       │               │
┌──────▼──────┐  ┌─────▼──────────────┐
│ 控制面/命令层 │  │  TUI / REPL 层     │  ← 命令解析 & 用户界面
│ commands.ts  │  │  REPL.tsx / App    │
└─────────────┘  └──────────┬─────────┘
                             │
               ┌─────────────▼─────────────┐
               │  第四层：Query/Agent 执行内核│  ← 系统核心主循环
               │  query.ts / QueryEngine.ts │
               └──────┬──────┬──────┬──────┘
                      │      │      │
          ┌───────────▼┐  ┌──▼──┐  ┌▼──────────────┐
          │Tool/Perm 层│  │Mem  │  │ 扩展层         │
          │Tool.ts     │  │层   │  │MCP/Plugin/     │
          │orchestration│  │     │  │Remote/Swarm    │
          └────────────┘  └─────┘  └───────────────-┘
```

## 四种运行形态

| 形态 | 入口 | 特点 |
|------|------|------|
| **REPL/TUI** | `replLauncher.tsx` | 默认交互模式，有完整界面 |
| **Headless/SDK** | `QueryEngine.ts` | 无 UI，可被程序直接调用 |
| **MCP Server** | `entrypoints/mcp.ts` | 把内部工具暴露为 MCP 协议 |
| **Remote/Bridge** | `bridge/bridgeMain.ts` | 连接远端 Orchestrator |

所有形态**共用同一套** `query.ts` 执行内核，不存在两套实现。

## 核心数据流

```
用户输入
  → query.ts 主循环
    → Claude API（流式）
    → 提取 tool_use blocks
    → runTools（并发/串行分批）
      → 权限判断 → 工具执行 → tool_result
    → 结果回流到下一轮
  → 落盘 transcript / 更新 memory
```

## 关键文件速查

| 职责 | 文件 |
|------|------|
| 入口分流 | `src/entrypoints/cli.tsx` |
| 总控编排 | `src/main.tsx` |
| 执行主循环 | `src/query.ts` |
| 无 UI 引擎 | `src/QueryEngine.ts` |
| 工具池组装 | `src/tools.ts` |
| 工具调度 | `src/services/tools/toolOrchestration.ts` |
| Memory 系统 | `src/memdir/memdir.ts` |
| MCP 客户端 | `src/services/mcp/client.ts` |
| 沙盒适配 | `src/utils/sandbox/sandbox-adapter.ts` |
| 会话持久化 | `src/utils/sessionStorage.ts` |

## 下一步

- [第 1 章：完整架构分析](/chapters/01-architecture-entry) — 每一层的详细实现
- [流程图](/diagrams/startup-flow) — 可视化的启动和执行流程
- [术语表](/guide/glossary) — 文档中使用的专业术语解释
