# 流程图：Agent 执行流程

---

## 图 1：query.ts 主循环流程

```mermaid
flowchart TD
    START([用户提交 prompt]) --> NM[normalizeMessagesForAPI<br/>组装 messages + system prompt]
    NM --> API[调用 Claude API<br/>claude.ts 流式接收]
    API --> |每个 token| YIELD[yield StreamEvent 给 UI]
    API --> DONE{模型输出完成?}
    DONE --> |否| API
    DONE --> |是| CHECK[提取 tool_use blocks]
    CHECK --> EMPTY{有 tool_use?}
    EMPTY --> |否| END([结束，返回最终回复])
    EMPTY --> |是| TOOLS[runTools<br/>partitionToolCalls 分批]
    TOOLS --> EXEC[执行工具<br/>并发/串行批次]
    EXEC --> RESULT[收集 tool_result]
    RESULT --> APPEND[追加到 messages]
    APPEND --> HOOKS[executePostSamplingHooks]
    HOOKS --> COMPACT{需要 compact?}
    COMPACT --> |是| COMP[compact<br/>压缩历史消息]
    COMP --> NM
    COMPACT --> |否| NM

    style NM fill:#1a1a2e,color:#fff
    style TOOLS fill:#16213e,color:#fff
```

---

## 图 2：三套 Multi-Agent 模型

```mermaid
graph TB
    subgraph "普通 AgentTool"
        MA[主 Agent] --> |AgentTool| SA1[subagent 1<br/>同步/后台/fork]
        MA --> |AgentTool| SA2[subagent 2]
        SA1 --> |tool_result| MA
        SA2 --> |tool_result| MA
    end

    subgraph "Coordinator 模式"
        CO[Coordinator Agent<br/>协调者专用 system prompt] --> |分配任务| W1[Worker 1]
        CO --> |分配任务| W2[Worker 2]
        W1 --> |完成| CO
        W2 --> |完成| CO
    end

    subgraph "Swarm Teammates"
        T1[Teammate 1] <-->|SendMessageTool<br/>Mailbox| T2[Teammate 2]
        T1 <-->|Mailbox| T3[Teammate 3]
        T2 <-->|Mailbox| T3
        T1 --- TM[(Team Memory)]
        T2 --- TM
        T3 --- TM
        TL[Leader<br/>Permission Bridge] <--> T1
        TL <--> T2
    end
```

---

## 图 3：AgentTool 执行决策

```mermaid
flowchart TD
    AT[AgentTool 调用] --> CHECK{是 Swarm Teammate?<br/>ctx.swarmConfig && input.teammateId}
    CHECK --> |是| SWARM[spawnMultiAgent<br/>swarm 模式]
    CHECK --> |否| MODE{执行模式?}
    MODE --> |sync| FORK_SYNC[forkSubagent<br/>同步等待结果]
    MODE --> |background| FORK_BG[forkSubagent<br/>后台执行]
    MODE --> |fork| FORK_IND[forkSubagent<br/>独立 transcript]

    FORK_SYNC --> QE[新建 QueryEngine 实例]
    FORK_BG --> QE
    FORK_IND --> QE

    QE --> TOOLS[继承/限制工具池]
    TOOLS --> RUN[执行 agent.query]
    RUN --> |流式 yield| PARENT[回传给主 Agent]
```

---

## 图 4：Swarm Permission Bridge

```mermaid
sequenceDiagram
    participant W as Worker Agent
    participant PB as Permission Bridge<br/>leaderPermissionBridge.ts
    participant L as Leader Agent
    participant U as 用户

    W->>W: 需要执行危险命令
    W->>W: 无法自动批准
    W->>PB: requestPermission(command)
    PB->>L: 转发权限请求
    L->>U: 展示确认对话框
    U->>L: 批准/拒绝
    L->>PB: 返回用户决定
    PB->>W: 传递权限结果
    W->>W: 根据结果继续/中止
```

---

## 相关阅读

- [第 10 章：Multi-Agent 架构](/chapters/10-multi-agent)
- [第 5 章：Tool Call 实现](/chapters/05-tool-call)
- [第 1 章：总体架构](/chapters/01-architecture-entry)
