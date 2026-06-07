# 流程图：Tool Call 调用流程

---

## 图 1：Tool Call 完整执行链

```mermaid
flowchart TD
    MODEL[模型输出<br/>含 tool_use blocks] --> COLLECT[query.ts 收集 tool_use]
    COLLECT --> PARTITION[partitionToolCalls<br/>按 isConcurrencySafe 分批]
    PARTITION --> BATCH1["批次 1（并发安全）<br/>[FileRead, FileRead, Grep]"]
    PARTITION --> BATCH2["批次 2（非并发安全）<br/>[Bash]"]
    PARTITION --> BATCH3["批次 3（并发安全）<br/>[FileRead]"]

    BATCH1 --> CON[runToolsConcurrently<br/>并发执行]
    BATCH2 --> SER[runToolsSerially<br/>串行执行]
    BATCH3 --> CON2[runToolsConcurrently]

    CON --> EXEC
    SER --> EXEC
    CON2 --> EXEC

    subgraph EXEC["toolExecution.ts：单工具执行"]
        E1[1. Zod schema 校验] --> E2[2. validateInput<br/>业务逻辑校验]
        E2 --> E3[3. pre-tool hooks]
        E3 --> E4[4. checkPermission<br/>allow / ask / deny]
        E4 --> E5{权限决定?}
        E5 --> |allow| E6[5. tool.call<br/>流式 AsyncGenerator]
        E5 --> |ask| E7[弹出确认对话框]
        E7 --> |批准| E6
        E7 --> |拒绝| E8([返回 denied tool_result])
        E5 --> |deny| E8
        E6 --> E9[6. post-tool hooks]
    end

    EXEC --> NORMALIZE[规范化为 user-side tool_result]
    NORMALIZE --> APPEND[追加到 messages]
    APPEND --> NEXT_ROUND[下一轮模型调用]
```

---

## 图 2：并发分批示意

```mermaid
graph LR
    subgraph 输入
        T1[FileRead] --> T2[FileRead] --> T3[FileRead] --> T4[Bash] --> T5[FileWrite] --> T6[FileRead]
    end

    subgraph 分批结果
        B1["批次 1（并发）<br/>FileRead × 3"]
        B2["批次 2（串行）<br/>Bash"]
        B3["批次 3（串行）<br/>FileWrite"]
        B4["批次 4（并发）<br/>FileRead"]
    end

    T1 --> B1
    T2 --> B1
    T3 --> B1
    T4 --> B2
    T5 --> B3
    T6 --> B4
```

---

## 图 3：Tool 接口结构

```mermaid
classDiagram
    class Tool {
        +name: string
        +description: string
        +inputSchema: ZodSchema
        +isConcurrencySafe(input) bool
        +checkPermission(input, ctx) PermissionResult
        +validateInput(input, ctx) ValidationError?
        +call(input, ctx) AsyncGenerator~ToolOutput~
    }

    class BashTool {
        +isConcurrencySafe: false
        +checkPermission: 检查命令黑名单
        +call: 执行命令/沙箱包装
    }

    class FileReadTool {
        +isConcurrencySafe: true
        +checkPermission: 路径白名单检查
        +call: 读取文件内容
    }

    class AgentTool {
        +isConcurrencySafe: false
        +call: forkSubagent/spawnSwarm
    }

    Tool <|-- BashTool
    Tool <|-- FileReadTool
    Tool <|-- AgentTool
```

---

## 图 4：权限判断流程

```mermaid
flowchart TD
    INPUT[工具调用请求] --> PERM_CHECK[checkPermission]
    PERM_CHECK --> MODE{权限模式?}

    MODE --> |bypassPermissions| ALLOW([自动放行])
    MODE --> |default/auto| RULES{匹配规则?}

    RULES --> |显式 allow 规则| ALLOW
    RULES --> |显式 deny 规则| DENY([拒绝])
    RULES --> |无匹配| DEFAULT{auto 模式分类器?}

    DEFAULT --> |是，且分类为安全| ALLOW
    DEFAULT --> |否，或分类为危险| ASK[弹出用户确认]

    ASK --> |用户批准| ALLOW
    ASK --> |用户拒绝| DENY
```

---

## 相关阅读

- [第 5 章：Tool Call 实现](/chapters/05-tool-call)
- [第 7 章：Sandbox](/chapters/07-sandbox)
- [第 2 章：安全分析（权限模式分级）](/chapters/02-security-info-collection)
