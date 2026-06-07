# 术语表

本文档整理了阅读分析文档时可能遇到的专业术语。

## Agent 相关

| 术语 | 含义 |
|------|------|
| **Agent** | 能够自主规划、调用工具、执行多步任务的 AI 实体 |
| **subagent** | 主 agent 派生的子 agent，负责执行特定子任务 |
| **coordinator** | 多 Agent 模式下的协调者，负责分配任务给 workers |
| **swarm** | 多个 Agent 组成的协作团队，有 mailbox 通信机制 |
| **teammate** | swarm 中的团队成员 agent |
| **AgentTool** | 用于派生子 agent 的内建工具 |
| **headless** | 无 UI 的无界面运行模式，用于 SDK 调用场景 |

## Memory 相关

| 术语 | 含义 |
|------|------|
| **Auto Memory** | 系统自动从对话提炼并持久化的长期记忆 |
| **Session Memory** | 当前会话的压缩摘要，辅助长会话持续运行 |
| **Agent Memory** | 与特定 agent 定义绑定的持久记忆 |
| **Team Memory** | 团队共享、可跨用户同步的 repo 级知识 |
| **MEMORY.md** | Auto Memory 系统的入口索引文件 |
| **memdir** | Memory 文件的存放目录体系 |
| **compact** | 将长对话压缩为摘要的操作，用于释放上下文空间 |

## 工具调用相关

| 术语 | 含义 |
|------|------|
| **tool_use** | Claude 模型输出的工具调用请求块 |
| **tool_result** | 工具执行完成后返回给模型的结果 |
| **Tool** | 实现具体功能的工具模块（Bash、FileEdit、WebFetch 等） |
| **isConcurrencySafe** | 标记工具是否可以并发执行的属性 |
| **partitionToolCalls** | 将工具调用按并发安全性分批的函数 |
| **Hook** | 在工具调用前/后触发的自定义回调 |

## 权限相关

| 术语 | 含义 |
|------|------|
| **PermissionMode** | 权限模式，从 default 到 bypassPermissions 分级 |
| **default mode** | 每次操作前弹出确认 |
| **acceptEdits** | 自动批准文件编辑，命令仍需确认 |
| **plan mode** | 只允许规划，不执行写操作 |
| **auto mode** | 分类器自动判断，安全操作自动执行 |
| **bypassPermissions** | 跳过所有权限检查（危险，仅限 CI/CD） |

## 架构相关

| 术语 | 含义 |
|------|------|
| **REPL** | Read-Eval-Print Loop，交互式命令行界面 |
| **TUI** | Terminal User Interface，终端用户界面（基于 Ink/React） |
| **QueryEngine** | 无 UI 的执行引擎，管理跨多轮会话状态 |
| **AppState** | 系统共享状态总线，包含消息、权限、MCP 等所有状态 |
| **feature gate** | 编译期开关，控制某功能是否开启 |
| **bootstrap** | 启动时从远端拉取的初始配置数据 |
| **trust** | 系统对配置文件的信任级别，影响初始化策略 |

## MCP / 扩展相关

| 术语 | 含义 |
|------|------|
| **MCP** | Model Context Protocol，Anthropic 主导的 AI 工具标准协议 |
| **MCP Server** | 提供工具能力的外部服务 |
| **MCP Client** | 消费外部工具能力的一侧（Claude Code 扮演的角色） |
| **stdio transport** | MCP 通过标准输入输出传输的方式 |
| **SSE transport** | MCP 通过 Server-Sent Events 传输的方式 |
| **Skills** | 通过 Markdown + YAML + 可选 Bash 定义的领域能力扩展 |
| **bundled skills** | 源码内硬编码、随安装包分发的内建技能 |

## 安全相关

| 术语 | 含义 |
|------|------|
| **Sandbox** | 基于 bwrap（Linux）或 macOS 沙盒的进程隔离环境 |
| **Prompt Injection** | 通过外部内容向 AI 注入恶意指令的攻击方式 |
| **Unicode 隐写** | 用不可见 Unicode 字符隐藏指令的攻击技术 |
| **Path Traversal** | 通过 `../../` 路径绕过目录限制的攻击 |
| **Secret Scanner** | 上传前扫描 API 密钥等敏感凭据的内置模块 |
| **PII** | Personally Identifiable Information，个人身份信息 |
| **telemetry** | 系统主动上报的使用统计数据（发送给 Datadog） |

## 持久化相关

| 术语 | 含义 |
|------|------|
| **transcript** | 会话的完整逐条记录，以 JSONL 格式 append-only 写入 |
| **JSONL** | 每行一个 JSON 对象的日志格式 |
| **session ingress** | 会话数据的远端副本接入链路 |
| **resume** | 从历史 transcript 恢复会话的功能（`/resume` 命令） |
| **sidechain** | 子 agent 独立的 transcript 侧链 |
| **cleanupPeriodDays** | transcript 本地保留天数的配置项 |
