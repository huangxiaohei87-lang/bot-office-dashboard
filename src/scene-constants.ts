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