# 流程图：MCP 集成流程

---

## 图 1：MCP 双向架构

```mermaid
graph TB
    subgraph Claude Code 进程
        CC[执行内核<br/>query.ts] --> MC
        CC --> MS

        subgraph MC[MCP Client 侧<br/>services/mcp/client.ts]
            POOL[统一工具池<br/>mcp__server__tool]
        end

        subgraph MS[MCP Server 侧<br/>entrypoints/mcp.ts]
            WRAP[内部工具包装<br/>为 MCP schema]
        end
    end

    subgraph 外部 MCP Servers
        S1["filesystem server<br/>stdio"]
        S2["puppeteer server<br/>SSE"]
        S3["自定义 server<br/>WebSocket"]
        S4["云端 server<br/>HTTP"]
    end

    subgraph MCP 消费方
        IDE[VS Code / JetBrains<br/>通过 MCP 调用 Claude Code 工具]
    end

    MC -->|stdio| S1
    MC -->|SSE| S2
    MC -->|WebSocket| S3
    MC -->|HTTP| S4

    MS -->|MCP 协议| IDE
```

---

## 图 2：MCP 连接建立流程

```mermaid
sequenceDiagram
    participant M as main.tsx
    participant C as MCP Client<br/>client.ts
    participant S as MCP Server

    M->>C: getMcpToolsCommandsAndResources()
    C->>C: memoize 检查缓存
    alt 未缓存
        C->>S: 建立连接（stdio/SSE/WS/HTTP）
        S-->>C: 握手完成
        C->>S: 请求工具列表
        S-->>C: tool schemas
        C->>C: buildMcpToolName()<br/>mcp__server__tool 格式
        C->>C: 包装为内部 Tool 格式
    end
    C-->>M: mcpTools[]（与内建工具同格式）
    M->>M: 合并进统一工具池
```

---

## 图 3：四种传输协议选择

```mermaid
flowchart TD
    CONFIG[MCP Server 配置] --> TYPE{transport 类型?}
    TYPE --> STDIO[stdio<br/>本地子进程]
    TYPE --> SSE[SSE<br/>Server-Sent Events]
    TYPE --> WS[WebSocket<br/>双向实时]
    TYPE --> HTTP[HTTP<br/>轮询]

    STDIO --> |command + args| PROC[启动子进程]
    SSE --> |url| SSE_CONN[SSE 连接]
    WS --> |url| WS_CONN[WebSocket 连接]
    HTTP --> |url| HTTP_CONN[HTTP 轮询]

    PROC --> CONNECTED[连接成功<br/>MCPServerConnection]
    SSE_CONN --> CONNECTED
    WS_CONN --> CONNECTED
    HTTP_CONN --> CONNECTED
```

---

## 图 4：OAuth Step-up 认证流程

```mermaid
sequenceDiagram
    participant Q as query.ts
    participant M as MCP Client
    participant S as MCP Server
    participant U as 用户

    Q->>M: 调用 mcp__server__tool
    M->>S: 工具调用请求（无 token）
    S-->>M: 401 Unauthorized
    M->>M: detectStepUpRequired()
    M->>U: 显示授权 URL / 打开浏览器
    U->>S: 完成 OAuth 授权
    S-->>M: OAuth token
    M->>M: 缓存 token
    M->>S: 重试调用（携带 token）
    S-->>M: 工具执行结果
    M-->>Q: 返回 tool_result
```

---

## 图 5：MCP 安全过滤

```mermaid
flowchart LR
    MCP_RETURN[MCP Server 返回结果] --> SANITIZE[recursivelySanitizeUnicode<br/>清洗所有字符串字段]
    SANITIZE --> CHECK[secretScanner<br/>密钥扫描]
    CHECK --> PERM[沙箱路径白名单检查<br/>文件写入操作]
    PERM --> SAFE[安全的 tool_result]
    SAFE --> MODEL[注入模型上下文]
```

---

## 相关阅读

- [第 6 章：MCP 集成机制](/chapters/06-mcp)
- [第 5 章：Tool Call 实现](/chapters/05-tool-call)
- [第 2 章：安全分析（MCP 不可信输入防御）](/chapters/02-security-info-collection)
