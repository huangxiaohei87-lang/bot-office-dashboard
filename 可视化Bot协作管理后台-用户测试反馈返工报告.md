# 可视化 Bot 协作管理后台 — 用户测试反馈返工报告

- **PR：** https://github.com/huangxiaohei87-lang/bot-office-dashboard/pull/1（未合并）
- **开工 head：** `c7a92773c246f55a6f4f5d19b896d22c868a2212`（已核对）
- **交付 head：** 见文末 `git rev-parse HEAD` / GitHub
- **has_pages：** false
- **E2E：** `CI=1 npm run test:e2e` → **19/19**
- **预览：** http://127.0.0.1:4173

## 四条改动摘要

1. **点击 / 拖拽分离**：HTML 叠框 `pointer-events: none`；Leafer 房间 Rect `hittable: false`；`#scene-viewport` 上用 6px 阈值区分短按与拖拽；短按走叠框 DOM 命中 + 场景坐标兜底。
2. **平移跟手 / 惯性**：`move.dragAnimate: 0.92`（`@leafer-in/viewport`）；`prefers-reduced-motion` 下 `dragAnimate: false`。
3. **HiDPI / 清晰度**：`App` `pixelRatio: min(devicePixelRatio, 2)`；场景图 `smooth: true`。源图 `ambient-07.png` **1346×876**，`zoom.max` 3.5：典型 1920 布局下近距再滚轮仍会超过源像素而发糊；无同构图更高清正式资产可换，需视觉方更高分辨率改稿 07。
4. **聊天回车发送**：`#chat-input` Enter 写入用户气泡 + 本地一句「页面内预览」说明，无外部 API。

## 叠框（SHA-256）

| 文件 | SHA-256 |
|------|---------|
| `/opt/cursor/artifacts/hotspot-overlay-fit-default.png` | `ae0342a971ede549a6c1c3d3f9f9b614dd9ac0197946a94a49b39de93ae93744` |
| `...-after-pan-on-app-room.png` | `9e83cd84a9ae6a085879ea38dc643d5b0a0f6097e70501efcb3eefeff17c9516` |
| `...-after-wheel-on-room.png` | `28720c66f3a3bdfa6454f2dabc0843d987366434b88e7a90a5dd2b043a974575` |
| `...-click-hr-projects.png` | `508019a2f8e0397820b7c245aafe57921058bb9793803a9b8c3e998ae4487241` |
| `...-chat-after-enter-send.png` | `11f8e28d03a6ed79fb35313039be7b05c6dbb7e004fca6404d4e739c6151697e` |

副本：`/workspace/tmp/用户测试反馈叠框/`（同名）

## 交付 head SHA

`e82c6df82f1d5a9075833924275951c7d827da33`