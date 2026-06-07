# 第 17 章：源码证据索引

## 本章信息

| | |
|--|--|
| **本章目标** | 提供各章节核心结论的源码证据快速检索 |
| **适合读者** | 需要验证分析结论的读者 |
| **前置知识** | 无 |
| **核心结论** | 本章为索引文档，供交叉验证使用 |

---

> 所有路径相对于 `src/` 目录。

---

## 架构相关

| 结论 | 源码路径 | 关键标志 |
|------|---------|---------|
| cli.tsx 做早期分流 | `entrypoints/cli.tsx` | 多个 `process.exit(0)` 快路径 |
| main.tsx 有约 80 个 import | `main.tsx` | 文件顶部 import 列表 |
| query.ts 是主循环 | `query.ts` | `export async function* query(...)` |
| QueryEngine 无 UI | `QueryEngine.ts` | 无 Ink/React 依赖 |
| AppState 约 20 个字段 | `state/AppState.ts` | type AppState 定义 |
| 工具池组装 | `tools.ts` | `export function getTools(...)` |
| 六层分层 | `main.tsx` + `entrypoints/` | 整体 import 关系 |

---

## 安全相关

| 结论 | 源码路径 | 关键函数 |
|------|---------|---------|
| Unicode 隐写清洗 | `utils/sanitization.ts` | `partiallySanitizeUnicode()` |
| 递归清洗 JSON | `utils/sanitization.ts` | `recursivelySanitizeUnicode()` |
| 危险 Bash 模式黑名单 | `utils/permissions/dangerousPatterns.ts` | `DANGEROUS_BASH_PATTERNS` |
| 危险权限检测 | `utils/permissions/permissionSetup.ts` | `isDangerousBashPermission()` |
| Git 裸库清理 | `utils/sandbox/sandbox-adapter.ts` | `scrubBareGitRepoFiles()` |
| 密钥扫描规则 | `services/teamMemorySync/secretScanner.ts` | `SECRET_RULES` |
| 遥测 PII 类型标注 | `services/analytics/index.ts` | `AnalyticsMetadata_I_VERIFIED_...` |
| 隐私分级控制 | `utils/privacyLevel.ts` | `getPrivacyLevel()` |
| MCP 工具名脱敏 | `services/analytics/metadata.ts` | `sanitizeToolNameForAnalytics()` |
| bypassPermissions 保护 | `utils/permissions/bypassPermissionsKillswitch.ts` | Statsig 开关 |

---

## Memory 相关

| 结论 | 源码路径 | 关键标志 |
|------|---------|---------|
| MEMORY.md 200 行 / 25KB 上限 | `memdir/memdir.ts` | `MAX_ENTRYPOINT_LINES / BYTES` |
| buildMemoryPrompt 同步读取 | `memdir/memdir.ts` | `fs.readFileSync(entrypoint)` |
| 相关性召回 | `memdir/findRelevantMemories.ts` | `findRelevantMemories()` |
| Session Memory | `services/SessionMemory/sessionMemory.ts` | 整个文件 |
| Agent Memory scope | `tools/AgentTool/agentMemory.ts` | `type AgentMemoryScope` |
| Team Memory 同步 | `services/teamMemorySync/index.ts` | push/pull 逻辑 |
| Memory 文件选择器 UI | `components/memory/MemoryFileSelector.tsx` | 整个文件 |

---

## Tool Call 相关

| 结论 | 源码路径 | 关键函数 |
|------|---------|---------|
| Tool 基础接口 | `Tool.ts` | `interface Tool<TInput, TOutput>` |
| partitionToolCalls | `services/tools/toolOrchestration.ts` | `partitionToolCalls()` |
| 并发批次执行 | `services/tools/toolOrchestration.ts` | `runToolsConcurrently()` |
| 单工具执行流程 | `services/tools/toolExecution.ts` | `executeSingleTool()` |
| 流式执行器 | `services/tools/StreamingToolExecutor.ts` | 整个文件 |

---

## MCP 相关

