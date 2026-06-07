import { marked } from 'marked';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS = path.join(__dirname, 'docs');
const DIST = path.join(__dirname, 'dist');

// ── Navigation structure ──────────────────────────────────────────────────
const NAV = [
  {
    label: '阅读指南',
    items: [
      { title: '项目概览', file: 'guide/overview' },
      { title: '阅读路线图', file: 'guide/reading-roadmap' },
      { title: '架构快览', file: 'guide/architecture-overview' },
      { title: '术语表', file: 'guide/glossary' },
    ],
  },
  {
    label: '核心章节',
    items: [
      { title: '第 1 章：软件架构与程序入口', file: 'chapters/01-architecture-entry' },
      { title: '第 2 章：信息收集与安全机制', file: 'chapters/02-security-info-collection' },
      { title: '第 3 章：Agent Memory 机制', file: 'chapters/03-agent-memory' },
      { title: '第 4 章：Skills 技能机制', file: 'chapters/04-skills' },
      { title: '第 5 章：Tool Call 实现', file: 'chapters/05-tool-call' },
      { title: '第 6 章：MCP 集成机制', file: 'chapters/06-mcp' },
      { title: '第 7 章：Sandbox 沙盒', file: 'chapters/07-sandbox' },
      { title: '第 8 章：Context 上下文管理', file: 'chapters/08-context' },
      { title: '第 9 章：Prompt 管理机制', file: 'chapters/09-prompt' },
      { title: '第 10 章：Multi-Agent 架构', file: 'chapters/10-multi-agent' },
      { title: '第 11 章：Session 持久化', file: 'chapters/11-session-storage' },
      { title: '第 12 章：架构亮点与设计决策', file: 'chapters/12-program-architecture' },
      { title: '第 13 章：深度探索与边界案例', file: 'chapters/13-extra-findings' },
      { title: '第 14 章：隐藏命令与彩蛋', file: 'chapters/14-hidden-commands' },
      { title: '第 15 章：负面关键词检测机制', file: 'chapters/15-negative-keywords' },
      { title: '第 16 章：同类产品横向对比', file: 'chapters/16-product-comparison' },
      { title: '第 17 章：源码证据索引', file: 'chapters/17-code-evidence' },
      { title: '第 18 章：总结与结论', file: 'chapters/18-summary' },
    ],
  },
  {
    label: '组件体系',
    items: [
      { title: '组件总览与分层', file: 'components/component-overview' },
      { title: '核心交互组件', file: 'components/interaction-components' },
      { title: '平台能力组件', file: 'components/platform-components' },
      { title: '组件索引与映射', file: 'components/component-index' },
      { title: '核心组件函数级拆解', file: 'components/core-component-functions' },
      { title: '控制面函数级拆解', file: 'components/control-plane-functions' },
      { title: '叶子组件实现拆解', file: 'components/leaf-components' },
    ],
  },
  {
    label: '架构流程图',
    items: [
      { title: 'CLI 启动流程', file: 'diagrams/startup-flow' },
      { title: 'Agent 执行流程', file: 'diagrams/agent-flow' },
      { title: 'Tool Call 调用流程', file: 'diagrams/tool-call-flow' },
      { title: 'MCP 集成流程', file: 'diagrams/mcp-flow' },
      { title: 'Memory 管理流程', file: 'diagrams/memory-flow' },
      { title: 'Sandbox 权限控制', file: 'diagrams/sandbox-flow' },
    ],
  },
];

// ── Custom marked renderer ────────────────────────────────────────────────
const renderer = new marked.Renderer();

renderer.code = function (code, lang) {
  if (lang === 'mermaid') {
    return `<div class="mermaid">${code}</div>\n`;
  }
  const escaped = String(code)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `<pre><code class="language-${lang || ''}">${escaped}</code></pre>\n`;
};

marked.use({ renderer });

// ── Helpers ───────────────────────────────────────────────────────────────
function stripFrontmatter(md) {
  return md.replace(/^---[\s\S]*?---\n?/, '');
}

function extractTitle(md) {
  const m = md.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : '';
}

