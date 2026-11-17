/** Local mock — matches 改稿 07 default scene state (no live Bot APIs). */

export interface OfficeRoom {
  id: string
  name: string
  lit: boolean
  created: boolean
}

export const rooms: OfficeRoom[] = [
  { id: 'boss', name: '老大办公室', lit: true, created: true },
  { id: 'app', name: 'APP制作台', lit: true, created: true },
  { id: 'hr', name: '人事部', lit: true, created: true },
  { id: 'pantry', name: '茶水间', lit: true, created: true },
  { id: 'plot-n', name: '未创建', lit: false, created: false },
  { id: 'plot-e', name: '未创建', lit: false, created: false },
]

export interface BotPresence {
  role: string
  location: string
  posture: '在岗工作' | '离开' | '茶水间休息'
}

export const presence: BotPresence[] = [
  { role: '助理', location: '老大办公室', posture: '在岗工作' },
  { role: '构思家', location: 'APP制作台', posture: '在岗工作' },
  { role: '素材管理', location: 'APP制作台', posture: '在岗工作' },
  { role: '工程', location: 'APP制作台', posture: '在岗工作' },
  { role: '审查闸门', location: 'APP制作台', posture: '在岗工作' },
  { role: '上架辅助', location: 'APP制作台', posture: '在岗工作' },
  { role: '视觉与动效', location: '茶水间', posture: '茶水间休息' },
  { role: 'HR', location: '人事部', posture: '在岗工作' },
]

export { ASSISTANT_HOTSPOT as assistantHotspot } from './scene-constants'

export interface ProjectRow {
  title: string
  meta: string
}

export const appProjects: ProjectRow[] = [
  {
    title: '贪吃蛇网页游戏试点',
    meta: '示例 · 第一期网站 · 审查已通过（示例），待上架确认',
  },
  {
    title: '可视化 Bot 协作管理后台',
    meta: '示例 · 进行中 · 本地示例数据，非真实接口',
  },
]

export const hrProjects: ProjectRow[] = [
  {
    title: '软件产品团队组建',
    meta: '示例 · 已完成 · 6 周 · HR + 助理编排（示例）',
  },
  {
    title: '第一期岗位入职',
    meta: '示例 · 进行中 · 本地示例数据，非真实接口',
  },
]

export interface MistakeSummary {
  label: string
  body: string
}

export interface MistakeRow {
  icon: string
  title: string
  meta: string
}

export const pantryMistakeSummaries: MistakeSummary[] = [
  {
    label: '当日复盘（示例）· 11-17',
    body: '今晚先看工作方式上的提醒。完整复盘正文仍交用户确认，不在右栏展开。本块为界面示例，不是已记入的真实复盘。',
  },
  {
    label: '当周工作流优化（示例）',
    body: '按组各列可执行建议；HR 已纳入本周范围。完整总报不在右栏展开。',
  },
]

export const pantryMistakes: MistakeRow[] = [
  {
    icon: '素',
    title: '素材管理：入库记录漏写参考图的许可核对日期（示例）',
    meta: '示例 · 11-17 已补记来源与许可，以后入库必写核对日期',
  },
  {
    icon: '上',
    title: '上架辅助：未经确认的商店文案草稿被放进待发布夹（示例）',
    meta: '示例 · 已移回草稿，发布仍须用户本人确认',
  },
  {
    icon: '助',
    title: '助理：把仍待过目的说明误写成工程可以开工（示例）',
    meta: '示例 · 已更正表述，确认前不得派工程',
  },
  {
    icon: 'H',
    title: 'HR：岗位说明把临时要求写成了长期规则（示例）',
    meta: '示例 · 已改回「以当次任务单为准」',
  },
]

export const chatMessages = [
  {
    from: 'assistant' as const,
    text: '你好，我是助理。今天办公室里大家都在，有什么要安排的吗？',
  },
  {
    from: 'user' as const,
    text: '现在谁在做什么？',
  },
  {
    from: 'assistant' as const,
    text: [
      '我在老大办公室。',
      'APP制作台这边，构思家、素材管理、工程、审查闸门、上架辅助都在岗工作。',
      '视觉与动效在茶水间休息，他的工位是离开状态。',
      '人事部的 HR 也在岗。',
    ],
  },
]