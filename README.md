# 可视化 Bot 协作管理后台

第一期网页原型：纸白外壳 + 近黑等轴测场景视口 + 与助理的常驻对话栏。对齐设计改稿 07，场景使用定稿艺术图在 [LeaferJS](https://github.com/leaferjs/leafer-ui) 上平移/缩放。

**GitHub Pages：** 未启用（请勿在本仓库 Settings 中开启 Pages，除非另行批准）。

## 本地预览

```bash
git clone https://github.com/huangxiaohei87-lang/bot-office-dashboard.git
cd bot-office-dashboard
npm install
npm run dev
```

浏览器打开终端提示的地址（默认 `http://localhost:5173`）。

生产构建预览：

```bash
npm run build
npm run preview
```

## 测试（Playwright 烟雾）

```bash
npx playwright install chromium   # 首次
npm run test:e2e
```

## 文档与资产

- `docs/DESIGN.md` — 设计规格
- `docs/动效说明.md`、`docs/设计报告.md`
- `public/assets/scene/ambient-07.png` — 左侧场景（由 `01` 裁切视口 1346×876，无重复工具条）
- `public/assets/interface/` — 界面对齐参考图
- `LICENSE`（MIT）、`THIRD_PARTY_NOTICES`

## 技术栈

Vite + TypeScript + leafer-ui（MIT）+ 自托管 Noto Serif/Sans SC（SIL OFL，经 `@fontsource`）。