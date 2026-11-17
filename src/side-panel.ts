import {
  appProjects,
  chatMessages as seedChatMessages,
  hrProjects,
  pantryMistakeSummaries,
  pantryMistakes,
} from './mock-data'

type ChatMessage = { from: 'user' | 'assistant'; text: string | string[] }

const LOCAL_PREVIEW_REPLY = '这是页面内预览，不会转到真实助理对话。'
const PANEL_ENTER_MS = 320
const PANEL_EXIT_MS = 240

export type SidePanelMode = 'chat' | 'app-projects' | 'hr-projects' | 'mistakes'

export interface SidePanelHandles {
  root: HTMLElement
  setMode: (mode: SidePanelMode, opts?: { assistantFocused?: boolean }) => void
  focusChatInput: () => void
  getMode: () => SidePanelMode
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function renderMessages(container: HTMLElement, messages: ChatMessage[]) {
  container.replaceChildren()
  for (const msg of messages) {
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

function projectRows(items: { title: string; meta: string }[], testPrefix: string) {
  return items
    .map(
      (p, i) => `<li class="panel-list__item panel-list__item--reveal" data-testid="${testPrefix}-item-${i}" tabindex="0" role="button">
        <p class="panel-list__title">${p.title}</p><p class="panel-list__meta">${p.meta}</p>
        <span class="panel-list__selected-label">已选中</span></li>`,
    )
    .join('')
}

function bindProjectListSelection(container: ParentNode) {
  const items = container.querySelectorAll<HTMLElement>('.panel-list__item')
  if (!items.length) return
  const select = (target: HTMLElement) => {
    items.forEach((li) => li.classList.remove('panel-list__item--selected'))
    target.classList.add('panel-list__item--selected')
  }
  select(items[0]!)
  items.forEach((li) => {
    li.addEventListener('click', () => select(li))
    li.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault()
        select(li)
      }
    })
  })
}

