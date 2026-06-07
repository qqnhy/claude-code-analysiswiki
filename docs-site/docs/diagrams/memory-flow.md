# 流程图：Memory 与 Context 管理流程

---

## 图 1：Memory 系统总览

```mermaid
graph TD
    CONV[会话 transcript<br/>当前 query] --> AUTO[Auto Memory 提取]
    CONV --> SESSION[Session Memory]
    CONV --> AGENT_M[Agent Memory]
    CONV --> TEAM[Team Memory]

    AUTO --> M1[MEMORY.md 索引<br/>最多 200 行 / 25KB]
    AUTO --> M2[topic memories/*.md<br/>分主题文件]
    AUTO --> RECALL[findRelevantMemories<br/>相关性召回]
    RECALL --> INJECT[注入当前 system prompt]

    SESSION --> SUMMARY[当前会话摘要 .md]
    SUMMARY --> |compact 触发时| INJECT

    AGENT_M --> SCOPE[user / project / local scope]
    SCOPE --> |agent system prompt| INJECT

    TEAM --> SYNC[Anthropic 服务器同步]
    SYNC --> INJECT

    INJECT --> CLAUDE_API[发送给 Claude API]
```

---

## 图 2：Auto Memory 提取时机

```mermaid
sequenceDiagram
    participant U as 用户
    participant Q as query.ts
    participant SE as shouldExtractMemory()
    participant FA as fork Agent
    participant M as Memory 文件

    U->>Q: 提交 prompt
    loop 对话进行中
        Q->>Q: 执行工具调用循环
        Q->>SE: 检查是否需要提取 Memory
        SE->>SE: 基于对话长度/内容启发式判断
        alt 需要提取
            SE->>FA: runForkedAgent(extractMemoriesPrompt)
            FA->>FA: 独立 agent 分析对话
            FA->>M: 写入新 Memory 条目
            M-->>Q: 下一轮 buildMemoryPrompt 读取
        end
    end
    Q->>U: 在每轮对话开始注入 Memory
```

---

## 图 3：Context 窗口分配

```mermaid
pie title 典型 Context 窗口分配（200K）
    "System Prompt" : 15
    "Memory 注入" : 10
    "CLAUDE.md" : 5
    "对话历史" : 40
    "工具结果（文件/命令）" : 20
    "预留（Summary 输出）" : 10
```

---

## 图 4：Auto-Compact 触发与执行

```mermaid
flowchart TD
    AFTER_TURN[每轮对话结束后] --> CHECK_TOKEN[计算当前 token 使用量]
    CHECK_TOKEN --> THRESHOLD{超过阈值?}

    THRESHOLD --> |超过 95%| COMPACT_NOW[立即触发 compact]
    THRESHOLD --> |超过 85%| PREDICT{预测下一轮<br/>是否超过 95%?}
    THRESHOLD --> |低于 85%| CONTINUE([继续正常执行])

    PREDICT --> |是| COMPACT_NOW
    PREDICT --> |否| CONTINUE

    COMPACT_NOW --> SAVE[保存 Session Memory 快照]
    SAVE --> SUMMARIZE[调用 Claude<br/>用 Summary Prompt 压缩历史]
    SUMMARIZE --> REPLACE[用摘要替换历史消息]
    REPLACE --> RESET[重置 messages 数组]
    RESET --> NEXT_TURN[继续下一轮对话]

    SUMMARIZE --> DEADLOCK{compact 后仍超限?}
    DEADLOCK --> |是| TRUNCATE[截断最长工具输出]
    TRUNCATE --> RETRY{仍超限?}
    RETRY --> |是| EMERGENCY[紧急 compact<br/>降级到最小状态]
    RETRY --> |否| NEXT_TURN
```

---

## 图 5：Prompt 六层组装

```mermaid
graph BT
    L1["层 1：默认主系统提示<br/>constants/prompts.ts"] --> FINAL
    L2["层 2：override / coordinator / agent / custom / append<br/>utils/systemPrompt.ts"] --> FINAL
    L3["层 3：运行时上下文<br/>CLAUDE.md / git状态 / 时间戳"] --> FINAL
    L4["层 4：Memory 注入<br/>MEMORY.md + topic files"] --> FINAL
    L5["层 5：工具与环境信息<br/>可用工具列表 / 平台"] --> FINAL
    L6["层 6：专项 prompt（独立 fork）<br/>compact / extractMemories / sessionMemory"] --> FINAL

    FINAL["最终 system prompt<br/>→ Claude API"]

    style FINAL fill:#1a1a2e,color:#fff
```

---

## 相关阅读

- [第 3 章：Agent Memory 机制](/chapters/03-agent-memory)
- [第 8 章：Context 上下文管理](/chapters/08-context)
- [第 9 章：Prompt 管理机制](/chapters/09-prompt)
