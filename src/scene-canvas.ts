import '@leafer-in/view'
import '@leafer-in/viewport'
import { App, Group, Image, Rect } from 'leafer-ui'
import { RenderEvent } from '@leafer/core'
import {
  ASSISTANT_HOTSPOT,
  type ClickableRoomId,
  ROOM_HIT_REGIONS,
  homeAnchorBounds,
  regionById,
  SCENE_H,
  SCENE_W,
} from './scene-constants'

const SCENE_URL = `${import.meta.env.BASE_URL}assets/scene/ambient-07.png`

export type ViewState = 'overview' | ClickableRoomId

export interface HotspotScreenRect {
  left: number
  top: number
  width: number
  height: number
  centerX: number
  centerY: number
}

export interface SceneCanvasCallbacks {
  onAssistantFocus: () => void
  onBossHome: () => void
  onRoomFocus: (room: ClickableRoomId) => void
}

export interface HomeHitVisibility {
  frac: number
  visibleWidth: number
  visibleHeight: number
}

export interface SceneCanvas {
  app: App
  zoomBy: (delta: number) => void
  resetView: () => void
  goHome: () => void
  focusRoom: (room: ClickableRoomId) => void
  lookTowardHome: () => void
  getViewState: () => ViewState
  getSceneRotation: () => number
  getHotspotScreenRect: () => HotspotScreenRect | null
  getAssistantScreenCenter: () => { x: number; y: number } | null
  getRoomScreenCenter: (room: ClickableRoomId) => { x: number; y: number } | null
  getHomeHitsVisibility: () => { assistant: HomeHitVisibility; boss: HomeHitVisibility }
  isLookHomeCapsuleVisible: () => boolean
  sampleWorldAtClient: (clientX: number, clientY: number) => { x: number; y: number }
  getCameraScale: () => number
  getTreeState: () => { x: number; y: number; scale: number }
  getMoveDragAnimate: () => boolean | number | undefined
  tapAtClient: (clientX: number, clientY: number) => void
}

const TAP_DRAG_THRESHOLD_PX = 6

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function pickTargetAtScenePoint(x: number, y: number): ClickableRoomId | 'assistant' | null {
  const inRect = (rx: number, ry: number, w: number, h: number) =>
    x >= rx && x <= rx + w && y >= ry && y <= ry + h
  if (inRect(ASSISTANT_HOTSPOT.x, ASSISTANT_HOTSPOT.y, ASSISTANT_HOTSPOT.width, ASSISTANT_HOTSPOT.height)) {
    return 'assistant'
  }
  for (const region of ROOM_HIT_REGIONS) {
    if (inRect(region.x, region.y, region.width, region.height)) return region.id
  }
  return null
}

