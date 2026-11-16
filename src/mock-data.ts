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