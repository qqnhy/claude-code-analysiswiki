# 第 12 章：程序架构亮点

## 本章信息

| | |
|--|--|
| **本章目标** | 理解 Claude Code 区别于"模型 API 加壳工具"的核心工程决策 |
| **适合读者** | 希望理解优质 Agent 平台架构设计的工程师 |
| **前置知识** | 第 1 章（总体架构）、第 5 章（Tool Call） |
| **核心结论** | 三点同时成立：统一执行内核、文件化 Memory 体系、local-first 但可平滑扩展 |

---

## 核心结论

Claude Code 区别于"模型 API 加壳工具"的核心，在于**三点同时成立**：

1. **统一的执行内核**：多种运行形态复用同一套 query/tool/permission 闭环
2. **文件化、分层的 Memory 体系**：可审计、可分发、可治理
3. **Local-first 但无缝扩展**：从本地独立运行平滑扩展到 remote/bridge/swarm

---

## 亮点一：统一执行内核

**文件**：`src/query.ts`、`src/QueryEngine.ts`

最突出的工程决策：**用同一套 `query()` 主循环支撑所有运行形态**。

```
REPL（有 UI）       ──┐
headless/SDK       ──┤
subagent（子任务）  ──┤──> query.ts / QueryEngine.ts ──> tool/memory/permission
background agent   ──┤
bridge/remote      ──┘
```

**工程意义**：
- "本地 REPL 里 Claude 怎么调工具"和"后台自动化任务里 Claude 怎么调工具"走**完全相同的代码路径**
- 不存在两套实现的行为差异风险
- 在一个形态下发现的 bug 和优化，自动惠及所有形态

`query.ts` 输出 `AsyncGenerator<StreamEvent>`，调用方只需消费这个流：

```typescript
// SDK 调用示例
const engine = new QueryEngine(config)
for await (const event of engine.query('帮我重构这个函数')) {
  if (event.type === 'text') process.stdout.write(event.text)
  if (event.type === 'toolResult') console.log('工具结果:', event.result)
}
```

---

## 亮点二：文件化、可审计的 Memory

**文件**：`src/memdir/memdir.ts`

Memory 存为普通 Markdown 文件，而非数据库或黑盒 vector store：

```
~/.claude/memory/
  MEMORY.md          # 索引文件（硬截断 200 行）
  coding-style.md    # 编码风格记忆
  project-context.md # 项目背景记忆
  preferences.md     # 用户偏好记忆
```

**三大好处**：

| 好处 | 说明 |
|------|------|
| **可审计** | 用户可以用任意文本编辑器打开查看 Memory 内容 |
| **可分发** | Memory 文件可以 git commit，在团队中共享 |
| **可治理** | 用户可以直接删除或编辑不正确的 Memory 条目 |

与"黑盒 vector store"相比，文件化 Memory 牺牲了语义搜索能力，换来了完全的透明度和可控性。这是工程上有意识的取舍。

---

## 亮点三：Local-First + 无缝远端扩展

```mermaid
graph LR
    A[Local REPL] -->|复用同一内核| B[Local headless/SDK]
    B -->|复用同一内核| C[Remote via Bridge]
    C -->|复用同一内核| D[Swarm 多 Agent]
```

**Local-First** 的体现：
- 核心功能不依赖网络（除模型 API 外）
- 所有状态本地可见（transcript、memory、config）
- 可完全离线运行（含本地模型）

**无缝扩展** 的体现：
- Bridge 模式：一行配置从本地切换到远端 Orchestrator
- Swarm 模式：in-process、tmux、iterm2 三种后端可替换
- MCP Server 模式：内部工具零修改暴露为 MCP 协议

---

## 亮点四：AsyncGenerator 流水线

整个执行链都基于 `AsyncGenerator<T>`，实现了从模型 API 到 UI 的端到端流式传输：

```
Claude API 流式 → query.ts AsyncGenerator
  → runTools AsyncGenerator
    → tool.call() AsyncGenerator
      → UI 实时 yield 更新
```

**与回调模式的对比**：

| 实现方式 | 问题 |
|---------|------|
| 回调（callback） | 回调地狱，难以组合 |
| Promise | 无法流式，必须等全部完成 |
| AsyncGenerator | 天然支持流式，可组合，可取消 |

---

## 亮点五：分阶段 Trust 初始化

**文件**：`src/entrypoints/init.ts`

```
Trust 建立前：
  - 只应用安全的环境变量
  - 注册遥测 sink（但不发事件）
  - 初始化证书和 HTTP agent

Trust 建立后：
  - 应用全部环境变量（含 CLAUDE.md includes）
  - 开始发送遥测事件
```

**防御意义**：`CLAUDE.md` 的 `@include` 功能可以引入外部文件——如果在 trust 建立前就应用，恶意的 `@include` 可能成为攻击面。Trust 机制把这个风险系统性消除。

---

## 亮点六：编译期 Feature Gate

**文件**：`src/commands.ts`、`src/utils/undercover.ts`

内部版和外部版通过编译期开关分流，而非运行时 if/else：

```typescript
// 编译期开关（bun:bundle 时固化）
const VOICE_MODE_ENABLED = feature('VOICE_MODE')
const BUDDY_ENABLED      = feature('BUDDY')

// 内部构建才加载内部命令
...(process.env.USER_TYPE === 'ant' ? INTERNAL_ONLY_COMMANDS : [])
```

**工程价值**：
- 未开启的 feature 代码完全不包含在 bundle 中（dead code elimination）
- 内部命令对外部用户完全不可见（不是隐藏而是不存在）

---

## 亮点七：Settings 热更新

**文件**：`src/utils/settings/changeDetector.ts`

运行时配置文件变化实时生效，不需要重启：

```typescript
settingsChangeDetector.start()
// 监听 ~/.claude/settings.json 的 inode 变化
// 变化时调用 refreshConfig() 更新内存中的权限规则
// Sandbox 配置也同步更新
```

---

## 本章小结

Claude Code 的程序架构体现了"平台化思维"：

1. **统一内核**：query.ts 是整个系统的重力中心，所有执行路径都经过它
2. **分层解耦**：每一层的边界清晰，可以独立测试和替换
3. **可扩展性优先**：从 local-only 到 remote、从单 agent 到 swarm 的路径已经内建在架构中
4. **透明性设计**：Memory 文件化、`--dump-system-prompt`、Doctor 诊断，系统内部状态始终对用户可见

## 关键源码位置

| 文件 | 职责 |
|------|------|
| `src/query.ts` | 统一执行内核 |
| `src/QueryEngine.ts` | 无 UI 引擎，SDK 入口 |
| `src/memdir/memdir.ts` | 文件化 Memory 体系 |
| `src/entrypoints/init.ts` | 分阶段 Trust 初始化 |
| `src/utils/settings/changeDetector.ts` | Settings 热更新 |

## 下一步阅读建议

- [第 16 章：产品对比](/chapters/16-product-comparison) — 这些设计与竞品的差异
- [第 18 章：总结](/chapters/18-summary) — 最终评价