export function createSidePanel(): SidePanelHandles {
  let mode: SidePanelMode = 'chat'
  let assistantFocused = false
  let hasShownPanel = false
  let animToken = 0
  const messages: ChatMessage[] = seedChatMessages.map((m) => ({ ...m, text: m.text }))
  const root = document.createElement('div')
  root.className = 'side-panel'
  root.dataset.testid = 'side-panel'
  root.innerHTML = `<div class="side-panel__inner" id="side-panel-inner" data-testid="side-panel-inner"></div>`
  const inner = root.querySelector('#side-panel-inner')! as HTMLElement

  const mountEnterAnimation = () => {
    inner.classList.remove('side-panel__inner--exiting')
    if (prefersReducedMotion()) {
      inner.classList.remove('side-panel__inner--entering')
      inner.removeAttribute('data-panel-entering')
      return
    }
    inner.dataset.panelEntering = 'true'
    inner.classList.add('side-panel__inner--entering')
    window.setTimeout(() => {
      inner.classList.remove('side-panel__inner--entering')
      inner.removeAttribute('data-panel-entering')
    }, PANEL_ENTER_MS + 40)
  }

  const renderChat = () => {
    inner.className = 'side-panel__inner chat-card'
    inner.id = 'chat-card'
    inner.dataset.testid = 'chat-card'
    inner.dataset.panelShell = 'side-panel-inner'
    const sub = assistantFocused ? '已聚焦，不会另外弹出聊天窗' : '常驻 · 点击场景中的助理会回到这里'
    inner.innerHTML = `
      <div class="chat-card__head"><div class="chat-card__head-row">
        <span class="avatar-block" aria-hidden="true">助</span>
        <div><h2 class="panel-title">与助理的对话</h2><p class="panel-sub">${sub}</p></div>
      </div></div>
      <div class="chat-messages" id="chat-messages" data-testid="chat-messages"></div>
      <div class="chat-input-wrap">
        <input class="chat-input" id="chat-input" data-testid="chat-input" type="text" placeholder="给助理发消息…" autocomplete="off" />
      </div>`
    const messagesEl = inner.querySelector('#chat-messages') as HTMLElement
    renderMessages(messagesEl, messages)
    const input = inner.querySelector('#chat-input') as HTMLInputElement
    const sendFromInput = () => {
      const text = input.value.trim()
      if (!text) return
      messages.push({ from: 'user', text })
      input.value = ''
      renderMessages(messagesEl, messages)
      messages.push({ from: 'assistant', text: LOCAL_PREVIEW_REPLY })
      renderMessages(messagesEl, messages)
      input.focus({ preventScroll: true })
    }
    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault()
        sendFromInput()
      }
    })
  }

  const renderProjects = (which: 'app' | 'hr') => {
    const title = which === 'app' ? 'APP制作台做过的项目' : '人事部做过的项目'
    const prefix = which === 'app' ? 'app-project' : 'hr-project'
    inner.className = 'side-panel__inner list-card'
    inner.removeAttribute('id')
    inner.dataset.testid = which === 'app' ? 'panel-app-projects' : 'panel-hr-projects'
    inner.dataset.panelShell = 'side-panel-inner'
    inner.innerHTML = `
      <div class="list-card__head"><h2 class="panel-title">${title}</h2>
      <p class="panel-sub">示例数据 · 第一期本地示例 · 非真实接口</p></div>
      <ul class="panel-list">${projectRows(which === 'app' ? appProjects : hrProjects, prefix)}</ul>
      <p class="panel-footnote">本列表为方案示例，不是真实项目接口，也不是多会话列表。</p>`
    bindProjectListSelection(inner)
  }

  const renderMistakes = () => {
    inner.className = 'side-panel__inner list-card'
    inner.removeAttribute('id')
    inner.dataset.testid = 'panel-mistakes'
    inner.dataset.panelShell = 'side-panel-inner'
    const summaries = pantryMistakeSummaries
      .map(
        (s, i) =>
          `<div class="mistake-summary panel-list__item--reveal" data-testid="mistake-summary-${i}"><p class="panel-list__meta">${s.label}</p><p class="panel-list__title">${s.body}</p></div>`,
      )
      .join('')
    const rows = pantryMistakes
      .map(
        (m, i) => `<li class="panel-list__item panel-list__item--mistake panel-list__item--reveal" data-testid="mistake-item-${i}"><span class="avatar-block avatar-block--soft">${m.icon}</span>
        <div><p class="panel-list__title">${m.title}</p><p class="panel-list__meta">${m.meta}</p></div></li>`,
      )
      .join('')
    inner.innerHTML = `
      <div class="list-card__head"><h2 class="panel-title">茶水间错题本</h2>
      <p class="panel-sub">示例 · 从 2026-11-17 起记 · 不是已记入的真实错题</p></div>
      <div class="mistake-summaries">${summaries}</div>
      <ul class="panel-list panel-list--mistakes">${rows}</ul>`
  }

  const swapPanel = (next: SidePanelMode, opts?: { assistantFocused?: boolean }) => {
    mode = next
    if (opts?.assistantFocused !== undefined) assistantFocused = opts.assistantFocused
    inner.classList.remove('chat-card--focused')
    if (next === 'chat') renderChat()
    else if (next === 'app-projects') renderProjects('app')
    else if (next === 'hr-projects') renderProjects('hr')
    else renderMistakes()
    mountEnterAnimation()
  }

  const setMode = (next: SidePanelMode, opts?: { assistantFocused?: boolean }) => {
    if (next === mode && opts?.assistantFocused === undefined) {
      if (next === 'chat') renderChat()
      return
    }
    const token = ++animToken
    const reduced = prefersReducedMotion()

    if (!hasShownPanel) {
      hasShownPanel = true
      swapPanel(next, opts)
      return
    }

    if (reduced) {
      swapPanel(next, opts)
      return
    }

    inner.classList.add('side-panel__inner--exiting')
    window.setTimeout(() => {
      if (token !== animToken) return
      swapPanel(next, opts)
    }, PANEL_EXIT_MS)
  }

  const focusChatInput = () => {
    if (mode !== 'chat') setMode('chat', { assistantFocused: true })
    else {
      assistantFocused = true
      const sub = inner.querySelector('.panel-sub')
      if (sub) sub.textContent = '已聚焦，不会另外弹出聊天窗'
    }
    inner.classList.add('chat-card--focused')
    ;(inner.querySelector('#chat-input') as HTMLInputElement | null)?.focus({ preventScroll: true })
  }

  setMode('chat')
  return { root, setMode, focusChatInput, getMode: () => mode }
}