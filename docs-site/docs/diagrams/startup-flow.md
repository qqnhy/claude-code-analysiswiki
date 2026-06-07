# 流程图：CLI 启动流程

本页包含 Claude Code 启动链路的 Mermaid 可视化图表。

---

## 图 1：CLI 总体启动流程

```mermaid
flowchart TD
    START([用户执行 claude]) --> CLI[entrypoints/cli.tsx<br/>入口分流器]

    CLI --> V{--version?}
    V -->|是| VE([输出版本并退出])
    V -->|否| D{--dump-system-prompt?}
    D -->|是| DE([输出 system prompt 并退出])
    D -->|否| R{remote-control?}
    R -->|是| RC([runRemoteControl])
    R -->|否| BG{daemon/bg/runner?}
    BG -->|是| BGE([runDaemonOrBackground])
    BG -->|否| MAIN[main.tsx<br/>总控编排]

    MAIN --> INIT[init.ts<br/>逻辑初始化<br/>证书/HTTP/遥测骨架]
    INIT --> TRUST{Trust 建立?}
    TRUST -->|否| SETUP_FLOW[显示 setup 界面]
    SETUP_FLOW --> TRUST
    TRUST -->|是| SETUP[setup.ts<br/>环境初始化<br/>CWD/hooks/memory]

    SETUP --> BOOTSTRAP[fetchBootstrapData<br/>拉取远端配置]
    BOOTSTRAP --> MCP_LOAD[getMcpToolsAndResources<br/>连接 MCP servers]
    MCP_LOAD --> TOOLS[getTools<br/>组装工具池]
    TOOLS --> SKILLS[initBundledSkills<br/>加载内建技能]
    SKILLS --> AGENTS[getAgentDefinitions<br/>加载 agent 定义]
    AGENTS --> TELE[initializeTelemetryAfterTrust<br/>启动遥测]
    TELE --> WATCH[settingsChangeDetector.start<br/>热更新监听]

    WATCH --> MODE{运行模式?}
    MODE -->|headless/SDK| HEAD([runHeadless/QueryEngine])
    MODE -->|bridge| BRIDGE([runBridge<br/>连接远端 Orchestrator])
    MODE -->|remote| REMOTE([runRemote])
    MODE -->|默认 REPL| REPL[launchRepl<br/>启动 TUI]

    REPL --> APP[App + REPL.tsx<br/>Ink 渲染循环]
    APP --> PROMPT[PromptInput<br/>等待用户输入]
    PROMPT --> QUERY[query.ts<br/>执行主循环]
    QUERY --> PROMPT

    style MAIN fill:#1a1a2e,color:#fff
    style QUERY fill:#16213e,color:#fff
```

---

## 图 2：六层架构分层图

```mermaid
graph TB
    L1["第一层：CLI 引导层<br/>entrypoints/cli.tsx / main.tsx"]
    L2["第二层：初始化层<br/>init.ts / setup.ts"]
    L3A["第三层A：控制面<br/>commands.ts / slash"]
    L3B["第三层B：TUI/REPL 层<br/>REPL.tsx / App.tsx"]
    L4["第四层：Query/Agent 执行内核<br/>query.ts / QueryEngine.ts"]
    L5A["第五层A：Tool/Permission<br/>Tool.ts / orchestration"]
    L5B["第五层B：Memory/Persist<br/>sessionStorage / memdir"]
    L6["第六层：扩展层<br/>MCP / Plugin / Remote / Swarm"]

    L1 --> L2
    L2 --> L3A
    L2 --> L3B
    L3A --> L3B
    L3B --> L4
    L4 --> L5A
    L4 --> L5B
    L4 --> L6

    style L4 fill:#1a1a2e,color:#fff
```

---

## 图 3：四种运行形态

```mermaid
graph LR
    subgraph 入口层
        CLI[CLI]
        SDK[SDK]
        MCP_IN[MCP Client]
        BRIDGE[Bridge]
    end

    subgraph 执行内核
        QE[QueryEngine<br/>query.ts]
    end

    subgraph 工具层
        T[Tool Pool<br/>tools.ts]
        P[Permission<br/>System]
        M[Memory<br/>System]
    end

    CLI -->|launchRepl| QE
    SDK -->|直接实例化| QE
    MCP_IN -->|包装内部工具| QE
    BRIDGE -->|远端会话| QE

    QE --> T
    QE --> P
    QE --> M
```

---

## 图 4：初始化时序图

```mermaid
sequenceDiagram
    participant P as 用户
    participant C as cli.tsx
    participant M as main.tsx
    participant I as init.ts
    participant S as setup.ts
    participant R as replLauncher.tsx

    P->>C: 执行 claude 命令
    C->>C: 快路径检查（version/dump等）
    C->>M: 调用 main()
    M->>I: init()（trust 前初始化）
    I->>I: 证书/HTTP/遥测骨架
    M->>M: 检查 Trust
    M->>M: fetchBootstrapData()
    M->>M: getMcpTools()
    M->>M: getTools() / initSkills()
    M->>I: initializeTelemetryAfterTrust()
    M->>S: setup()
    S->>S: CWD / hooks / memory
    M->>R: launchRepl()
    R->>P: 显示 TUI 界面
```

---

## 相关阅读

- [第 1 章：软件架构与程序入口](/chapters/01-architecture-entry)
- [第 12 章：程序架构亮点](/chapters/12-program-architecture)
