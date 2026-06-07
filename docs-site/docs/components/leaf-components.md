# 叶子组件与子函数实现拆解

## 概述

本章分析组件树末端的叶子组件（无子组件的渲染单元）实现细节。

> 详细内容请参阅原始分析文档：[组件详解（七）：叶子组件与子函数实现拆解](https://github.com/liuup/claude-code-analysis/blob/main/analysis/components/07-function-level-leaf-walkthrough.md)

---

## 消息类叶子组件

### UserMessage

渲染用户输入，支持：
- 多行文本（保留换行）
- 附件预览（图片缩略图、文件名）
- 截断长输入（展示前 N 行，"展开"按钮）

### AssistantMessage

渲染 AI 回复，支持：
- Markdown 渲染（标题、代码块、列表等）
- 代码语法高亮（终端 ANSI 颜色）
- 流式渲染（token 逐步显示）

### ToolUseMessage

渲染工具调用，展示：
- 工具图标 + 工具名
- 关键参数摘要（截断超长参数）
- 执行状态指示器（等待中/执行中/完成/失败）

### ToolResultMessage

渲染工具执行结果：
- 成功：结果摘要（截断超长结果）
- 失败：错误信息（红色高亮）
- 图片：图片预览（部分终端支持）

---

## 输入类叶子组件

### Suggestions

基于当前输入上下文提供建议：
- 文件路径补全（`@file` 语法）
- 历史命令补全
- 斜杠命令补全

```typescript
function Suggestions({ input, onSelect }) {
  const suggestions = useMemo(
    () => computeSuggestions(input, history, commands),
    [input]
  )

  return suggestions.length > 0 ? (
    <Box flexDirection="column">
      {suggestions.map(s => (
        <SuggestionItem key={s.value} suggestion={s} onSelect={onSelect} />
      ))}
    </Box>
  ) : null
}
```

---

## 状态类叶子组件

### 权限模式指示器

底部状态栏中的权限模式标签：
- `default`：无特殊样式
- `auto`：绿色
- `plan`：蓝色
- `bypassPermissions`：红色（高风险警示）

### Token 使用量显示

```
Context: 12,450 / 200,000 (6.2%)
[██░░░░░░░░░░░░░░░░░░] 接近 Auto-Compact 时变红
```

---

## 公共 UI 原语

整个组件体系共享的 UI 原语：

| 组件 | 用途 |
|------|------|
| `Spinner` | 加载/执行中动画 |
| `ProgressBar` | 进度展示 |
| `Truncate` | 文字截断（支持从中间截断） |
| `KeyboardInput` | 键盘事件处理 |
| `Collapsible` | 可折叠内容区域 |

---

## 相关阅读

- [组件总览](/components/component-overview)
- [核心交互组件](/components/interaction-components)
- [组件索引](/components/component-index)
