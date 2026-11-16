import { App, Group, Image, Rect } from 'leafer-ui'
import { LayoutEvent, RenderEvent } from '@leafer/core'
import { ASSISTANT_HOTSPOT, SCENE_H, SCENE_W } from './scene-constants'

const SCENE_URL = `${import.meta.env.BASE_URL}assets/scene/ambient-07.png`

export interface HotspotScreenRect {
  left: number
  top: number
  width: number
  height: number
  centerX: number
  centerY: number
}

export interface SceneCanvas {
  app: App
  zoomBy: (delta: number) => void
  resetView: () => void
  getSceneRotation: () => number
  getHotspotScreenRect: () => HotspotScreenRect | null
  getAssistantScreenCenter: () => { x: number; y: number } | null
}

export function createSceneCanvas(
  mount: HTMLElement,
  onAssistantClick: () => void,
): SceneCanvas {
  const app = new App({
    view: mount,
    fill: '#101010',
    tree: { type: 'design' },
    wheel: {
      zoomMode: true,
      rotateSpeed: 0,
      preventDefault: true,
    },
    move: {
      drag: true,
      dragEmpty: true,
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
  })

  const assistantHit = new Rect({
    x: ASSISTANT_HOTSPOT.x,
    y: ASSISTANT_HOTSPOT.y,
    width: ASSISTANT_HOTSPOT.width,
    height: ASSISTANT_HOTSPOT.height,
    fill: 'rgba(0,0,0,0.01)',
    cursor: 'pointer',
    hittable: true,
    data: { testid: 'assistant-hotspot' },
  })

  const focusAssistant = () => onAssistantClick()
  assistantHit.on('click', focusAssistant)
  assistantHit.on('tap', focusAssistant)

  content.add(sceneImage)
  content.add(assistantHit)
  app.tree.add(content)

  const hitButton = document.createElement('button')
  hitButton.type = 'button'
  hitButton.className = 'assistant-scene-hit'
  hitButton.dataset.testid = 'assistant-scene-hit'
  hitButton.title = '点击助理'
  hitButton.setAttribute('aria-label', '点击场景中的助理')
  hitButton.addEventListener('click', (ev) => {
    ev.stopPropagation()
    focusAssistant()
  })
  mount.appendChild(hitButton)

  const mapWorldPointToView = (worldX: number, worldY: number) => {
    const mountBox = mount.getBoundingClientRect()
    const fitScale = Math.min(
      (mount.clientWidth - 48) / SCENE_W,
      (mount.clientHeight - 48) / SCENE_H,
    )
    const ox = (mount.clientWidth - SCENE_W * fitScale) / 2
    const oy = (mount.clientHeight - SCENE_H * fitScale) / 2
    let px = mountBox.left + ox + worldX * fitScale
    let py = mountBox.top + oy + worldY * fitScale
    for (let i = 0; i < 16; i++) {
      const mapped = app.tree.getWorldPointByClient({ clientX: px, clientY: py })
      const errX = worldX - mapped.x
      const errY = worldY - mapped.y
      if (Math.abs(errX) < 0.35 && Math.abs(errY) < 0.35) break
      px += errX * fitScale
      py += errY * fitScale
    }
    return { x: px - mountBox.left, y: py - mountBox.top }
  }

  const readHotspotViewBox = () => {
    assistantHit.updateLayout()
    const world = assistantHit.getLayoutBounds('box', 'world')
    const corners = [
      mapWorldPointToView(world.x, world.y),
      mapWorldPointToView(world.x + world.width, world.y),
      mapWorldPointToView(world.x + world.width, world.y + world.height),
      mapWorldPointToView(world.x, world.y + world.height),
    ]
    if (corners.length < 4) return null
    const xs = corners.map((c) => c.x!)
    const ys = corners.map((c) => c.y!)
    const left = Math.min(...xs)
    const top = Math.min(...ys)
    const right = Math.max(...xs)
    const bottom = Math.max(...ys)
    return { x: left, y: top, width: right - left, height: bottom - top }
  }

  const syncHitButton = () => {
    const view = readHotspotViewBox()
    if (!view || !view.width || !view.height) return
    hitButton.style.left = `${view.x}px`
    hitButton.style.top = `${view.y}px`
    hitButton.style.width = `${Math.max(24, view.width)}px`
    hitButton.style.height = `${Math.max(24, view.height)}px`
  }

  const fit = () => {
    app.tree.zoom('fit', 24)
    requestAnimationFrame(() => {
      syncHitButton()
      requestAnimationFrame(syncHitButton)
    })
  }

  app.on(RenderEvent.END, syncHitButton)
  app.tree.on(LayoutEvent.END, syncHitButton)
  requestAnimationFrame(() => fit())
  window.addEventListener('resize', () => fit())

  const zoomBy = (delta: number) => {
    if (delta > 0) app.tree.zoom('in')
    else app.tree.zoom('out')
    requestAnimationFrame(syncHitButton)
  }

  const getHotspotScreenRect = (): HotspotScreenRect | null => {
    const view = readHotspotViewBox()
    if (!view || !view.width || !view.height) return null
    const mountBox = mount.getBoundingClientRect()
    return {
      left: mountBox.left + view.x,
      top: mountBox.top + view.y,
      width: view.width,
      height: view.height,
      centerX: mountBox.left + view.x + view.width / 2,
      centerY: mountBox.top + view.y + view.height / 2,
    }
  }

  const getAssistantScreenCenter = () => {
    const r = getHotspotScreenRect()
    if (!r) return null
    return { x: r.centerX, y: r.centerY }
  }

  return {
    app,
    zoomBy,
    resetView: fit,
    getSceneRotation: () => content.rotation ?? 0,
    getHotspotScreenRect,
    getAssistantScreenCenter,
  }
}