| 结论 | 源码路径 | 关键函数 |
|------|---------|---------|
| MCP 工具命名规则 | `services/mcp/mcpStringUtils.ts` | `buildMcpToolName()` |
| 四种传输协议 | `services/mcp/client.ts` | `connectToServer()` |
| memoize 连接复用 | `services/mcp/client.ts` | `memoize(...)` |
| OAuth Step-up | `services/mcp/auth.ts` | `detectStepUpRequired()` |
| MCP Server 入口 | `entrypoints/mcp.ts` | `startMcpServer()` |

---

## Sandbox 相关

| 结论 | 源码路径 | 关键函数 |
|------|---------|---------|
| 入沙箱判断 | `tools/BashTool/shouldUseSandbox.ts` | `shouldUseSandbox()` |
| 配置翻译 | `utils/sandbox/sandbox-adapter.ts` | `convertToSandboxRuntimeConfig()` |
| 权限协同 | `tools/BashTool/bashPermissions.ts` | `checkSandboxAutoAllow()` |
| 沙盒诊断 UI | `components/sandbox/SandboxDoctorSection.tsx` | 整个文件 |

---

## 多 Agent 相关

| 结论 | 源码路径 | 关键函数 |
|------|---------|---------|
| AgentTool 模式判断 | `tools/AgentTool/AgentTool.tsx` | `callAgentTool()` |
| forkSubagent | `tools/AgentTool/forkSubagent.ts` | `forkSubagent()` |
| coordinator prompt | `coordinator/coordinatorMode.ts` | `buildCoordinatorPrompt()` |
| Swarm backend 注册表 | `utils/swarm/backends/registry.ts` | `BACKEND_REGISTRY` |
| Mailbox 通信 | `utils/teammateMailbox.ts` | 整个文件 |
| Permission bridge | `utils/swarm/leaderPermissionBridge.ts` | `requestPermission()` |

---

## Session 持久化相关

| 结论 | 源码路径 | 关键函数 |
|------|---------|---------|
| Append-only 写入 | `utils/sessionStorage.ts` | `appendToTranscript()` |
| 恢复流水线 | `utils/conversationRecovery.ts` | `loadTranscript()` |
| Resume UI | `screens/ResumeConversation.tsx` | 整个文件 |
| 远端 ingress | `services/api/sessionIngress.ts` | 整个文件 |

---

## Context 管理相关

| 结论 | 源码路径 | 关键函数 |
|------|---------|---------|
| 有效窗口计算 | `services/compact/autoCompact.ts` | `getEffectiveContextWindowSize()` |
| 1M context 检测 | `utils/context.ts` | `has1mContext()` |
| Auto-compact 触发 | `services/compact/autoCompact.ts` | `shouldCompact()` |
| compact prompt | `services/compact/prompt.ts` | 整个文件 |

---

## 隐藏功能相关

| 结论 | 源码路径 | 关键标志 |
|------|---------|---------|
| 内部命令列表 | `commands.ts` | `INTERNAL_ONLY_COMMANDS` |
| feature gate | `utils/undercover.ts` | `feature()` 函数 |
| 命令 isHidden | `types/command.ts` | `isHidden?: boolean` |
| 负面关键词列表 | `utils/userPromptKeywords.ts` | `NEGATIVE_KEYWORDS` |
| 反馈问卷触发 | `components/FeedbackSurvey/useFeedbackSurvey.tsx` | 整个文件 |

---

## Trust 边界相关

| 结论 | 源码路径 | 关键标志 |
|------|---------|---------|
| CLAUDE.md 四级信任 | `utils/claudemd.ts` | `type ClaudeMdTrust` |
| @include 深度上限 5 | `utils/claudemd.ts:537` | `MAX_INCLUDE_DEPTH = 5` |
| Trust-first 初始化 | `entrypoints/init.ts` | `applySafeEnvironmentVariables()` |

---

## 下一步阅读建议

- [第 18 章：总结](/chapters/18-summary) — 综合结论
- [阅读路线图](/guide/reading-roadmap) — 如何系统阅读各章
