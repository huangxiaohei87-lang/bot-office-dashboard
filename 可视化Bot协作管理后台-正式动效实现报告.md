# 可视化 Bot 协作管理后台 — 正式动效实现报告

- **PR：** https://github.com/huangxiaohei87-lang/bot-office-dashboard/pull/1（**未合并**）
- **开工 head：** `890a9b27cf800e72944555c24d0fd85f36c302ae`（已核对）
- **has_pages：** false
- **新依赖：** 无（未引入 Motion；纯 CSS + 既有 Leafer 1.12.x）

## 三项实现（CSS）

1. **右栏切入 / 切出：** `.side-panel__inner--exiting` 240ms、`--entering` 320ms，`translateY(8px)` + opacity；`cubic-bezier(0.2, 0, 0, 1)`。`prefers-reduced-motion`：仅 `panel-fade-in` 透明度，无位移。
2. **列表条目：** `.panel-list__item--reveal` 280ms 上移 8px + 淡入；`.panel-list__item--selected` 浅底 + 左墨条 `#2A2923` + 「已选中」。错题本摘要同样 reveal。
3. **胶囊：** `@keyframes look-home-capsule-bounce` 为 **`translateY(0)` ↔ `translateY(-5px)`**，周期 **0.9s**（已弃用阴影明暗跳动）。

镜头 easing：Leafer `zoom` 使用 `{ name: 'cubic-bezier', value: [0.2, 0, 0, 1] }`，时长仍约 0.32s / 0.3s。

## 减少动态

右栏 / 列表 / 胶囊按上节降级；拖拽 `dragAnimate` 仍由既有逻辑在 reduced-motion 下为 `false`。

## E2E / Impeccable

- `CI=1 npm run test:e2e`：**22/22**
- **Impeccable：** 仓库无对应脚本，未执行
- **预览：** http://127.0.0.1:4173

## 叠框 SHA-256（sha256sum 实测）

| 文件 | SHA-256 |
|------|---------|
| `/opt/cursor/artifacts/hotspot-overlay-fit-default.png` | `ae0342a971ede549a6c1c3d3f9f9b614dd9ac0197946a94a49b39de93ae93744` |
| `/opt/cursor/artifacts/hotspot-overlay-click-app-or-hr-selected.png` | `2f6579e64ca0c9beecac50bc930d8f84d29193772d3edba0922946a4f31cee6f` |
| `/opt/cursor/artifacts/hotspot-overlay-click-pantry-mistakes.png` | `3d4eb2d101bbd8e8014413e6205939e0a90f7c8c20a37824a588865f398cc341` |
| `/opt/cursor/artifacts/hotspot-overlay-capsule-visible.png` | `cbac0449e293f562c9051c27f5e28e9d84958b202a25b088e4a0ed440aa65118` |
| `/opt/cursor/artifacts/hotspot-overlay-after-capsule-click.png` | `ebaf3561e306ddb32bffe19f926781d16e2c9e5638f0bf614dc99f03b0329f47` |
| `/opt/cursor/artifacts/hotspot-overlay-reduced-motion.png` | `2c713adea59a84ed046db9c91ac2f96d6bf4ce5e0c98797edcca02a8cff98685` |

胶囊关键帧：`look-home-capsule-bounce` 使用 `translateY(-5px)`，时长 **0.9s**（见 `src/styles.css`）。

## 交付 head

- **PR head / 功能提交：** `a7b116c1528419245c03a182593c0123ac0e1c6d`