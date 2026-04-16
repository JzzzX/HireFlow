# HireFlow README Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 README 改成产品型首页，并接入可直接访问的演示封面与压缩视频资源。

**Architecture:** 使用仓库内相对路径保存 README 资产，避免依赖外部图床。README 结构以前台产品说明为主、工程信息为辅，兼顾产品展示和开发落地。

**Tech Stack:** Markdown, GitHub README rendering, ffmpeg

---

### Task 1: Generate README demo assets

**Files:**
- Create: `docs/assets/hireflow-demo-cover.jpg`
- Create: `docs/assets/hireflow-demo.mp4`

- [ ] Step 1: Export a cover image from the provided screen recording
- [ ] Step 2: Compress the original `.mov` into a GitHub-friendly `mp4`
- [ ] Step 3: Check file sizes and keep the video comfortably below GitHub upload limits

### Task 2: Record the approved direction

**Files:**
- Create: `docs/superpowers/specs/2026-04-16-hireflow-readme-refresh-design.md`

- [ ] Step 1: Save the approved product-facing README direction
- [ ] Step 2: Record the asset strategy and success criteria

### Task 3: Rewrite README homepage

**Files:**
- Modify: `README.md`

- [ ] Step 1: Replace the current engineering-first intro with a product hero
- [ ] Step 2: Add a demo section using the generated cover and video link
- [ ] Step 3: Reorganize features, flow, stack, setup, env, and deployment notes
- [ ] Step 4: Keep instructions accurate to the current implementation

### Task 4: Verify the result

**Files:**
- Verify: `README.md`
- Verify: `docs/assets/hireflow-demo-cover.jpg`
- Verify: `docs/assets/hireflow-demo.mp4`

- [ ] Step 1: Confirm the generated assets exist and have reasonable sizes
- [ ] Step 2: Run project checks that are still relevant after the README update
- [ ] Step 3: Review the final diff before reporting completion
