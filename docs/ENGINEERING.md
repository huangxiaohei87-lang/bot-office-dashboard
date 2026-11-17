# 可视化 Bot 协作管理后台 — 技术说明（草稿）

> 正式交付报告由工程在云电脑写入 `可视化Bot协作管理后台-字阶点击办公室错题本工程报告.md`。本文件为仓库内可版本化的技术草稿。

## 当前状态

- **分支：** `cursor/phase1-prototype-90f3` → `main`（[PR #1](https://github.com/huangxiaohei87-lang/bot-office-dashboard/pull/1)，未合并）
- **head SHA：** 见本文件文末 `git rev-parse HEAD` 输出（推送到 GitHub 后以此为准）
- **GitHub Pages：** 未启用

## 相机 / 平移 / 缩放（回归修复）

### 根因

1. `zoom('fit'|'in'|…)` 依赖 **`@leafer-in/view`** 插件；未安装时控制台报错且镜头几乎不动。
2. 视口平移依赖 **`@leafer-in/viewport`** + `tree: { type: 'viewport' }`。
3. DOM 叠框须用 **`app.tree` 的 `x` / `y` / `scaleX`** 与场景 Rect 的 scene-local `x,y,width,height` 同步，不能用固定 `fitScale` 的逆映射。

### 热区同步

- `ASSISTANT_HOTSPOT` 与 `ROOM_HIT_REGIONS` 未改常量裁图。
- `syncAllHits` 在 `RenderEvent.END`、缩放、fit、resize 后执行。
- 透明 DOM 按钮仅作叠框与点击；房间叠框 `pointer-events: auto`，助理叠框可点击回家/聚焦。

### 验证（Playwright，不先点「适应」）

- `npm run build && CI=1 npm run test:e2e`（16/16）
- 断言含：平移后 `__getTreeState` 位移、按钮缩放热区变大、滚轮 `scaleX` 增大、各房间交互与错题本、artifact 截图哈希差异。
- **预览端口：** Playwright `webServer` 固定 `http://127.0.0.1:4173`；本地手测请 `npm run preview -- --host 127.0.0.1 --port 4173`。

## 字阶 / 次要色 / 右栏

- 窗口标题 22/32 Serif **700** `#171414`；栏标题 18/28；正文 14/22；次要 `#6E6C65`。
- 右栏模式：`chat` | `app-projects` | `hr-projects` | `mistakes`（茶水间错题本，本地示例文案，均标「示例」）。

## 叠框 Artifacts（1920×1080）

路径：`/opt/cursor/artifacts/hotspot-overlay-*.png`

- `fit-default`、`after-pan`、`after-zoom-in`、`after-wheel-zoom`
- `click-app-projects`、`click-hr-projects`、`click-pantry-mistakes`、`click-boss-home-chat`

## 第三方

- LeaferJS / leafer-ui / `@leafer-in/view` / `@leafer-in/viewport` — MIT
- Noto Serif SC / Noto Sans SC（Fontsource）— SIL OFL
- 见仓库根 `THIRD_PARTY_NOTICES`

## 未做

- 真实 API、错题采集、走位汇报、Motion 库（动效以 CSS + `prefers-reduced-motion` 为主）