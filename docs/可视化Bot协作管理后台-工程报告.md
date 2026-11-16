# 可视化 Bot 协作管理后台 — 工程报告（第一期）

> 交付路径：本文件位于 GitHub 仓库 `docs/` 下，不写用户本机目录。

## PR 与分支

- **目标仓库：** https://github.com/huangxiaohei87-lang/bot-office-dashboard
- **功能分支：** `cursor/phase1-prototype-90f3` → `main`
- **PR：** https://github.com/huangxiaohei87-lang/bot-office-dashboard/pull/1
- **未合并 PR，未启用 GitHub Pages，未改仓库 Settings。**

## main 初始提交

- 提交 `Initial commit`：仅含最小 `README.md`（仓库标题一句），无产品代码。

## 本轮实现

1. Vite + TypeScript 单页应用，纸白外壳与右侧 480px 对话圆角卡片（CSS，对齐 DESIGN.md §8 / 改稿 07）。
2. 左侧近黑圆角视口（`#101010`，16px），内嵌 LeaferJS：`01-左侧场景氛围.png` 作为场景图（`public/assets/scene/ambient-07.png`），支持拖拽平移、滚轮/按钮缩放；`rotateSpeed: 0` 禁止旋转。
3. 助理点击热区（透明 Rect）聚焦右侧输入与卡片强调，无新窗口。
4. `src/mock-data.ts` 本地模拟状态与对话（设计稿 03 同等文案）。
5. 设计文档与界面参考图、`docs/licenses/` 许可摘录、`LICENSE`（MIT）、`THIRD_PARTY_NOTICES`。
6. Playwright 烟雾测试 `e2e/dashboard.spec.ts`。

## 依赖与许可

| 组件 | 许可 |
| --- | --- |
| 本仓库源码 | MIT（`LICENSE`） |
| leafer-ui / @leafer-ui/* | MIT |
| Vite, TypeScript | MIT / Apache-2.0 |
| @fontsource/noto-serif-sc, noto-sans-sc | SIL OFL 1.1（打包 woff2） |
| Playwright | Apache-2.0（仅开发） |

详见根目录 `THIRD_PARTY_NOTICES`。

## 对齐说明（改稿 07）

- **外壳：** `#FEFEFE` 页底、`#F4F2EE` 窗口壳、18px 外圆角；Noto Serif 标题、Noto Sans 正文。
- **视口：** 纸白壳上黑底圆角容器，工具条在黑框下方纸白条带。
- **场景：** 使用改稿 07 预渲氛围图，不手写场景、不用 Kenney 重搭；环境光与哑光名牌效果 baked in 于定稿图。
- **对话：** 内缩圆角卡片、墨块头像「助」「我」、模拟三句对话。
- **交互：** 仅浅用 Leafer 平移/缩放/放置；无派活走来、完工汇报、新建办公室、登录、后端、真实 API。

## 本地预览

```bash
npm install
npm run dev        # http://localhost:5173
# 或
npm run build && npm run preview
```

**GitHub Pages：未启用。**

## 测试结果（Playwright）

执行：`npm run test:e2e`（preview 4173）

| 用例 | 结果 |
| --- | --- |
| 纸白外壳、近黑视口、对话栏可见 | 通过 |
| 模拟状态文案（四间房、离开、休息、人事部） | 通过 |
| 平移、缩放、场景 rotation = 0 | 通过 |
| 点击助理聚焦对话、不另开窗口 | 通过 |

## 未做事项与风险

- 未实现：开灯/关灯动态切换、姿态动画、派活/汇报、多会话、真实 Bot 状态流。
- 助理点击依赖 Leafer 命中与坐标换算；极端缩放后需以实际点击矩形命中为准（热区已加大）。
- 字体为简体中文 woff2 子集，体积约 2.5MB+；可进一步子集化。
- 已知设计缺口见 `docs/ENGINEERING.md`，本轮未修。

## 云端代理说明

在 Cursor Cloud Agent 环境完成：阅读手交包与设计图、拷贝资产入仓、实现原型、跑烟雾测试、开 PR。