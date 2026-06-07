# 第 14 章：隐藏命令与彩蛋

## 本章信息

| | |
|--|--|
| **本章目标** | 记录 Claude Code 源码中未公开的能力、内部版差异和品牌彩蛋 |
| **适合读者** | 对产品功能全貌感兴趣的读者 |
| **前置知识** | 第 1 章（命令系统） |
| **核心结论** | 代码中存在编译期分流、内部专属命令、feature gates 和产品化完整的品牌人格能力 |

---

## 核心结论

这套代码明确存在：

1. **内部版与外部版的编译分流**（`USER_TYPE === 'ant'`）
2. **大量 `feature(...)` 编译期开关**
3. **隐藏但已接入主程序的命令**
4. **纯 stub 占位命令**（为未来功能预留）
5. **产品化完整的品牌人格化能力**：`buddy`、`Clawd`、`stickers`、`passes`

---

## 隐藏机制的三层体系

```
源码中的能力
    │
    ├── 编译期分流
    │     └─ feature('VOICE_MODE') / feature('BUDDY') 等
    │         └─ 构建时决定是否包含，外部包不含此代码
    │
    ├── 运行时分流
    │     ├─ process.env.USER_TYPE === 'ant' → 加载内部命令
    │     └─ isHidden / isEnabled → 控制命令是否显示
    │
    └── Stub 占位
          └─ 命令存在但执行什么都不做（为未来预留）
```

---

## 内部专属命令

**文件**：`src/commands.ts`

```typescript
// 仅内部版加载的命令
const INTERNAL_ONLY_COMMANDS = [
  'backfillSessions',  // 会话数据回填工具
  'bughunter',         // 内部 bug 发现工具
  'commit',            // 内部 commit 辅助
  'teleport',          // 未知（内部工具）
  'antTrace',          // 内部 trace 工具
  // ...
]

export function getCommands(options: CommandOptions): Command[] {
  return [
    ...baseCommands,
    // 只有内部构建才加载
    ...(process.env.USER_TYPE === 'ant'
      ? INTERNAL_ONLY_COMMANDS.map(loadCmd)
      : []),
  ].filter(cmd => cmd.isEnabled(options))
}
```

---

## Feature Gates 编译期开关

**文件**：`src/utils/undercover.ts`

```typescript
// 编译时由 bun:bundle 固化为常量
export function feature(name: string): boolean {
  // 构建时根据目标环境决定返回值
  return ENABLED_FEATURES.has(name)
}

// 使用示例
...(feature('VOICE_MODE') ? [voiceCommand]   : [])
...(feature('BUDDY')      ? [buddyCommand]   : [])
...(feature('STICKERS')   ? [stickersCommand]: [])
...(feature('PASSES')     ? [passesCommand]  : [])
```

未开启的 feature 在打包时被 tree-shaking，外部用户的 bundle 中根本不包含相关代码。

---

## 品牌人格化能力

这些功能已有完整实现，但在外部版中通过 feature gate 关闭：

### Buddy 系统

`Clawd`（Claude 的内部品牌名）有一个"buddy"伴侣模式，功能类似 AI 助手的"快捷陪伴"形态，有独立的交互风格和 UI。

### Stickers 系统

**文件**（推测）：与 `feature('STICKERS')` 关联

实现了某种数字贴纸/成就系统，可能用于用户激励或分享功能。

### Passes 系统

与订阅或权限"通行证"相关的功能，可能是某种权限或特权凭证系统。

---

## `isHidden` 与 `isEnabled` 控制

**文件**：`src/types/command.ts`

```typescript
interface Command {
  name:      string
  isHidden?: boolean    // 隐藏但存在：不显示在帮助列表，可直接调用
  isEnabled: (options: CommandOptions) => boolean  // 控制命令是否在当前上下文可用
}
```

`isHidden = true` 的命令：
- 不出现在 `--help` 输出
- 不在 Tab 补全中显示
- 但可以直接输入命令名调用

---

## 内部调试命令特征

内部命令通常具备：

1. **详细的 trace/log 输出**：`antTrace` 等命令会输出正常用户不需要的内部状态
2. **数据库操作**：`backfillSessions` 类命令直接操作 transcript 存储
3. **测试接口**：`bughunter` 类命令用于内部问题复现

---

## 命令 isEnabled 条件示例

部分命令的 `isEnabled` 条件说明了其可用场景：

```typescript
// 推测的 isEnabled 模式
{
  name: 'voice',
  isEnabled: ({ permissionMode, flags }) =>
    feature('VOICE_MODE') &&
    os.platform() === 'darwin' &&         // 可能仅 macOS
    flags.voiceEnabled === true,
}
```

---

## 本章小结

从产品视角看，这些发现说明：

1. **功能储备丰富**：外部版只是内部版功能的子集，有大量"蓄势待发"的功能
2. **品牌人格化有规划**：`Clawd`/`buddy`/`stickers` 表明产品有明确的人格化路线图
3. **内外部体验差异大**：内部团队使用的版本有更多调试和分析工具

## 关键源码位置

| 文件 | 职责 |
|------|------|
| `src/commands.ts` | 命令注册与内部版分流 |
| `src/types/command.ts` | Command 接口定义 |
| `src/utils/undercover.ts` | feature gate 实现 |

## 下一步阅读建议

- [第 15 章：负面关键词检测](/chapters/15-negative-keywords) — 另一个不常被注意的产品埋点
- [第 16 章：产品对比](/chapters/16-product-comparison) — 横向对比视角
