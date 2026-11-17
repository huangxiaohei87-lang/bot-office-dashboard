import './styles.css'
import '@fontsource/noto-sans-sc/chinese-simplified-400.css'
import '@fontsource/noto-serif-sc/chinese-simplified-700.css'
import { createSceneCanvas, type SceneCanvas } from './scene-canvas'
import { createSidePanel, type SidePanelMode } from './side-panel'
import type { ClickableRoomId } from './scene-constants'

function renderShell(sidePanelRoot: HTMLElement): HTMLElement {
  const root = document.createElement('div')
  root.className = 'dashboard-shell'
  root.innerHTML = `
    <header class="dashboard-header">
      <h1 class="dashboard-title">可视化 Bot 协作管理后台</h1>
    </header>
    <div class="dashboard-main">
      <section class="scene-column" aria-label="办公室场景">
        <div class="scene-viewport-shell">
          <div class="scene-viewport" id="scene-viewport" data-testid="scene-viewport"></div>
          <div class="scene-toolbar" data-testid="scene-toolbar">
            <span>平移</span>
            <div class="zoom-group">
              <button type="button" id="btn-zoom-out" aria-label="缩小">−</button>
              <button type="button" id="btn-zoom-in" aria-label="放大">+</button>
              <button type="button" id="btn-zoom-reset" class="toolbar-fit">适应</button>
            </div>
            <span>画布可平移缩放，不可旋转</span>
          </div>
        </div>
      </section>
      <aside class="side-column" data-testid="side-column"></aside>
    </div>
  `
  root.querySelector('.side-column')!.appendChild(sidePanelRoot)
  return root
}

const sidePanel = createSidePanel()
const appEl = document.querySelector<HTMLDivElement>('#app')!
const shell = renderShell(sidePanel.root)
appEl.appendChild(shell)

const viewport = shell.querySelector<HTMLDivElement>('#scene-viewport')!

const panelForRoom = (room: ClickableRoomId): SidePanelMode => {
  if (room === 'app') return 'app-projects'
  if (room === 'hr') return 'hr-projects'
  if (room === 'pantry') return 'mistakes'
  return 'chat'
}

const scene: SceneCanvas = createSceneCanvas(viewport, {
  onAssistantFocus: () => sidePanel.focusChatInput(),
  onBossHome: () => sidePanel.setMode('chat'),
  onRoomFocus: (room) => sidePanel.setMode(panelForRoom(room)),
})

shell.querySelector('#btn-zoom-in')?.addEventListener('click', () => scene.zoomBy(0.12))
shell.querySelector('#btn-zoom-out')?.addEventListener('click', () => scene.zoomBy(-0.12))
shell.querySelector('#btn-zoom-reset')?.addEventListener('click', () => scene.resetView())

type SceneWindow = {
  __sceneRotation?: () => number
  __getAssistantScreenCenter?: () => { x: number; y: number } | null
  __getAssistantHotspotScreenRect?: () => ReturnType<SceneCanvas['getHotspotScreenRect']>
  __getCameraScale?: () => number
  __sampleWorldAtClient?: (x: number, y: number) => { x: number; y: number }
  __getSidePanelMode?: () => SidePanelMode
  __getSceneViewState?: () => string
  __getRoomScreenCenter?: (room: ClickableRoomId) => { x: number; y: number } | null
  __getTreeState?: () => { x: number; y: number; scale: number }
}

const w = window as unknown as SceneWindow
w.__sceneRotation = () => scene.getSceneRotation()
w.__getAssistantScreenCenter = () => scene.getAssistantScreenCenter()
w.__getAssistantHotspotScreenRect = () => scene.getHotspotScreenRect()
w.__getCameraScale = () => scene.getCameraScale()
w.__sampleWorldAtClient = (x, y) => scene.sampleWorldAtClient(x, y)
w.__getSidePanelMode = () => sidePanel.getMode()
w.__getSceneViewState = () => scene.getViewState()
w.__getRoomScreenCenter = (room) => scene.getRoomScreenCenter(room)
w.__getTreeState = () => scene.getTreeState()