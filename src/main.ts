import './styles.css'
import '@fontsource/noto-sans-sc/chinese-simplified-400.css'
import '@fontsource/noto-serif-sc/chinese-simplified-600.css'
import { chatMessages } from './mock-data'
import { createSceneCanvas } from './scene-canvas'

function renderShell(): HTMLElement {
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
      <aside class="chat-column">
        <div class="chat-card" id="chat-card" data-testid="chat-card">
          <div class="chat-card__head">
            <div class="chat-card__head-row">
              <span class="avatar-block" aria-hidden="true">助</span>
              <div>
                <h2 class="chat-card__title">与助理的对话</h2>
                <p class="chat-card__sub">常驻 · 点击场景中的助理会回到这里</p>
              </div>
            </div>
          </div>
          <div class="chat-messages" id="chat-messages" data-testid="chat-messages"></div>
          <div class="chat-input-wrap">
            <label class="visually-hidden" for="chat-input">给助理发消息</label>
            <input
              class="chat-input"
              id="chat-input"
              data-testid="chat-input"
              type="text"
              placeholder="给助理发消息…"
              autocomplete="off"
            />
          </div>
        </div>
      </aside>
    </div>
  `
  return root
}

function renderMessages(container: HTMLElement) {
  container.replaceChildren()
  for (const msg of chatMessages) {
    const row = document.createElement('div')
    row.className = `msg-row${msg.from === 'user' ? ' msg-row--user' : ''}`

    const avatar = document.createElement('span')
    avatar.className = 'avatar-block'
    avatar.textContent = msg.from === 'user' ? '我' : '助'

    const bubble = document.createElement('div')
    bubble.className = `msg-bubble msg-bubble--${msg.from === 'user' ? 'user' : 'assistant'}`

    if (Array.isArray(msg.text)) {
      for (const line of msg.text) {
        const p = document.createElement('p')
        if (line.includes('审查闸门')) {
          p.innerHTML = line.replaceAll('审查闸门', '<span class="phrase-nowrap">审查闸门</span>')
        } else {
          p.textContent = line
        }
        bubble.appendChild(p)
      }
    } else {
      bubble.textContent = msg.text
    }

    row.append(avatar, bubble)
    container.appendChild(row)
  }
}

function focusChat(chatCard: HTMLElement, chatInput: HTMLInputElement) {
  chatCard.classList.add('chat-card--focused')
  chatInput.focus({ preventScroll: true })
  chatCard.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
}

const appEl = document.querySelector<HTMLDivElement>('#app')!
const shell = renderShell()
appEl.appendChild(shell)

const messagesEl = shell.querySelector<HTMLDivElement>('#chat-messages')!
renderMessages(messagesEl)

const chatCard = shell.querySelector<HTMLDivElement>('#chat-card')!
const chatInput = shell.querySelector<HTMLInputElement>('#chat-input')!
const viewport = shell.querySelector<HTMLDivElement>('#scene-viewport')!

const scene = createSceneCanvas(viewport, () => focusChat(chatCard, chatInput))

shell.querySelector('#btn-zoom-in')?.addEventListener('click', () => scene.zoomBy(0.12))
shell.querySelector('#btn-zoom-out')?.addEventListener('click', () => scene.zoomBy(-0.12))
shell.querySelector('#btn-zoom-reset')?.addEventListener('click', () => scene.resetView())

;(window as unknown as {
  __sceneRotation?: () => number
  __getAssistantScreenCenter?: () => { x: number; y: number } | null
  __getAssistantHotspotScreenRect?: () => {
    left: number
    top: number
    width: number
    height: number
    centerX: number
    centerY: number
  } | null
}).__sceneRotation = () => scene.getSceneRotation()
;(window as unknown as { __getAssistantScreenCenter?: () => { x: number; y: number } | null }).__getAssistantScreenCenter =
  () => scene.getAssistantScreenCenter()
;(window as unknown as { __getAssistantHotspotScreenRect?: () => ReturnType<typeof scene.getHotspotScreenRect> })
  .__getAssistantHotspotScreenRect = () => scene.getHotspotScreenRect()