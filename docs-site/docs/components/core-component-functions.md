# 核心组件函数级实现拆解

## 概述

本章深入核心组件的函数级实现，基于 `analysis/components/05-function-level-core-walkthrough.md` 整理。

> 详细内容请参阅原始分析文档：[组件详解（五）：核心组件函数级实现拆解](https://github.com/liuup/claude-code-analysis/blob/main/analysis/components/05-function-level-core-walkthrough.md)

---

## Messages 组件核心函数

### `VirtualMessageList` 渲染控制

虚拟化消息列表的核心是按视口动态计算需要渲染的消息行范围：

```typescript
// 伪代码：虚拟化核心逻辑
function getVisibleRange(
  messages: Message[],
  scrollTop: number,
  viewportHeight: number,
): [start: number, end: number] {
  // 计算当前可见的消息行索引范围
  const start = Math.floor(scrollTop / ESTIMATED_ROW_HEIGHT)
  const end = Math.ceil((scrollTop + viewportHeight) / ESTIMATED_ROW_HEIGHT)
  return [Math.max(0, start), Math.min(messages.length - 1, end)]
}
```

### 消息滚动锁定

```typescript
// 关键行为：新消息到达时，是否自动滚动到底部
const shouldAutoScroll = isAtBottom && !userScrolledUp
```

---

## PromptInput 组件核心函数

### 斜杠命令触发检测

```typescript
function detectSlashCommand(input: string): SlashCommandState {
  if (!input.startsWith('/')) return { type: 'none' }

  const [commandPart, ...argParts] = input.slice(1).split(' ')
  const matchedCommands = allCommands.filter(c =>
    c.name.startsWith(commandPart)
  )

  return {
    type: 'detecting',
    prefix: commandPart,
    args: argParts.join(' '),
    matches: matchedCommands,
  }
}
```

### 提交处理链路

```typescript
async function handleSubmit(input: string) {
  // 1. 解析是斜杠命令还是普通 prompt
  if (input.startsWith('/')) {
    await processSlashCommand(input, ctx)
  } else {
    // 2. 负面关键词打标（不影响内容）
    const hasNegative = hasNegativeKeywords(input)
    trackEvent('tengu_input_prompt', { hasFrustrationKeywords: hasNegative })

    // 3. 进入 query 主循环
    await submitToQuery(input, ctx)
  }
}
```

---

## AppState 更新模式

AppState 采用不可变更新模式：

```typescript
// 每次状态更新都创建新对象（不可变）
function updateMessages(newMessage: Message) {
  setAppState(prev => ({
    ...prev,
    messages: [...prev.messages, newMessage]
  }))
}
```

这确保了 Ink 的 React 渲染能正确检测到变化并重新渲染。

---

## 相关阅读

- [组件总览](/components/component-overview)
- [控制面函数级拆解](/components/control-plane-functions)
- 原始详细分析：`analysis/components/05-function-level-core-walkthrough.md`
