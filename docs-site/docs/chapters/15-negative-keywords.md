# 第 15 章：负面关键词检测机制

## 本章信息

| | |
|--|--|
| **本章目标** | 理解 Claude Code 如何通过关键词打标识别用户挫败感信号 |
| **适合读者** | 关注产品埋点设计和用户体验分析的读者 |
| **前置知识** | 第 2 章（遥测机制） |
| **核心结论** | 这是 product telemetry + frustration sensing 的产品功能，不是内容过滤器 |

---

## 核心结论

源码中用正则匹配 `wtf`、`this sucks`、`damn it` 类词汇的函数，其真实定位是：

**这不是安全过滤器，不是内容审查器，也不拦截用户输入。**

它是 **product telemetry + frustration sensing**（产品遥测 + 挫败感感知）的一部分，用于：

1. 给用户输入打"负面情绪/不满"标签
2. 把标签写进遥测事件 `tengu_input_prompt`
3. 作为产品分析的轻量信号，辅助识别用户不满

---

## 原始函数

**文件**：`src/utils/userPromptKeywords.ts`

```typescript
// 负面关键词列表（部分）
const NEGATIVE_KEYWORDS = [
  'wtf', 'what the f', 'this sucks', 'damn it', 'not working',
  'broken', 'useless', 'terrible', 'awful', 'hate this',
  'frustrat', 'annoying', 'stupid', 'idiot', 'garbage',
  // ... 更多词汇
]

export function hasNegativeKeywords(prompt: string): boolean {
  const lower = prompt.toLowerCase()
  return NEGATIVE_KEYWORDS.some(kw => lower.includes(kw))
}
```

---

## 两层挫败感检测

### 第一层：输入级轻量关键词打标

```typescript
// src/utils/processUserInput/processTextPrompt.ts
async function processTextPrompt(prompt: string, ctx: ProcessContext) {
  // 分析输入是否含负面关键词
  const hasNegative = hasNegativeKeywords(prompt)

  // 写进遥测事件（不影响实际提交的 prompt 内容）
  trackEvent('tengu_input_prompt', {
    hasFrustrationKeywords: hasNegative,  // 打标，不修改
    promptLength: prompt.length,
  })

  // 正常继续处理用户输入
  return submitPrompt(prompt, ctx)
}
```

**关键点**：`hasNegativeKeywords()` 的结果只是一个**标签**，不影响实际提交给模型的内容，用户的 prompt 原封不动地继续处理。

### 第二层：会话级 frustration detection

**文件**：`src/screens/REPL.tsx`、`src/components/FeedbackSurvey/useFeedbackSurvey.tsx`

```
会话持续
  │
  └─ 检测信号累积：
       - 连续多次负面关键词
       - 重复相同类型失败
       - 超过阈值
         │
         └─> 可能触发：反馈问卷 / transcript sharing 弹窗
```

---

## 与反馈问卷的联动

**文件**：`src/components/FeedbackSurvey/useFeedbackSurvey.tsx`、`src/components/FeedbackSurvey/submitTranscriptShare.ts`

挫败感检测可以触发：

1. **反馈调查问卷**：弹出"你遇到了什么问题？"的问卷
2. **Transcript 分享**：引导用户分享会话记录给 Anthropic（用于改进）

这两个下游动作是用户可见的，但触发条件（挫败感检测）对用户来说是不透明的。

---

## `/insights` 命令

**文件**：`src/commands/insights.ts`

这个命令（可能仅内部版）用于查看会话级的挫败感分析结果，说明这套机制有明确的产品分析用途，不只是被动打标。

---

## 产品分析视角

从产品设计角度，这套机制的意义是：

| 传统方式 | Claude Code 方式 |
|---------|----------------|
| 用户主动点"踩"按钮 | 自动检测负面情绪信号 |
| 等待用户填写反馈 | 主动弹出反馈问卷 |
| 只知道"有问题" | 知道"在哪个步骤出了问题" |

这类"passive feedback sensing"在 AI 产品中越来越常见，是产品质量监控的重要手段。

---

## 本章小结

负面关键词检测机制：

1. **本质是埋点**，不是内容过滤
2. **不拦截**用户输入，prompt 原样发给模型
3. **触发下游**：可能影响反馈问卷弹出时机
4. **两层设计**：输入级（关键词打标）+ 会话级（挫败感累积检测）

## 关键源码位置

| 文件 | 职责 |
|------|------|
| `src/utils/userPromptKeywords.ts` | 负面关键词列表与检测函数 |
| `src/utils/processUserInput/processTextPrompt.ts` | 输入处理与埋点 |
| `src/components/FeedbackSurvey/useFeedbackSurvey.tsx` | 反馈问卷触发逻辑 |
| `src/commands/insights.ts` | 会话洞察命令（内部） |

## 下一步阅读建议

- [第 2 章：安全与隐私](/chapters/02-security-info-collection) — 遥测数据的整体收集体系
- [第 18 章：总结](/chapters/18-summary) — 最终评估
