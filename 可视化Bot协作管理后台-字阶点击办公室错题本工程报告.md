# 可视化 Bot 协作管理后台 — 字阶 / 点击办公室 / 茶水间错题本（工程报告草稿）

- **PR：** https://github.com/huangxiaohei87-lang/bot-office-dashboard/pull/1  
- **分支：** `cursor/phase1-prototype-90f3` → `main`  
- **head SHA：** `41b060cf59c9f583a4d13302b795eca56d20fb45`  
- **Pages / 合并：** 均未执行  

## 平移 / 缩放回归

- 安装并 import `@leafer-in/view`、`@leafer-in/viewport`；`tree.type = 'viewport'`。
- DOM 热区按 `tree.x/y` + `scaleX/Y` 与场景 Rect 对齐；移除固定 `fitScale` 迭代。
- E2E 在平移前临时 `pointer-events: none` 于房间叠框，避免挡画布拖拽；**不点「适应」** 断言 `__getTreeState` 与热区/截图变化。

## 交互与右栏

- 默认总览 + 对话；APP/人事部项目列表示例；茶水间错题本（四条示例含 HR）；老大办公室 / 助理回家。
- 字阶与 `#6E6C65` 次要色按 2026-11-15 正式修订。

## 测试与预览

- `npm run test:e2e` → **16/16**（含 artifact spec）。  
- 验收预览：`npm run preview -- --host 127.0.0.1 --port 4173`（与 Playwright 一致）。

## Artifacts

`/opt/cursor/artifacts/hotspot-overlay-{fit-default,after-pan,after-zoom-in,after-wheel-zoom,click-app-projects,click-hr-projects,click-pantry-mistakes,click-boss-home-chat}.png`

## 许可

见 `THIRD_PARTY_NOTICES`（含新增 `@leafer-in/*` MIT）。