export function createSceneCanvas(mount: HTMLElement, callbacks: SceneCanvasCallbacks): SceneCanvas {
  const reducedMotion = prefersReducedMotion()
  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1

  const app = new App({
    view: mount,
    fill: '#101010',
    pixelRatio: dpr,
    tree: { type: 'viewport' },
    wheel: {
      zoomMode: true,
      rotateSpeed: 0,
      preventDefault: true,
    },
    move: {
      drag: true,
      dragEmpty: true,
      dragAnimate: reducedMotion ? false : 0.92,
    },
    pointer: {
      dragDistance: TAP_DRAG_THRESHOLD_PX,
    },
    multiTouch: {
      singleGesture: { rotation: 0, scale: 1 },
    },
    zoom: { min: 0.35, max: 3.5 },
  })

  const content = new Group({ name: 'scene-root' })

  const sceneImage = new Image({
    url: SCENE_URL,
    width: SCENE_W,
    height: SCENE_H,
    draggable: false,
    hittable: false,
    smooth: true,
  })

  let viewState: ViewState = 'overview'

  const assistantHit = new Rect({
    x: ASSISTANT_HOTSPOT.x,
    y: ASSISTANT_HOTSPOT.y,
    width: ASSISTANT_HOTSPOT.width,
    height: ASSISTANT_HOTSPOT.height,
    fill: 'rgba(0,0,0,0.01)',
    cursor: 'pointer',
    hittable: false,
    data: { testid: 'assistant-hotspot' },
  })

  const roomHits: { id: ClickableRoomId; rect: Rect; button: HTMLButtonElement }[] = []

  const goHome = () => {
    viewState = 'overview'
    if (prefersReducedMotion()) app.tree.zoom('fit', 24)
    else app.tree.zoom('fit', 24, undefined, { duration: 0.32, easing: 'ease-out' })
    requestAnimationFrame(syncAllHits)
  }

  const focusRoom = (room: ClickableRoomId) => {
    if (room === 'boss') {
      goHome()
      return
    }
    viewState = room
    const region = regionById(room)
    const bounds = { x: region.x, y: region.y, width: region.width, height: region.height }
    if (prefersReducedMotion()) app.tree.zoom(bounds, 36)
    else app.tree.zoom(bounds, 36, undefined, { duration: 0.32, easing: 'ease-out' })
    requestAnimationFrame(syncAllHits)
  }

  const lookTowardHome = () => {
    if (viewState === 'overview') return
    const bounds = homeAnchorBounds()
    const finish = () => {
      syncAllHits()
      updateLookHomeCapsule()
    }
    if (prefersReducedMotion()) {
      app.tree.zoom(bounds, 32)
      finish()
    } else {
      app.tree.zoom(bounds, 32, undefined, { duration: 0.3, easing: 'ease-out' })
      window.setTimeout(finish, 360)
    }
    requestAnimationFrame(syncAllHits)
  }

  const focusAssistant = () => {
    if (viewState === 'overview') {
      callbacks.onAssistantFocus()
      return
    }
    goHome()
    callbacks.onBossHome()
    callbacks.onAssistantFocus()
  }

  const activateRoom = (id: ClickableRoomId) => {
    if (id === 'boss') {
      goHome()
      callbacks.onBossHome()
      return
    }
    focusRoom(id)
    callbacks.onRoomFocus(id)
  }

  const pickTargetAtClient = (clientX: number, clientY: number): ClickableRoomId | 'assistant' | null => {
    const inRect = (el: HTMLElement) => {
      const r = el.getBoundingClientRect()
      return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom
    }
    if (inRect(hitButton)) return 'assistant'
    for (const { id, button } of roomHits) {
      if (inRect(button)) return id
    }
    const pt = app.tree.getWorldPointByClient({ clientX, clientY })
    return pickTargetAtScenePoint(pt.x, pt.y)
  }

  const handleSceneTap = (clientX: number, clientY: number) => {
    const target = pickTargetAtClient(clientX, clientY)
    if (target === 'assistant') {
      focusAssistant()
    } else if (target) {
      activateRoom(target)
    }
  }

  for (const region of ROOM_HIT_REGIONS) {
    const rect = new Rect({
      x: region.x,
      y: region.y,
      width: region.width,
      height: region.height,
      fill: 'rgba(0,0,0,0.01)',
      cursor: 'pointer',
      hittable: false,
    })

    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'scene-room-hit'
    btn.dataset.testid = `room-hit-${region.id}`
    btn.dataset.room = region.id
    btn.title = region.label
    btn.setAttribute('aria-label', `点击${region.label}`)
    btn.tabIndex = -1
    mount.appendChild(btn)
    roomHits.push({ id: region.id, rect, button: btn })
  }

  content.add(sceneImage)
  for (const { rect } of roomHits) content.add(rect)
  content.add(assistantHit)
  app.tree.add(content)

  const hitButton = document.createElement('button')
  hitButton.type = 'button'
  hitButton.className = 'assistant-scene-hit'
  hitButton.dataset.testid = 'assistant-scene-hit'
  hitButton.title = '点击助理'
  hitButton.setAttribute('aria-label', '点击场景中的助理')
  hitButton.tabIndex = -1
  mount.appendChild(hitButton)

  let pointerTap:
    | { tracking: boolean; x: number; y: number; dragged: boolean; pointerId: number; target: EventTarget | null }
    | null = null

  mount.addEventListener(
    'pointerdown',
    (ev) => {
      if (ev.button !== 0) return
      const el = ev.target as HTMLElement
      if (el.closest('.look-home-capsule')) return
      pointerTap = {
        tracking: true,
        x: ev.clientX,
        y: ev.clientY,
        dragged: false,
        pointerId: ev.pointerId,
        target: ev.target,
      }
    },
    { capture: true },
  )

  mount.addEventListener(
    'pointermove',
    (ev) => {
      if (!pointerTap?.tracking || ev.pointerId !== pointerTap.pointerId) return
      if (
        Math.hypot(ev.clientX - pointerTap.x, ev.clientY - pointerTap.y) > TAP_DRAG_THRESHOLD_PX
      ) {
        pointerTap.dragged = true
      }
    },
    { capture: true },
  )

  const endPointerTap = (ev: PointerEvent) => {
    if (!pointerTap?.tracking || ev.pointerId !== pointerTap.pointerId) return
    const wasTap = !pointerTap.dragged
    const x = ev.clientX
    const y = ev.clientY
    pointerTap = null
    if (wasTap && !(ev.target as HTMLElement).closest('.look-home-capsule')) {
      handleSceneTap(x, y)
    }
  }

  mount.addEventListener('pointerup', endPointerTap, { capture: true })
  mount.addEventListener('pointercancel', endPointerTap, { capture: true })

  const lookHomeCapsule = document.createElement('button')
  lookHomeCapsule.type = 'button'
  lookHomeCapsule.className = 'look-home-capsule'
  lookHomeCapsule.dataset.testid = 'look-home-capsule'
  lookHomeCapsule.textContent = '看向老大办公室'
  lookHomeCapsule.hidden = true
  lookHomeCapsule.addEventListener('click', (ev) => {
    ev.stopPropagation()
    lookTowardHome()
  })
  mount.appendChild(lookHomeCapsule)

  const measureElementInViewport = (el: HTMLElement): HomeHitVisibility => {
    const vp = mount.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    const iw = Math.max(0, Math.min(r.right, vp.right) - Math.max(r.left, vp.left))
    const ih = Math.max(0, Math.min(r.bottom, vp.bottom) - Math.max(r.top, vp.top))
    const inter = iw * ih
    const area = Math.max(r.width * r.height, 1)
    return { frac: inter / area, visibleWidth: iw, visibleHeight: ih }
  }

  const getHomeHitsVisibility = () => {
    const bossBtn = roomHits.find((r) => r.id === 'boss')!.button
    return {
      assistant: measureElementInViewport(hitButton),
      boss: measureElementInViewport(bossBtn),
    }
  }

  const homeHitsFullyClickable = () => {
    const { assistant, boss } = getHomeHitsVisibility()
    const ok = (h: HomeHitVisibility) => h.visibleWidth >= 24 && h.visibleHeight >= 24 && h.frac >= 0.8
    return ok(assistant) && ok(boss)
  }

  const updateLookHomeCapsule = () => {
    const show = viewState !== 'overview' && !homeHitsFullyClickable()
    lookHomeCapsule.hidden = !show
  }

  const isLookHomeCapsuleVisible = () => !lookHomeCapsule.hidden

  const syncRectButton = (rect: Rect, button: HTMLElement) => {
    const w = rect.width ?? 0
    const h = rect.height ?? 0
    const sx = app.tree.scaleX ?? 1
    const sy = app.tree.scaleY ?? sx
    const ox = app.tree.x ?? 0
    const oy = app.tree.y ?? 0
    const lx = rect.x ?? 0
    const ly = rect.y ?? 0
    button.style.left = `${ox + lx * sx}px`
    button.style.top = `${oy + ly * sy}px`
    button.style.width = `${Math.max(24, w * sx)}px`
    button.style.height = `${Math.max(24, h * sy)}px`
  }

  const syncAllHits = () => {
    syncRectButton(assistantHit, hitButton)
    for (const { rect, button } of roomHits) syncRectButton(rect, button)
    updateLookHomeCapsule()
  }

  const getCameraScale = () => app.tree.scaleX ?? 1

  const fit = () => {
    viewState = 'overview'
    app.tree.zoom('fit', 24)
    requestAnimationFrame(() => {
      syncAllHits()
      requestAnimationFrame(syncAllHits)
    })
  }

  app.on(RenderEvent.END, syncAllHits)
  requestAnimationFrame(() => fit())
  window.addEventListener('resize', () => fit())

  const zoomBy = (delta: number) => {
    if (delta > 0) app.tree.zoom('in')
    else app.tree.zoom('out')
    requestAnimationFrame(syncAllHits)
  }

  const rectToScreen = (rect: Rect): HotspotScreenRect | null => {
    const w = rect.width ?? 0
    const h = rect.height ?? 0
    if (!w || !h) return null
    const sx = app.tree.scaleX ?? 1
    const sy = app.tree.scaleY ?? sx
    const ox = app.tree.x ?? 0
    const oy = app.tree.y ?? 0
    const lx = rect.x ?? 0
    const ly = rect.y ?? 0
    const mountBox = mount.getBoundingClientRect()
    const width = w * sx
    const height = h * sy
    const left = mountBox.left + ox + lx * sx
    const top = mountBox.top + oy + ly * sy
    return {
      left,
      top,
      width,
      height,
      centerX: left + width / 2,
      centerY: top + height / 2,
    }
  }

  const getHotspotScreenRect = () => rectToScreen(assistantHit)

  const getAssistantScreenCenter = () => {
    const r = getHotspotScreenRect()
    return r ? { x: r.centerX, y: r.centerY } : null
  }

  const getRoomScreenCenter = (room: ClickableRoomId) => {
    const entry = roomHits.find((r) => r.id === room)
    if (!entry) return null
    const w = entry.rect.width ?? 0
    const h = entry.rect.height ?? 0
    const sx = app.tree.scaleX ?? 1
    const sy = app.tree.scaleY ?? sx
    const ox = app.tree.x ?? 0
    const oy = app.tree.y ?? 0
    const lx = (entry.rect.x ?? 0) + w / 2
    const ly = (entry.rect.y ?? 0) + h / 2
    const viewRect = mount.getBoundingClientRect()
    return { x: viewRect.left + ox + lx * sx, y: viewRect.top + oy + ly * sy }
  }

  const sampleWorldAtClient = (clientX: number, clientY: number) =>
    app.tree.getWorldPointByClient({ clientX, clientY })

  return {
    app,
    zoomBy,
    resetView: fit,
    goHome,
    focusRoom,
    lookTowardHome,
    getViewState: () => viewState,
    getHomeHitsVisibility,
    isLookHomeCapsuleVisible,
    getSceneRotation: () => content.rotation ?? 0,
    getHotspotScreenRect,
    getAssistantScreenCenter,
    getRoomScreenCenter,
    sampleWorldAtClient,
    getCameraScale,
    getTreeState: () => ({
      x: app.tree.x ?? 0,
      y: app.tree.y ?? 0,
      scale: app.tree.scaleX ?? 1,
    }),
    getMoveDragAnimate: () => app.config?.move?.dragAnimate,
    tapAtClient: handleSceneTap,
  }
}