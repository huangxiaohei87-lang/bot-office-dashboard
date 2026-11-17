/** Cropped from 01-左侧场景氛围.png: dark viewport bbox (42,42)–(1388,918). */

export const SCENE_CROP = { left: 42, top: 42, width: 1346, height: 876 }

export const SCENE_W = SCENE_CROP.width
export const SCENE_H = SCENE_CROP.height

/** Boss-office 助理 — uncropped ~330–530 × 470–620 → scene-local after crop. */
export const ASSISTANT_HOTSPOT = {
  x: 298,
  y: 432,
  width: 188,
  height: 172,
}

export type ClickableRoomId = 'boss' | 'app' | 'hr' | 'pantry'

export interface SceneRegion {
  id: ClickableRoomId
  label: string
  x: number
  y: number
  width: number
  height: number
}

/** Measured on ambient-07.png (1346×876); uncreated plots omitted (not clickable). */
export const ROOM_HIT_REGIONS: SceneRegion[] = [
  { id: 'app', label: 'APP制作台', x: 318, y: 72, width: 668, height: 368 },
  { id: 'boss', label: '老大办公室', x: 138, y: 468, width: 378, height: 348 },
  { id: 'hr', label: '人事部', x: 398, y: 548, width: 298, height: 278 },
  { id: 'pantry', label: '茶水间', x: 868, y: 448, width: 418, height: 358 },
]

export function regionById(id: ClickableRoomId): SceneRegion {
  const r = ROOM_HIT_REGIONS.find((x) => x.id === id)
  if (!r) throw new Error(`unknown room ${id}`)
  return r
}

export interface BoundsRect {
  x: number
  y: number
  width: number
  height: number
}

export function unionBounds(...rects: BoundsRect[]): BoundsRect {
  const x1 = Math.min(...rects.map((r) => r.x))
  const y1 = Math.min(...rects.map((r) => r.y))
  const x2 = Math.max(...rects.map((r) => r.x + r.width))
  const y2 = Math.max(...rects.map((r) => r.y + r.height))
  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 }
}

/** Focus zoom must keep boss office + assistant visible when drilling into app/hr/pantry. */
export function focusUnionBounds(room: Exclude<ClickableRoomId, 'boss'>): BoundsRect {
  const region = regionById(room)
  const boss = regionById('boss')
  return unionBounds(region, boss, ASSISTANT_HOTSPOT)
}