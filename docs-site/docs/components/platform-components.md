# 平台能力组件

## 概述

从 PromptInput 展开的各种能力面板，是 Claude Code 将复杂功能收纳进简洁界面的关键设计。

---

## Tasks 面板

**文件**：`src/components/tasks/` 或 `src/tasks/`

展示所有正在运行或已完成的后台任务（background agent）：
- 任务名称和状态
- 实时进度
- 任务结果预览
- 停止/取消控制

---

## Teams 面板

**文件**：`src/components/teams/` 或 `src/tasks/InProcessTeammateTask/`

Swarm 团队协作面板，展示：
- 当前团队成员（teammates）列表
- 每个 teammate 的运行状态
- Mailbox 消息状态
- 权限上升请求

---

## ModelPicker 组件

运行时切换 Claude 模型，无需重启会话：
- 列出可用模型（claude-opus / claude-sonnet / claude-haiku 等）
- 支持 1M context 模型标识
- 切换后下一轮 query 生效

---

## 权限弹窗组件

**文件**：`src/components/permissions/`

| 组件 | 触发场景 |
|------|---------|
| `PermissionRequest` | 一般工具权限请求 |
| `SandboxPermissionRequest` | 沙箱权限请求 |
| `BashPermissionRequest` | Bash 命令确认 |

---

## Memory 组件

**文件**：`src/components/memory/MemoryFileSelector.tsx`

Memory 文件管理器，允许用户：
- 查看当前活跃的 Memory 文件列表
- 选择/取消特定 Memory 文件的注入
- 直接打开 Memory 文件编辑

---

## FeedbackSurvey 组件

**文件**：`src/components/FeedbackSurvey/`

用户反馈收集：
- 满意度评分
- 文字反馈
- Transcript 分享选项（用户主动触发）

与第 15 章的负面关键词检测联动，在合适时机展示。

---

## Sandbox 诊断组件

**文件**：`src/components/sandbox/SandboxDoctorSection.tsx`

`/doctor` 命令的 Sandbox 诊断部分：
- 检测当前系统沙箱支持情况
- 验证 `bwrap` 可用性
- 显示沙箱配置状态

---

## Grove 组件

**文件**：`src/components/grove/Grove.tsx`

"帮助改善 Claude"功能的 UI，当用户开启 Grove 模式时，提供编码会话数据收集的控制界面。

---

## 相关阅读

- [组件总览](/components/component-overview)
- [核心交互组件](/components/interaction-components)
- [组件索引](/components/component-index)
