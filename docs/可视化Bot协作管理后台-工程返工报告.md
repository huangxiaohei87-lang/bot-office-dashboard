# 可视化 Bot 协作管理后台 — 工程返工报告（审查退回）

- **PR：** https://github.com/huangxiaohei87-lang/bot-office-dashboard/pull/1（同一分支 `cursor/phase1-prototype-90f3`，未合并）
- **开工基线：** `2f9895fdaff3e919adfea1539595707aa42e5811`
- **GitHub Pages：** 未启用

## 必须项

### 1）运行时热区同步

- **根因：** `getClientPointByWorld` / `getLayoutBounds('inner')` 未含 Leafer 视口 fit/平移/缩放，DOM 按钮停在未变换场景坐标角上。
- **修复：** 用 `getWorldPointByClient` 做逆映射（四角 scene-world → view，迭代收敛），`syncHitButton` 与 `__getAssistantHotspotScreenRect` 在 `RenderEvent.END`、`LayoutEvent.END`、zoom/fit/resize 后更新。
- **常量：** `ASSISTANT_HOTSPOT (298,432,188×172)` 与裁切图未改。
- **1920×1080 实测（preview/fit 默认）：** 热区 `getBoundingClientRect` 约 **left 332, top 538, 189×172**；中心约 **(426, 624)**（审查推算约 370–458, 539–620 一带）。
- **验证：** Playwright 用屏幕坐标断言相对视口比例；点人物中心聚焦；点左上空白不聚焦；平移/缩放/fit 后仍跟随。

### 2）左栏工具条底边留白

- `.scene-column` padding 改为 **`18px` 四边**（原 `18px 18px 0`）。1920×1080 下工具条底与右栏卡片底对齐（约距 shell 下缘 18px）。

## 建议项

| # | 改动 |
|---|------|
| 3 | 「适应」改为下划线文字 `toolbar-fit`，无实心填底 |
| 4 | `审查闸门` 加 `.phrase-nowrap` |
| 5 | 占位符 `给助理发消息…` |
| 6 | 标题 `font-weight: 500`，`clamp(18px, 1.65vw, 22px)`，`letter-spacing: 0.008em` |

## 测试

```bash
npm run test:e2e
```

**8/8 通过**（含热区屏幕坐标、点击人物/空白、工具条留白、叠框截图 spec）。

## 叠框 Artifact（1920×1080）

- `/opt/cursor/artifacts/hotspot-overlay-fit-default.png`
- `/opt/cursor/artifacts/hotspot-overlay-after-pan.png`
- `/opt/cursor/artifacts/hotspot-overlay-after-zoom-in.png`

## 未改

定稿色板、对话卡片+气泡结构、场景图常量与裁切、Pages/Settings。