# 控制面函数级实现拆解

## 概述

本章分析平台控制面（权限、沙箱、MCP、任务管理等）组件的函数级实现。

> 详细内容请参阅原始分析文档：[组件详解（六）：平台控制面函数级实现拆解](https://github.com/liuup/claude-code-analysis/blob/main/analysis/components/06-function-level-platform-walkthrough.md)

---

## 权限请求组件（`permissions/`）

### PermissionRequest 展示逻辑

```typescript
// 权限请求组件的核心展示判断
function PermissionRequest({ request, onApprove, onDeny }) {
  // 展示工具名、参数预览、风险提示
  const preview = truncateForDisplay(request.inputPreview, MAX_DISPLAY_CHARS)
  const riskLevel = assessRiskLevel(request.toolName, request.input)

  return (
    <Box>
      <Text bold>{request.toolName}</Text>
      <Text>{preview}</Text>
      {riskLevel === 'high' && <Text color="red">⚠️ 高风险操作</Text>}
      <KeyboardInput onEnter={onApprove} onEscape={onDeny} />
    </Box>
  )
}
```

### SandboxPermissionRequest 差异

沙箱权限请求额外展示：
- 命令将在隔离环境中执行的提示
- 文件系统限制范围说明
- 网络访问限制说明

---

## 任务管理组件

### 任务状态更新

```typescript
// 任务状态的实时更新链路
function TaskPanel({ tasks }) {
  // 订阅 AppState 中的 tasks
  const activeTasks = tasks.filter(t => t.status === 'running')
  const completedTasks = tasks.filter(t => t.status === 'completed')

  return (
    <Box flexDirection="column">
      {activeTasks.map(task => <TaskRow key={task.id} task={task} />)}
      {completedTasks.length > 0 && (
        <CollapsibleSection label={`已完成 (${completedTasks.length})`}>
          {completedTasks.map(task => <TaskRow key={task.id} task={task} />)}
        </CollapsibleSection>
      )}
    </Box>
  )
}
```

---

## MCP 状态展示

MCP 连接状态通过 AppState 中的 `mcpClients` 字段展示：
- 已连接的 MCP server 列表
- 每个 server 的连接状态（连接中/已连接/断开）
- 可用工具数量统计

---

## Doctor 诊断组件

`/doctor` 命令触发的诊断 UI，按模块检查：

```
Doctor 诊断报告
  ├── 网络连接（Claude API 可达性）
  ├── 认证状态（API key / OAuth）
  ├── Sandbox 支持（bwrap 可用性）
  ├── MCP 连接状态
  └── 配置文件完整性
```

---

## 相关阅读

- [组件总览](/components/component-overview)
- [平台能力组件](/components/platform-components)
- [叶子组件实现](/components/leaf-components)
