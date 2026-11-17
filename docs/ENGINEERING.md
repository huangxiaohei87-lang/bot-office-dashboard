# 可视化 Bot 协作管理后台 — 技术说明（草稿）

> 正式交付报告由工程在云电脑写入 `可视化Bot协作管理后台-字阶点击办公室错题本工程报告.md`。

## 当前状态

- **分支：** `cursor/phase1-prototype-90f3` → `main`（[PR #1](https://github.com/huangxiaohei87-lang/bot-office-dashboard/pull/1)，未合并）
- **head SHA：** 见 GitHub PR（返工补充：近距房间取景 + 看向胶囊）
- **GitHub Pages：** 未启用

## 取景（近距房间 + 看向胶囊）

- **点 APP / 人事部 / 茶水间：** `focusRoom` 仅对被点房间 `region` 做 `zoom(bounds, 36)`（与并集拉远之前一致）。回家点可暂时在视口外。
- **点老大办公室：** `goHome()` → `zoom('fit', 24)`。
- **看向胶囊（`look-home-capsule`）：** 非 `overview` 且 boss / 助理热区任一不可点（可见边 &lt; 24px 或面积交集 &lt; 80%）时在 `#scene-viewport` 右下角显示；点按后对 `homeAnchorBounds()`（boss ∪ `ASSISTANT_HOTSPOT`）做 `zoom(bounds, 32)`，**不改** `viewState` 与右栏。动画 `0.3s ease-out`；`prefers-reduced-motion` 无动画。胶囊显隐随 `RenderEvent`、平移、滚轮、按钮缩放后重算。
- `focusUnionBounds` 仍保留，**不**用于 `focusRoom`。

## 相机 / 平移 / 缩放

- `@leafer-in/view` + `@leafer-in/viewport` **1.12.x**；DOM 热区与 `app.tree` 同步。

## 字阶（保持不变）

- 工具条 12/20；Noto Serif 700 → `noto-serif-sc-chinese-simplified-700-normal.woff2`；栏标题 `.panel-title` 18/28 `#2A2923`。

## E2E

- `CI=1 npm run test:e2e`；预览 `http://127.0.0.1:4173`。
- 人事部 / 茶水间放大态断言胶囊 → 点胶囊回家点可点 → 再点热区回对话；APP 按需胶囊。

## Artifacts

`hotspot-overlay-{fit-default,after-pan,after-zoom-in,after-wheel-zoom,click-app-projects,click-hr-projects,click-pantry-mistakes,click-capsule-from-hr,click-capsule-from-pantry,click-home-from-hr,click-home-from-pantry}`（APP 若有胶囊则另含 `click-capsule-from-app`）