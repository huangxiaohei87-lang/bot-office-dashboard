# 可视化 Bot 协作管理后台 — 工程返工报告（近距取景 + 看向胶囊）

- **PR：** https://github.com/huangxiaohei87-lang/bot-office-dashboard/pull/1（**未合并**）
- **分支：** `cursor/phase1-prototype-90f3` → `main`
- **返工基准：** `2176604c232134167676aa7327a30fdcb0bf41e3`（并集拉远版）
- **GitHub Pages：** `has_pages=false`

**PR head SHA 以 GitHub 为准**（文末列本次推送值）。

## 取景

- 撤销并集默认镜头：`focusRoom` 恢复 `app.tree.zoom(被点房间, 36, …)`。
- 新增 `homeAnchorBounds()` = 老大办公室 ∪ 助理，仅用于胶囊点击 `lookTowardHome()`。
- 胶囊：非 overview 且回家点不可点时显示；点按仅移镜头，右栏与 `viewState` 不变。

## 字阶

工具条 12/20、宋体 700 woff2、`.panel-title` 18/28 — **未回退**。

## E2E

`CI=1 npm run test:e2e` — **16/16**；预览 `http://127.0.0.1:4173`。

## Artifacts（SHA-256）

| 文件 | SHA-256 |
|------|---------|
| `hotspot-overlay-fit-default.png` | `ae0342a971ede549a6c1c3d3f9f9b614dd9ac0197946a94a49b39de93ae93744` |
| `hotspot-overlay-after-pan.png` | `5daf60a7d1dd82644b2e1a28da9d53d03825fd833a94ebc3f5c38c20e2c35ee3` |
| `hotspot-overlay-after-zoom-in.png` | `4f0b6bdf3f375c9f5a28030dc62a3619a722cfd674c72d1041111063d251d21` |
| `hotspot-overlay-after-wheel-zoom.png` | `6b24e800e1261270d2059728cdb5817c8cbc2ac8ae3cedb0120521f142c55438` |
| `hotspot-overlay-click-app-projects.png` | `4d9811c4965c83b816c5f7a0f224f4eec3ff753d89c946ee107c7fa4cd584ba6` |
| `hotspot-overlay-click-capsule-from-app.png` | `22e8b55e76371303fa9a1cdad0a5232c999f3c859468d21684911c8b40c5c8a0` |
| `hotspot-overlay-click-hr-projects.png` | `6be7f56e45417a1324f7181f593dd94dc06f1e7a8f794dd73ebc30d3df32486e` |
| `hotspot-overlay-click-capsule-from-hr.png` | `fd6f2a78e1e82be724dd56f807b3f80feca35dc352ba614247597b0b5fc88de3` |
| `hotspot-overlay-click-home-from-hr.png` | `44635cda886886a0bcb66a7cf88a3d21cf3feeb3cbcf5787cf17e381a2502564` |
| `hotspot-overlay-click-pantry-mistakes.png` | `b6c45e2569602433b9523578b6441faa158a563f494742c3e841d6117699b7c0` |
| `hotspot-overlay-click-capsule-from-pantry.png` | `323a18295f294470555d3dfa14f4d4c2fb54cf3d2e4a59e35c46499b630bc8c2` |
| `hotspot-overlay-click-home-from-pantry.png` | `44635cda886886a0bcb66a7cf88a3d21cf3feeb3cbcf5787cf17e381a2502564` |

点胶囊后 ≠ 对应放大态；回家图 ≠ 放大态且 ≠ 点胶囊后（两路回家图同为总览态，哈希相同属预期）。

## 未完成

本补充单范围内无。