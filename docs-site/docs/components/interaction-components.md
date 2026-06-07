# 核心交互组件

## Messages 组件

**文件**：`src/components/Messages.tsx`

Messages 是消息展示的主中枢，负责将 AppState 中的消息数组渲染为用户可见的对话界面。

### 虚拟化消息列表

为了支持长会话不卡顿，Messages 使用虚拟化列表：只渲染当前视口内可见的消息行，而非全部消息。

```
Messages.tsx
  └── VirtualMessageList
        ├── 仅渲染可见行（视口内）
        ├── 支持平滑滚动
        └── 消息更新时智能增量更新
```

### 消息类型层次

| 消息类型 | 组件 | 说明 |
|---------|------|------|
| 用户输入 | `messages/UserMessage` | 用户 prompt 展示 |
| AI 回复 | `messages/AssistantMessage` | Markdown 渲染 |
| 工具调用 | `messages/ToolUseMessage` | 工具名 + 参数展示 |
| 工具结果 | `messages/ToolResultMessage` | 输出/错误 展示 |
| 系统消息 | `messages/SystemMessage` | 状态通知 |

---

## PromptInput 组件

**文件**：`src/components/PromptInput/PromptInput.tsx`

PromptInput 是输入控制中枢，不只是文本框，而是整个"下一步操作"的控制面板。

### 主要职责

1. **多行文本编辑**：支持换行、粘贴、Shift+Enter 插入换行
2. **斜杠命令触发**：`/` 开头展开命令面板
3. **附件处理**：拖拽文件/图片自动处理为附件
4. **输入建议**：基于历史和上下文提供补全建议
5. **提交处理**：Enter 提交 → 调用 `query.ts` 主循环

### 弹层展开逻辑

```
用户输入 /
  → 展示命令列表（Skills + 内建命令合并）

用户触发特殊操作
  → 展开对应能力面板：
      Tasks / Teams / Bridge / ModelPicker / Memory
```

---

## Footer 组件

**文件**：`src/components/Footer.tsx`（或类似路径）

底部状态栏展示：
- 当前权限模式（default / auto / plan 等）
- 当前使用的模型
- Token 使用量
- 快捷键提示

---

## Notifications 组件

实时通知系统，支持：
- 工具执行进度通知
- 权限请求弹窗
- 系统状态变化
- 错误提示

---

## 相关阅读

- [组件总览](/components/component-overview)
- [平台能力组件](/components/platform-components)
- [第 1 章：TUI 与状态层](/chapters/01-architecture-entry)