function buildSidebar(currentFile, depth) {
  const root = '../'.repeat(depth);
  let html = `<div class="site-brand"><a href="${root}index.html">Claude Code<br>源码分析</a></div>`;

  for (const group of NAV) {
    html += `<div class="nav-group"><div class="nav-group-label">${group.label}</div>`;
    for (const item of group.items) {
      const href = root + item.file + '.html';
      const active = currentFile === item.file ? ' active' : '';
      html += `<a href="${href}" class="nav-link${active}">${item.title}</a>`;
    }
    html += `</div>`;
  }
  return html;
}

function buildPage({ title, body, currentFile, depth, hasMermaid }) {
  const root = '../'.repeat(depth);
  const mermaidScripts = hasMermaid
    ? `<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <script>mermaid.initialize({ startOnLoad: true, theme: 'neutral', fontFamily: 'Microsoft YaHei, PingFang SC, sans-serif' });</script>`
    : '';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Claude Code 源码分析</title>
  <link rel="stylesheet" href="${root}style.css">
</head>
<body>
  <div class="layout">
    <aside class="sidebar">${buildSidebar(currentFile, depth)}</aside>
    <main class="content">
      ${body}
      <div class="page-footer">
        <a href="${root}index.html">← 返回首页</a>
        &nbsp;·&nbsp;
        <a href="https://github.com/qqnhy/claude-code-analysiswiki" target="_blank">GitHub</a>
        &nbsp;·&nbsp;
        <span>© 2026 claude-code-analysis contributors</span>
      </div>
    </main>
  </div>
  ${mermaidScripts}
</body>
</html>`;
}

function processMarkdown(relFile) {
  const src = path.join(DOCS, relFile + '.md');
  if (!fs.existsSync(src)) {
    console.warn(`  [skip] ${relFile}.md not found`);
    return;
  }

  const raw = fs.readFileSync(src, 'utf8');
  const md = stripFrontmatter(raw);
  const title = extractTitle(md);
  const hasMermaid = md.includes('```mermaid');
  const body = marked.parse(md);
  const depth = relFile.split('/').length - 1;
  const html = buildPage({ title, body, currentFile: relFile, depth, hasMermaid });

  const out = path.join(DIST, relFile + '.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  console.log(`  ✓ ${relFile}.html`);
}

// ── Homepage ──────────────────────────────────────────────────────────────
const HOME_SECTIONS = [
  {
    heading: '第一部分：总体架构',
    cards: [
      { file: 'chapters/01-architecture-entry', label: '第 1 章：软件架构与程序入口', desc: '六层分层结构，程序入口与启动链路' },
      { file: 'chapters/12-program-architecture', label: '第 12 章：架构亮点与设计决策', desc: '核心设计模式与工程亮点梳理' },
    ],
  },
  {
    heading: '第二部分：安全与隐私',
    cards: [
      { file: 'chapters/02-security-info-collection', label: '第 2 章：信息收集与安全机制', desc: '数据收集范围、隐私边界与防线' },
      { file: 'chapters/13-extra-findings', label: '第 13 章：深度探索与边界案例', desc: '安全相关的隐藏行为与边界发现' },
    ],
  },
  {
    heading: '第三部分：核心机制',
    cards: [
      { file: 'chapters/03-agent-memory', label: '第 3 章：Agent Memory', desc: '跨会话记忆机制与文件组织方式' },
      { file: 'chapters/04-skills', label: '第 4 章：Skills 技能机制', desc: 'Skills 系统的定义、加载与调用' },
      { file: 'chapters/05-tool-call', label: '第 5 章：Tool Call 实现', desc: '工具调用完整链路分析' },
      { file: 'chapters/06-mcp', label: '第 6 章：MCP 集成', desc: 'MCP 协议接入与第三方能力扩展' },
      { file: 'chapters/07-sandbox', label: '第 7 章：Sandbox 沙盒', desc: '内核级进程隔离与权限控制' },
      { file: 'chapters/08-context', label: '第 8 章：Context 上下文管理', desc: '上下文窗口压缩与摘要策略' },
      { file: 'chapters/09-prompt', label: '第 9 章：Prompt 管理', desc: 'System prompt 组装与动态注入' },
      { file: 'chapters/10-multi-agent', label: '第 10 章：Multi-Agent', desc: '三套 Agent 协作模型源码分析' },
      { file: 'chapters/11-session-storage', label: '第 11 章：Session 持久化', desc: '会话存储、恢复与断点续读' },
    ],
  },
  {
    heading: '第四部分：扩展发现',
    cards: [
      { file: 'chapters/14-hidden-commands', label: '第 14 章：隐藏命令与彩蛋', desc: '未公开命令与内部调试功能' },
      { file: 'chapters/15-negative-keywords', label: '第 15 章：负面关键词检测', desc: '情绪检测与 Flag 机制' },
      { file: 'chapters/16-product-comparison', label: '第 16 章：同类产品横向对比', desc: 'Cursor/Copilot/Cline 等产品对比' },
      { file: 'chapters/17-code-evidence', label: '第 17 章：源码证据索引', desc: '关键结论对应的源码位置' },
      { file: 'chapters/18-summary', label: '第 18 章：总结与结论', desc: '全书核心结论与工程启示' },
    ],
  },
  {
    heading: '组件体系',
    cards: [
      { file: 'components/component-overview', label: '组件总览与分层', desc: '完整组件体系架构概览' },
      { file: 'components/interaction-components', label: '核心交互组件', desc: 'UI 与用户交互层组件' },
      { file: 'components/platform-components', label: '平台能力组件', desc: '系统平台层能力组件' },
      { file: 'components/component-index', label: '组件索引', desc: '全量组件名称映射表' },
    ],
  },
  {
    heading: '架构流程图',
    cards: [
      { file: 'diagrams/startup-flow', label: 'CLI 启动流程', desc: '程序完整启动链路图' },
      { file: 'diagrams/agent-flow', label: 'Agent 执行流程', desc: 'Agent 决策循环与执行路径' },
      { file: 'diagrams/tool-call-flow', label: 'Tool Call 流程', desc: '工具调用时序与数据流' },
      { file: 'diagrams/mcp-flow', label: 'MCP 集成流程', desc: 'MCP 协议交互时序' },
      { file: 'diagrams/memory-flow', label: 'Memory 管理流程', desc: 'Memory 读写与更新流程' },
      { file: 'diagrams/sandbox-flow', label: 'Sandbox 权限控制', desc: '沙盒进程生命周期' },
    ],
  },
];

function buildHomepage() {
  const sidebar = buildSidebar('', 0);

  let sectionsHtml = '';
  for (const section of HOME_SECTIONS) {
    sectionsHtml += `<div class="section-heading">${section.heading}</div><div class="chapter-grid">`;
    for (const card of section.cards) {
      sectionsHtml += `<div class="chapter-card">
        <a href="${card.file}.html">${card.label}</a>
        <p class="card-desc">${card.desc}</p>
      </div>`;
    }
    sectionsHtml += `</div>`;
  }

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Claude Code 源码分析</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="layout">
    <aside class="sidebar">${sidebar}</aside>
    <main class="content">
      <div class="home-hero">
        <h1>Claude Code 源码分析</h1>
        <p class="tagline">基于泄露源码的系统性技术分析 · 深入理解 AI Coding Agent 工程设计</p>
        <div class="stats">
          <span>📁 源文件 1902 个</span>
          <span>📝 代码 513,237 行</span>
          <span>🔍 18 个分析章节</span>
          <span>🗓 2026 年</span>
        </div>
      </div>

      <div class="home-intro">
        2026 年 3 月，Anthropic 发布到 npm 的 Claude Code 包因未删除 source map 文件，导致完整 TypeScript 源码意外泄露。本站对泄露源码进行系统性技术分析，帮助开发者理解 AI Coding Agent 的架构设计与工程实现。
      </div>

      ${sectionsHtml}

      <div class="page-footer">
        <a href="https://github.com/qqnhy/claude-code-analysiswiki" target="_blank">GitHub</a>
        &nbsp;·&nbsp;
        <span>© 2026 claude-code-analysis contributors</span>
        &nbsp;·&nbsp;
        <span>本项目仅供学术研究与技术学习使用</span>
      </div>
    </main>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(DIST, 'index.html'), html);
  console.log('  ✓ index.html');
}

// ── Main ──────────────────────────────────────────────────────────────────
async function build() {
  console.log('Building docs...\n');

  if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true });
  fs.mkdirSync(DIST);

  fs.copyFileSync(path.join(__dirname, 'style.css'), path.join(DIST, 'style.css'));
  console.log('  ✓ style.css');

  buildHomepage();

  const allFiles = NAV.flatMap(g => g.items.map(i => i.file));
  for (const f of allFiles) processMarkdown(f);

  console.log('\nBuild complete!');
}

build().catch(err => { console.error(err); process.exit(1); });
