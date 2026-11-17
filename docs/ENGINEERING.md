# 可视化 Bot 协作管理后台 — 技术说明（草稿）

> 正式交付报告由工程在云电脑写入 `可视化Bot协作管理后台-字阶点击办公室错题本工程报告.md`。本文件为仓库内可版本化的技术草稿。

## 当前状态

- **分支：** `cursor/phase1-prototype-90f3` → `main`（[PR #1](https://github.com/huangxiaohei87-lang/bot-office-dashboard/pull/1)，未合并）
- **head SHA：** `eb6c2888bb3b633f0424c4a0111516a8c06da24e`（返工基准曾校验 `43f6fc46cd9080ca212f7cb6d62c291a83eae489`）
- **GitHub Pages：** 未启用（`has_pages: false`）

## 取景（focusRoom 并集）

点 **APP制作台 / 人事部 / 茶水间** 时，`focusRoom` 对 Leafer `zoom(bounds, 36)` 的 `bounds` 为场景坐标下三矩形并集：

1. 被点房间 `ROOM_HIT_REGIONS` 项  
2. **老大办公室**（`boss`）  
3. **`ASSISTANT_HOTSPOT`**（常量未改）

实现：`focusUnionBounds(room)` = `unionBounds(region, boss, ASSISTANT_HOTSPOT)`（`src/scene-constants.ts`）。动画仍为 `duration: 0.32`、`easing: 'ease-out'`；`prefers-reduced-motion` 下无 duration。点 **老大办公室** 仍走 `goHome()` → `zoom('fit', 24)`。

茶水间并集横跨右侧茶水间与左侧回家点，取景较宽属预期。

## 相机 / 平移 / 缩放（保留）

- `@leafer-in/view` + `@leafer-in/viewport` **1.12.x**；`tree: { type: 'viewport' }`。
- DOM 热区用 `app.tree` 的 `x` / `y` / `scaleX` 与 scene-local Rect 同步。

### 验证（Playwright，不先点「适应」）

- `npm run build && CI=1 npm run test:e2e`（19/19）
- 三间房放大态断言助理 / 老大办公室热区与 `#scene-viewport` 交集 ≥80% 面积、可见边 ≥24 CSS px；从三态在视口内点回家（无 `force:true`）。
- **预览：** `http://127.0.0.1:4173`（Playwright `webServer`）

## 字阶

- 工具条 `.scene-toolbar` / `button`：**12px / 20px**，`#6E6C65`（说明与「适应」）。
- Noto Serif SC：**400** → `noto-serif-sc-chinese-simplified-400-normal.woff2`；**700** → `noto-serif-sc-chinese-simplified-700-normal.woff2`（`node_modules/@fontsource/noto-serif-sc/files/...`）。
- 右栏「与助理的对话」：`h2.panel-title` **18/28 Bold `#2A2923`**；已移除误导性的 `.chat-card__title` 17px 规则。

## 叠框 Artifacts（1920×1080）

路径：`/opt/cursor/artifacts/hotspot-overlay-*.png`

- `fit-default`、`after-pan`、`after-zoom-in`、`after-wheel-zoom`
- `click-app-projects`、`click-hr-projects`、`click-pantry-mistakes`
- `click-home-from-hr`、`click-home-from-pantry`（各与对应放大态截图哈希不同；已弃用无效的 `click-boss-home-chat`）

## 未做

- 真实 API、错题采集、Motion、合并、Pages