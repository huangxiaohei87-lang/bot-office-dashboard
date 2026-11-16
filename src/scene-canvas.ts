import { App, Group, Image, Rect } from 'leafer-ui'
import { RenderEvent } from '@leafer/core'
import { ASSISTANT_HOTSPOT, SCENE_H, SCENE_W } from './scene-constants'

const SCENE_URL = `${import.meta.env.BASE_URL}assets/scene/ambient-07.png`

export interface SceneCanvas {
  app: App
  zoomBy: (delta: number) => void
  resetView: () => void
  getSceneRotation: () => number
  getAssistantScreenCenter: () => { x: number; y: number } | null
  getHotspotSceneCenter: () => { x: number; y: number }
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
  assistantHit.on('pointer.up', (e) => {
    if (e.target === assistantHit && (e as { button?: number }).button !== 2) focusAssistant()
  })

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

  const syncHitButton = () => {
    const w = assistantHit.width ?? 200
    const h = assistantHit.height ?? 160
    const tlWorld = assistantHit.getWorldPointByLocal({ x: 0, y: 0 })
    const brWorld = assistantHit.getWorldPointByLocal({ x: w, y: h })
    const tl = app.tree.getClientPointByWorld(tlWorld)
    const br = app.tree.getClientPointByWorld(brWorld)
    const width = Math.max(24, br.x - tl.x)
    const height = Math.max(24, br.y - tl.y)
    hitButton.style.left = `${tl.x}px`
    hitButton.style.top = `${tl.y}px`
    hitButton.style.width = `${width}px`
    hitButton.style.height = `${height}px`
  }

  const fit = () => {
    app.tree.zoom('fit', 24)
    requestAnimationFrame(syncHitButton)
  }

  app.on(RenderEvent.END, syncHitButton)
  requestAnimationFrame(() => fit())
  window.addEventListener('resize', () => fit())

  const zoomBy = (delta: number) => {
    if (delta > 0) app.tree.zoom('in')
    else app.tree.zoom('out')
  }

  const getAssistantScreenCenter = () => {
    const w = assistantHit.width ?? 200
    const h = assistantHit.height ?? 160
    const world = assistantHit.getWorldPointByLocal({ x: w / 2, y: h / 2 })
    const client = app.tree.getClientPointByWorld(world)
    const viewRect = mount.getBoundingClientRect()
    const x = viewRect.left + client.x
    const y = viewRect.top + client.y
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null
    return { x, y }
  }

  const getHotspotSceneCenter = () => ({
    x: ASSISTANT_HOTSPOT.x + ASSISTANT_HOTSPOT.width / 2,
    y: ASSISTANT_HOTSPOT.y + ASSISTANT_HOTSPOT.height / 2,
  })

  return {
    app,
    zoomBy,
    resetView: fit,
    getSceneRotation: () => content.rotation ?? 0,
    getAssistantScreenCenter,
    getHotspotSceneCenter,
  }
}