import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'Claude Code 源码分析',
  description: '基于泄露源码的 Claude Code 深度技术分析，涵盖架构、安全、Memory、Agent、MCP 等核心机制',
  base: '/claude-code-analysis/',

  head: [
    ['meta', { name: 'theme-color', content: '#1a1a2e' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'zh_CN' }],
    ['meta', { name: 'og:title', content: 'Claude Code 源码分析阅读站' }],
    ['meta', { name: 'og:description', content: '基于泄露源码的 Claude Code 深度技术分析' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Claude Code 源码分析',

    nav: [
      { text: '首页', link: '/' },
      { text: '阅读指南', link: '/guide/overview' },
      {
        text: '核心章节',
        items: [
          { text: '总体架构', link: '/chapters/01-architecture-entry' },
          { text: '安全分析', link: '/chapters/02-security-info-collection' },
          { text: 'Agent Memory', link: '/chapters/03-agent-memory' },
          { text: 'Tool Call', link: '/chapters/05-tool-call' },
          { text: 'MCP 集成', link: '/chapters/06-mcp' },
          { text: 'Sandbox', link: '/chapters/07-sandbox' },
          { text: 'Multi-Agent', link: '/chapters/10-multi-agent' },
        ]
      },
      {
        text: '组件体系',
        items: [
          { text: '组件总览', link: '/components/component-overview' },
          { text: '核心交互组件', link: '/components/interaction-components' },
          { text: '平台能力组件', link: '/components/platform-components' },
          { text: '组件索引', link: '/components/component-index' },
        ]
      },
      { text: '流程图', link: '/diagrams/startup-flow' },
      { text: '源码证据', link: '/chapters/17-code-evidence' },
      {
        text: 'GitHub',
        link: 'https://github.com/liuup/claude-code-analysis',
        target: '_blank'
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '阅读指南',
          items: [
            { text: '项目概览', link: '/guide/overview' },
            { text: '阅读路线图', link: '/guide/reading-roadmap' },
            { text: '架构快览', link: '/guide/architecture-overview' },
            { text: '术语表', link: '/guide/glossary' },
          ]
        }
      ],
      '/chapters/': [
        {
          text: '第一部分：总体架构',
          collapsed: false,
          items: [
            { text: '第 1 章：软件架构与程序入口', link: '/chapters/01-architecture-entry' },
          ]
        },
        {
          text: '第二部分：安全分析',
          collapsed: false,
          items: [
            { text: '第 2 章：信息收集与安全机制', link: '/chapters/02-security-info-collection' },
          ]
        },
        {
          text: '第三部分：核心机制',
          collapsed: false,
          items: [
            { text: '第 3 章：Agent Memory 机制', link: '/chapters/03-agent-memory' },
            { text: '第 4 章：Skills 技能机制', link: '/chapters/04-skills' },
            { text: '第 5 章：Tool Call 实现', link: '/chapters/05-tool-call' },
            { text: '第 6 章：MCP 集成机制', link: '/chapters/06-mcp' },
            { text: '第 7 章：Sandbox 沙盒', link: '/chapters/07-sandbox' },
            { text: '第 8 章：Context 上下文管理', link: '/chapters/08-context' },
            { text: '第 9 章：Prompt 管理机制', link: '/chapters/09-prompt' },
            { text: '第 10 章：Multi-Agent 架构', link: '/chapters/10-multi-agent' },
            { text: '第 11 章：Session 持久化', link: '/chapters/11-session-storage' },
          ]
        },
        {
          text: '第四部分：程序架构',
          collapsed: false,
          items: [
            { text: '第 12 章：架构亮点与设计决策', link: '/chapters/12-program-architecture' },
          ]
        },
        {
          text: '第五部分：扩展发现',
          collapsed: false,
          items: [
            { text: '第 13 章：深度探索与边界案例', link: '/chapters/13-extra-findings' },
            { text: '第 14 章：隐藏命令与彩蛋', link: '/chapters/14-hidden-commands' },
            { text: '第 15 章：负面关键词检测机制', link: '/chapters/15-negative-keywords' },
          ]
        },
        {
          text: '第六部分：产品对比',
          collapsed: false,
          items: [
            { text: '第 16 章：同类产品横向对比', link: '/chapters/16-product-comparison' },
          ]
        },
        {
          text: '第七部分：证据与总结',
          collapsed: false,
          items: [
            { text: '第 17 章：源码证据索引', link: '/chapters/17-code-evidence' },
            { text: '第 18 章：总结与结论', link: '/chapters/18-summary' },
          ]
        },
      ],
      '/components/': [
        {
          text: '组件体系详解',
          items: [
            { text: '组件总览与分层', link: '/components/component-overview' },
            { text: '核心交互组件', link: '/components/interaction-components' },
            { text: '平台能力组件', link: '/components/platform-components' },
            { text: '组件索引与映射', link: '/components/component-index' },
            { text: '核心组件函数级拆解', link: '/components/core-component-functions' },
            { text: '控制面函数级拆解', link: '/components/control-plane-functions' },
            { text: '叶子组件实现拆解', link: '/components/leaf-components' },
          ]
        }
      ],
      '/diagrams/': [
        {
          text: '架构流程图',
          items: [
            { text: 'CLI 启动流程', link: '/diagrams/startup-flow' },
            { text: 'Agent 执行流程', link: '/diagrams/agent-flow' },
            { text: 'Tool Call 调用流程', link: '/diagrams/tool-call-flow' },
            { text: 'MCP 集成流程', link: '/diagrams/mcp-flow' },
            { text: 'Memory 管理流程', link: '/diagrams/memory-flow' },
            { text: 'Sandbox 权限控制', link: '/diagrams/sandbox-flow' },
          ]
        }
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/liuup/claude-code-analysis' }
    ],

    footer: {
      message: '本项目仅供学术研究与技术学习使用。Claude Code 版权归 Anthropic 所有。',
      copyright: '© 2026 claude-code-analysis contributors'
    },

    editLink: {
      pattern: 'https://github.com/liuup/claude-code-analysis/edit/main/docs-site/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    lastUpdated: {
      text: '最后更新'
    },

    search: {
      provider: 'local'
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    outline: {
      label: '本页目录',
      level: [2, 3]
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true,
  }
})
