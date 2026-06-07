# 流程图：Sandbox 权限控制流程

---

## 图 1：Sandbox 四层执行链

```mermaid
flowchart TD
    MODEL[模型生成 BashTool 调用] --> SHOULD{shouldUseSandbox?}

    SHOULD --> |false<br/>命令豁免/配置关闭| NORMAL[走普通 Bash 权限路径]
    SHOULD --> |true| AUTO{checkSandboxAutoAllow?}

    AUTO --> |自动放行<br/>沙箱内无害且无 deny 规则| SHELL[Shell.ts<br/>wrapWithSandbox]
    AUTO --> |有 deny 规则| DENY([拒绝执行])
    AUTO --> |需要确认| ASK[弹出用户确认]
    ASK --> |批准| SHELL
    ASK --> |拒绝| DENY

    SHELL --> OS{操作系统?}
    OS --> |Linux/WSL2| BWRAP["bubblewrap bwrap<br/>Namespace 隔离"]
    OS --> |macOS| MACOS["macOS 原生沙盒<br/>sandbox-exec"]

    BWRAP --> EXEC[命令在隔离环境中执行]
    MACOS --> EXEC

    EXEC --> CLEANUP[cleanupAfterCommand<br/>宿主机级清理]
    CLEANUP --> GIT[scrubBareGitRepoFiles<br/>清除 Git 裸库文件]
    GIT --> RESULT([返回执行结果])
```

---

## 图 2：双重权限闸架构

```mermaid
flowchart TD
    AI[AI 发出命令] --> GATE1

    subgraph GATE1["第一道闸：Tool Permission（应用层）"]
        P1[检查权限规则]
        P1 --> |allow| PASS1([通过])
        P1 --> |deny| STOP1([拒绝])
        P1 --> |ask| USER1[用户确认]
        USER1 --> |批准| PASS1
        USER1 --> |拒绝| STOP1
    end

    PASS1 --> GATE2

    subgraph GATE2["第二道闸：Sandbox（系统级）"]
        P2["bubblewrap / macOS 沙盒<br/>Namespace 隔离"]
        P2 --> |读写受限路径| BLOCK2([被内核拦截])
        P2 --> |在白名单路径内| PASS2([执行成功])
    end

    PASS2 --> HOST[宿主机<br/>受保护]
```

---

## 图 3：SandboxRuntimeConfig 配置翻译

```mermaid
graph LR
    subgraph Claude Code 设置语义
        PS["permissions:\n  allowedPaths:\n    - ~/projects\n  webFetch:\n    allowed:\n      - github.com"]
    end

    TRANSLATE[convertToSandboxRuntimeConfig]

    subgraph Sandbox Runtime 配置
        SC["filesystem:\n  allowWrite: [~/projects, /tmp]\n  denyWrite: [~/.claude/settings.json]\n\nnetwork:\n  allowedDomains: [github.com]\n  deniedDomains: [...]"]
    end

    PS --> TRANSLATE --> SC
```

---

## 图 4：内置路径保护

```mermaid
graph TD
    ALWAYS["无论用户配置如何<br/>以下路径始终受保护"] --> P1["~/.claude/settings.json<br/>全局配置"]
    ALWAYS --> P2["{cwd}/.claude/<br/>项目设置"]
    ALWAYS --> P3[".claude/skills/<br/>技能目录"]

    HACK["即使 AI 命令试图修改"] --> |被沙盒拦截| ALWAYS
```

---

## 图 5：热更新同步时序

```mermaid
sequenceDiagram
    participant U as 用户
    participant W as settingsChangeDetector
    participant S as sandbox-adapter.ts
    participant B as bwrap 进程

    U->>U: 修改 ~/.claude/settings.json
    W->>W: inode 变化检测
    W->>S: refreshConfig() 触发
    S->>S: 重新计算 SandboxRuntimeConfig
    note over S: 下一个 Bash 命令将使用新配置
    note over B: AI 无法利用"旧配置时间窗口"逃逸
```

---

## 相关阅读

- [第 7 章：Sandbox 沙盒机制](/chapters/07-sandbox)
- [第 2 章：安全分析（双重权限闸）](/chapters/02-security-info-collection)
