# 第 13 章：深度探索与边界案例

## 本章信息

| | |
|--|--|
| **本章目标** | 记录在常规文档中被忽略的深层机制与边界案例 |
| **适合读者** | 对系统设计细节有深度兴趣的读者 |
| **前置知识** | 第 2 章（安全分析）、第 1 章（架构） |
| **核心结论** | Trust 边界程序化处理、Swarm 全局状态桥、PII 主动切断设计——三类被低估的深层机制 |

---

## 核心结论

本章记录三类深层机制：

1. **Trust 边界的程序化处理**：配置文件如何被分级信任，防止"配置文件本身是攻击面"
2. **Swarm 全局状态桥**：多 agent 架构中的上下文同步问题
3. **隐私耦合的主动切断设计**：从架构层面防止 PII 意外泄漏

---

## 一、Trust 边界的程序化处理

### CLAUDE.md 的四级信任模型

**文件**：`src/utils/claudemd.ts`

CLAUDE.md 有四个信任层级，不是扁平系统：

| 类型 | 路径 | 信任级别 |
|------|------|---------|
| `Managed` | `/etc/claude-code/CLAUDE.md` | 最高（系统管理员） |
| `User` | `~/.claude/CLAUDE.md` | 高（用户全局） |
| `Project` | `{cwd}/CLAUDE.md`、`{cwd}/.claude/CLAUDE.md` | 中（项目约定） |
| `Local` | `.claude/rules/*.md` | 最低（本地约定） |

信任级别体现在 system prompt 的拼接顺序——高信任优先。企业可以通过 `Managed` 层强制注入不可覆盖的规则。

### `@include` 深度限制

```typescript
// src/utils/claudemd.ts:537
const MAX_INCLUDE_DEPTH = 5
```

`@include <path>` 引入外部文件的嵌套深度硬上限为 5 层，防止：
- 循环 `@include`（A includes B, B includes A）
- 无限深度导致内存耗尽
- 恶意配置文件通过 `@include` 绕过大小限制

### Trust-First 初始化顺序

```
进程启动
  │
  ├─ init.ts：只应用"安全的"环境变量（trust 建立前）
  │            注册遥测 skeleton（但不发事件）
  │
  ├─ Trust 建立（用户确认/缓存命中）
  │
  └─ initializeTelemetryAfterTrust()：
       - 应用全部环境变量（含 CLAUDE.md @include）
       - 开始发送遥测事件
```

**攻击场景**：若 CLAUDE.md 可以 `@include` 任意文件，且 trust 前就被应用，攻击者可在项目目录放置恶意 CLAUDE.md 让工具执行任意指令。Trust-First 设计系统性消除了这个攻击面。

---

## 二、Swarm 全局状态桥

### 问题：多 agent 的上下文同步

在 Swarm 模式下，每个 teammate agent 有独立的上下文，但某些状态需要全局共享：
- 权限决策（见第 10 章 permission bridge）
- 团队任务列表
- 共享 Team Memory

### 实现：SharedContext 机制

```typescript
// src/utils/swarm/ 中的共享状态设计
type SwarmGlobalContext = {
  sharedTaskList:    Map<string, TaskState>      // 全局任务列表
  mailboxQueues:     Map<string, Message[]>       // 每个 teammate 的消息队列
  permissionChannel: Channel<PermissionRequest>  // 权限上升通道
  teamMemory:        string                       // 共享 Team Memory 内容
}
```

**关键设计决策**：
- `sharedTaskList` 是只追加的（类似 transcript），防止竞态
- `mailboxQueues` 每个 teammate 独立（inbox polling 不共享）
- `permissionChannel` 单向（worker → leader），无双向循环风险

---

## 三、隐私耦合的主动切断设计

### PII 类型标注系统

**文件**：`src/services/analytics/index.ts`

```typescript
// 强制开发者"签名"确认数据不含代码/文件路径
export type AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS = never

// 上报 PII 字段时必须显式转换，等于代码级别的审计
function trackEvent(event: {
  // PII 字段使用 _PROTO_ 前缀标记
  _PROTO_userId?: string & AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS
}) { ... }
```

这个类型设计让 PII 泄漏成为**编译期错误**，而不是运行时 bug。

### 三路数据分流

```
遥测数据
  │
  ├─ 非 PII 数据 ──────> Datadog（通用日志，宽泛访问）
  │
  ├─ PII 数据（_PROTO_* 字段）
  │     │
  │     └─ BigQuery 专属列（有访问控制，需审批）
  │
  └─ MCP 工具名 mcp__server__tool
        │
        └─> 替换为 'mcp_tool'（不暴露 server 名称）
```

---

## 四、配置文件的大小保护

多处硬编码的上限保护：

| 保护对象 | 上限 | 文件 |
|---------|------|------|
| MEMORY.md 索引 | 200 行 / 25,000 字节 | `src/memdir/memdir.ts` |
| `@include` 嵌套深度 | 5 层 | `src/utils/claudemd.ts` |
| CLAUDE.md 文件大小 | 有上限 | `src/utils/claudemd.ts` |

这些硬上限防止了通过配置文件的 DoS 攻击（大量注入 token 耗尽上下文）。

---

## 五、环境变量的分阶段应用

```typescript
// src/entrypoints/init.ts
export function applySafeEnvironmentVariables(): void {
  // Trust 前只应用"安全"的环境变量
  // 这些变量的值不来自项目目录（防止恶意项目修改行为）
  applyEnvVar('ANTHROPIC_BASE_URL')   // 可能来自用户全局配置
  applyEnvVar('HTTP_PROXY')           // 代理配置（低风险）
  // 注意：不应用来自 .claude/ 的环境变量
}

export async function initializeTelemetryAfterTrust(): Promise<void> {
  // Trust 建立后才应用全部环境变量
  applyAllEnvironmentVariables()
}
```

---

## 本章小结

这三类深层机制体现了 Claude Code 的防御设计哲学：

1. **Trust 边界**：不假设任何配置文件是可信的，Trust 建立前只做最小化初始化
2. **状态隔离**：Swarm 中的状态通过有限的共享接口而非全局变量同步
3. **主动切断**：PII 数据流通过类型系统在编译期做隔离，不依赖运行时过滤

## 关键源码位置

| 文件 | 职责 |
|------|------|
| `src/utils/claudemd.ts` | CLAUDE.md 分级信任与 `@include` 限制 |
| `src/entrypoints/init.ts` | Trust-First 初始化 |
| `src/services/analytics/index.ts` | PII 类型标注与数据分流 |
| `src/utils/swarm/` | Swarm 全局状态管理 |

## 下一步阅读建议

- [第 14 章：隐藏命令与彩蛋](/chapters/14-hidden-commands) — 更多代码内部发现
- [第 2 章：安全分析](/chapters/02-security-info-collection) — 整体安全架构
