# 组件索引与目录映射

## src/components/ 完整目录映射

| 路径 | 类别 | 说明 |
|------|------|------|
| `App.tsx` | 根层 | 全局 Provider，上下文挂载 |
| `Messages.tsx` | 核心 | 消息展示主中枢 |
| `PromptInput/` | 核心 | 输入控制主中枢 |
| `Footer.tsx` | 核心 | 底部状态栏 |
| `Notifications/` | 核心 | 实时通知系统 |
| `memory/` | 能力弹层 | Memory 文件选择器 |
| `permissions/` | 能力弹层 | 权限请求弹窗族 |
| `sandbox/` | 能力弹层 | Sandbox 诊断 UI |
| `FeedbackSurvey/` | 产品功能 | 反馈收集 |
| `grove/` | 产品功能 | 数据收集控制 |
| `tasks/` | 任务管理 | 后台任务展示 |

## src/screens/ 目录

| 文件 | 说明 |
|------|------|
| `REPL.tsx` | 主会话工作台（核心） |
| `ResumeConversation.tsx` | 会话选择与恢复 |
| `SetupScreen.tsx` | 初始化设置界面 |

## src/tasks/ 目录

| 文件 | 说明 |
|------|------|
| `InProcessTeammateTask/` | Swarm 内进程 teammate 任务 |

## src/hooks/ 目录

| 钩子 | 说明 |
|------|------|
| `useInboxPoller.ts` | Swarm mailbox 轮询 |
| `useToolPermission.ts` | 权限状态管理 |
| `useSettings.ts` | Settings 读取与监听 |

---

## 组件依赖关系速查

```
App
 └─ REPL
      ├─ Messages ─────────────────┐
      │    └─ VirtualMessageList   │
      │         └─ MessageRow      │  都依赖 AppState
      └─ PromptInput ──────────────┘
           ├─ Footer
           ├─ Suggestions
           ├─ 各类能力弹层
           └─ Notifications
```

---

## 相关阅读

- [组件总览](/components/component-overview)
- [核心组件函数级拆解](/components/core-component-functions)
- [控制面函数级拆解](/components/control-plane-functions)
- [叶子组件实现](/components/leaf-components)
