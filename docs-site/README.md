# Claude Code 源码分析阅读站

基于 VitePress 构建的 Claude Code 源码分析文档网站。

## 本地预览

```bash
cd docs-site
npm install
npm run docs:dev
```

访问 http://localhost:5173/claude-code-analysis/

## 构建

```bash
npm run docs:build
```

构建产物位于 `docs/\.vitepress/dist/`

## 预览构建结果

```bash
npm run docs:preview
```

## GitHub Pages 部署

向 `main` 分支推送后，GitHub Actions 自动构建并部署。

详见 `.github/workflows/deploy-docs.yml`。

## 声明

本项目仅供学术研究与技术学习使用。Claude Code 的所有权利归 Anthropic 所有。
