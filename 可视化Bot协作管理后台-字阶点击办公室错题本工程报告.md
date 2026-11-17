# 可视化 Bot 协作管理后台 — 字阶 / 点击办公室 / 茶水间错题本（工程返工报告）

- **PR：** https://github.com/huangxiaohei87-lang/bot-office-dashboard/pull/1（**未合并**）
- **分支：** `cursor/phase1-prototype-90f3` → `main`
- **返工任务单基准 SHA：** `43f6fc46cd9080ca212f7cb6d62c291a83eae489`（开工前已核对）
- **GitHub Pages：** `has_pages=false`（未启用）

> **head SHA：** `57324a0520cb1b205ae98d82f87d03f501a0d5ae`

## 1. 取景（并集 bounds）

**问题：** `focusRoom` 仅对被点房间 `zoom`，人事部 / 茶水间 / APP 放大后老大办公室名牌与助理被裁出视口。

**改法：** `src/scene-canvas.ts` 中，对 `app` | `hr` | `pantry` 使用 `focusUnionBounds(room)`：

```
bounds = union(被点房间, 老大办公室 region, ASSISTANT_HOTSPOT)
app.tree.zoom(bounds, 36, …, { duration: 0.32, easing: 'ease-out' })
```

`unionBounds` / `focusUnionBounds` 定义于 `src/scene-constants.ts`。`ASSISTANT_HOTSPOT` 与裁切图未改。点老大办公室仍为 `goHome()` / `zoom('fit', 24)`。

## 2. E2E 与叠框

- **CI=1 `npm run test:e2e`：** **19/19** 通过
- **预览：** `http://127.0.0.1:4173`
- 放大三态后断言 `#scene-viewport` 与 `[data-testid=assistant-scene-hit]`、`[data-testid=room-hit-boss]` 交集（≥80% 面积、可见宽高 ≥24px）
- 从 APP / 人事部 / 茶水间放大态在视口内点助理或老大办公室回家，右栏「与助理的对话」，`overview`；未使用 `force:true`
- 弃用与茶水间放大态同哈希的 `click-boss-home-chat`；新增有效回家叠框（见下表）

### Artifacts SHA-256（`/opt/cursor/artifacts/`）

| 文件 | SHA-256 |
|------|---------|
| `hotspot-overlay-fit-default.png` | `ae0342a971ede549a6c1c3d3f9f9b614dd9ac0197946a94a49b39de93ae93744` |
| `hotspot-overlay-after-pan.png` | `5daf60a7d1dd82644b2e1a28da9d53d03825fd833a94ebc3f5c38c20e2c35ee3` |
| `hotspot-overlay-after-zoom-in.png` | `4f0b6bdf3f375c9f5a28030dc62a3619a722cfd674c72d1041111063d251d21` |
| `hotspot-overlay-after-wheel-zoom.png` | `6b24e800e1261270d2059728cdb5817c8cbc2ac8ae3cedb0120521f142c55438` |
| `hotspot-overlay-click-app-projects.png` | `3ba84fd35d23002127778c13fdb7d305b8198b139fb8f3380c78d4d652cf97e4` |
| `hotspot-overlay-click-hr-projects.png` | `24f47247bb08f803ff794da6f6f74e6c015f390902bb1d518d61f59327b1c7c2` |
| `hotspot-overlay-click-pantry-mistakes.png` | `4b6d7e50cc45380346b60c6e4264583fe776c348aa015e8904aea2ec104d455a` |
| `hotspot-overlay-click-home-from-hr.png` | `44635cda886886a0bcb66a7cf88a3d21cf3feeb3cbcf5787cf17e381a2502564` |
| `hotspot-overlay-click-home-from-pantry.png` | `44635cda886886a0bcb66a7cf88a3d21cf3feeb3cbcf5787cf17e381a2502564` |

回家图与对应放大态哈希对比：

- `click-home-from-hr` ≠ `click-hr-projects` ✓
- `click-home-from-pantry` ≠ `click-pantry-mistakes` ✓  
（两帧回家图彼此相同：均为 `goHome()` 后总览 + 对话，属预期。）

## 3. 字阶残留

- 工具条：**12px / 20px**，说明色 `#6E6C65`
- Noto Serif **700** 文件：`node_modules/@fontsource/noto-serif-sc/files/noto-serif-sc-chinese-simplified-700-normal.woff2`（构建产物 `dist/assets/noto-serif-sc-chinese-simplified-700-normal-*.woff2`）
- 删除 `.chat-card__title` 17px；栏标题统一 `.panel-title` 18/28 `#2A2923`

## 保留项

平移/缩放插件与 DOM 热区同步、右栏项目列表与茶水间错题本、未创建空地不可点 — 未回退。

## 未完成项

无（本返工单三项范围内）。

## 交付 head SHA

`57324a0520cb1b205ae98d82f87d03f501a0d5ae`