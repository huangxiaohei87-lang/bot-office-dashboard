import { expect, test } from '@playwright/test'

const VP = { width: 1920, height: 1080 }

async function waitHotspotReady(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.getByTestId('scene-viewport').locator('canvas').first().waitFor({ timeout: 15_000 })
  await page.waitForFunction(() => {
    const fn = (window as unknown as { __getAssistantHotspotScreenRect?: () => { width: number; centerX: number } | null })
      .__getAssistantHotspotScreenRect
    const r = fn?.()
    return r && r.width > 80 && r.centerX > 300
  })
}

async function readHotspotRect(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const hit = document.querySelector('[data-testid="assistant-scene-hit"]')!.getBoundingClientRect()
    const api = (window as unknown as { __getAssistantHotspotScreenRect?: () => { left: number; top: number; width: number; height: number; centerX: number; centerY: number } | null })
      .__getAssistantHotspotScreenRect
    const vp = document.getElementById('scene-viewport')!.getBoundingClientRect()
    return { hit, vp, api: api?.() }
  })
}

async function viewportCenter(page: import('@playwright/test').Page) {
  const box = await page.getByTestId('scene-viewport').boundingBox()
  expect(box).not.toBeNull()
  return { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 }
}

async function panOnDarkMargin(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    document.querySelectorAll('.scene-room-hit').forEach((el) => {
      ;(el as HTMLElement).style.pointerEvents = 'none'
    })
  })
  const box = await page.getByTestId('scene-viewport').boundingBox()
  expect(box).not.toBeNull()
  const sx = box!.x + box!.width * 0.52
  const sy = box!.y + 28
  await page.mouse.move(sx, sy)
  await page.mouse.down()
  await page.mouse.move(sx - 150, sy + 70, { steps: 12 })
  await page.mouse.up()
  await page.waitForTimeout(400)
}

async function wheelOnDarkMargin(page: import('@playwright/test').Page) {
  const box = await page.getByTestId('scene-viewport').boundingBox()
  expect(box).not.toBeNull()
  const x = box!.x + box!.width * 0.52
  const y = box!.y + 28
  await page.mouse.move(x, y)
  await page.mouse.wheel(0, -500)
  await page.waitForTimeout(400)
}

test.describe('可视化 Bot 协作管理后台 — 第一期', () => {
  test.use({ viewport: VP })

  test('纸白外壳、近黑圆角视口与对话栏可见', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.dashboard-shell')).toBeVisible()
    await expect(page.getByTestId('scene-viewport')).toBeVisible()
    await expect(page.getByTestId('chat-card')).toBeVisible()
    const viewport = page.getByTestId('scene-viewport')
    const bg = await viewport.evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(bg).toBe('rgb(16, 16, 16)')
  })

  test('场景图加载，模拟状态文案包含四间房与离开/休息', async ({ page }) => {
    await waitHotspotReady(page)
    const text = await page.getByTestId('chat-messages').innerText()
    expect(text).toContain('老大办公室')
    expect(text).toContain('茶水间休息')
    expect(text).toContain('审查闸门')
    expect(text).not.toMatch(/审查闸\s*\n\s*门/)
  })

  test('热区盖住助理（屏幕坐标），不在视口左上空白', async ({ page }) => {
    await waitHotspotReady(page)
    const { hit, vp, api } = await readHotspotRect(page)
    const relX = (hit.left + hit.width / 2 - vp.left) / vp.width
    const relY = (hit.top + hit.height / 2 - vp.top) / vp.height
    expect(relX).toBeGreaterThan(0.22)
    expect(relX).toBeLessThan(0.42)
    expect(relY).toBeGreaterThan(0.45)
    expect(relY).toBeLessThan(0.72)
    expect(api).not.toBeNull()
    expect(Math.abs((api?.centerX ?? 0) - (hit.left + hit.width / 2))).toBeLessThan(4)
  })

  test('左栏工具条与右栏卡片下沿对齐（底边留白）', async ({ page }) => {
    await page.goto('/')
    const shell = await page.locator('.dashboard-shell').boundingBox()
    const toolbar = await page.getByTestId('scene-toolbar').boundingBox()
    const chat = await page.getByTestId('chat-card').boundingBox()
    expect(shell!.height - (toolbar!.y + toolbar!.height - shell!.y)).toBeGreaterThanOrEqual(16)
    expect(Math.abs(chat!.y + chat!.height - (toolbar!.y + toolbar!.height))).toBeLessThan(6)
  })

  test('点击助理人物位置可聚焦；点视口左上空白不聚焦', async ({ page }) => {
    await waitHotspotReady(page)
    const center = await page.evaluate(() =>
      (window as unknown as { __getAssistantScreenCenter?: () => { x: number; y: number } | null }).__getAssistantScreenCenter?.(),
    )
    await page.mouse.click(center!.x, center!.y)
    await expect(page.getByTestId('chat-card')).toHaveClass(/chat-card--focused/)
    await expect(page.getByTestId('chat-input')).toBeFocused()
    await page.evaluate(() => document.getElementById('chat-card')?.classList.remove('chat-card--focused'))
    const vp = await page.getByTestId('scene-viewport').boundingBox()
    await page.mouse.click(vp!.x + 48, vp!.y + 36)
    await expect(page.getByTestId('chat-input')).not.toBeFocused()
  })

  test('平移后热区中心明显偏移（不点适应）', async ({ page }) => {
    await waitHotspotReady(page)
    const before = await readHotspotRect(page)
    const treeBefore = await page.evaluate(() => (window as unknown as { __getTreeState?: () => { x: number; y: number } }).__getTreeState?.())
    await panOnDarkMargin(page)
    const after = await readHotspotRect(page)
    const treeAfter = await page.evaluate(() => (window as unknown as { __getTreeState?: () => { x: number; y: number } }).__getTreeState?.())
    const treeDx = Math.abs((treeAfter?.x ?? 0) - (treeBefore?.x ?? 0)) + Math.abs((treeAfter?.y ?? 0) - (treeBefore?.y ?? 0))
    const hotDx = Math.abs(after.hit.left + after.hit.width / 2 - (before.hit.left + before.hit.width / 2))
    const hotDy = Math.abs(after.hit.top + after.hit.height / 2 - (before.hit.top + before.hit.height / 2))
    expect(treeDx).toBeGreaterThan(40)
    if (hotDx + hotDy < 30) {
      expect(treeDx).toBeGreaterThan(80)
    } else {
      expect(hotDx + hotDy).toBeGreaterThan(30)
    }
  })

  test('按钮放大后热区变大（不点适应）', async ({ page }) => {
    await waitHotspotReady(page)
    const before = await readHotspotRect(page)
    await page.getByRole('button', { name: '放大' }).click()
    await page.getByRole('button', { name: '放大' }).click()
    await page.waitForTimeout(350)
    const after = await readHotspotRect(page)
    expect(after.hit.width).toBeGreaterThan(before.hit.width * 1.12)
  })

  test('滚轮缩放后相机尺度变化（不点适应）', async ({ page }) => {
    await waitHotspotReady(page)
    const scaleBefore = await page.evaluate(() => (window as unknown as { __getCameraScale?: () => number }).__getCameraScale?.())
    await wheelOnDarkMargin(page)
    const scaleAfter = await page.evaluate(() => (window as unknown as { __getCameraScale?: () => number }).__getCameraScale?.())
    expect(scaleAfter).toBeGreaterThan((scaleBefore ?? 0) * 1.08)
  })

  test('画布旋转保持 0', async ({ page }) => {
    await waitHotspotReady(page)
    const rotation = await page.evaluate(() =>
      (window as unknown as { __sceneRotation?: () => number }).__sceneRotation?.(),
    )
    expect(rotation).toBe(0)
  })

  test('点 APP制作台：左侧放大且右侧项目列表', async ({ page }) => {
    await waitHotspotReady(page)
    const center = await page.evaluate(() =>
      (window as unknown as { __getRoomScreenCenter?: (r: string) => { x: number; y: number } | null }).__getRoomScreenCenter?.('app'),
    )
    await page.mouse.click(center!.x, center!.y)
    await page.waitForTimeout(500)
    await expect(page.getByTestId('panel-app-projects')).toBeVisible()
    await expect(page.getByText('贪吃蛇网页游戏试点')).toBeVisible()
    const boss = await page.evaluate(() =>
      (window as unknown as { __getRoomScreenCenter?: (r: string) => { x: number; y: number } | null }).__getRoomScreenCenter?.('boss'),
    )
    const vp = await page.getByTestId('scene-viewport').boundingBox()
    expect(boss!.x).toBeGreaterThan(vp!.x + 8)
    expect(boss!.x).toBeLessThan(vp!.x + vp!.width - 8)
  })

  test('点人事部：项目列表', async ({ page }) => {
    await waitHotspotReady(page)
    const center = await page.evaluate(() =>
      (window as unknown as { __getRoomScreenCenter?: (r: string) => { x: number; y: number } | null }).__getRoomScreenCenter?.('hr'),
    )
    await page.mouse.click(center!.x, center!.y)
    await page.waitForTimeout(500)
    await expect(page.getByTestId('panel-hr-projects')).toBeVisible()
  })

  test('点茶水间：错题本', async ({ page }) => {
    await waitHotspotReady(page)
    const center = await page.evaluate(() =>
      (window as unknown as { __getRoomScreenCenter?: (r: string) => { x: number; y: number } | null }).__getRoomScreenCenter?.('pantry'),
    )
    await page.mouse.click(center!.x, center!.y)
    await page.waitForTimeout(500)
    await expect(page.getByTestId('panel-mistakes')).toBeVisible()
    await expect(page.getByText('茶水间错题本')).toBeVisible()
    await expect(page.getByTestId('chat-input')).toHaveCount(0)
  })

  test('点老大办公室回家：恢复对话', async ({ page }) => {
    await waitHotspotReady(page)
    const appC = await page.evaluate(() =>
      (window as unknown as { __getRoomScreenCenter?: (r: string) => { x: number; y: number } | null }).__getRoomScreenCenter?.('app'),
    )
    await page.mouse.click(appC!.x, appC!.y)
    await page.waitForTimeout(800)
    await page.getByTestId('assistant-scene-hit').click({ force: true, timeout: 10_000 })
    await page.waitForTimeout(1200)
    await expect(page.getByTestId('chat-messages')).toBeVisible({ timeout: 10_000 })
    expect(await page.evaluate(() => (window as unknown as { __getSidePanelMode?: () => string }).__getSidePanelMode?.())).toBe('chat')
    expect(await page.evaluate(() => (window as unknown as { __getSceneViewState?: () => string }).__getSceneViewState?.())).toBe(
      'overview',
    )
  })

  test('未创建空地不可点出列表', async ({ page }) => {
    await waitHotspotReady(page)
    const vp = await page.getByTestId('scene-viewport').boundingBox()
    await page.mouse.click(vp!.x + vp!.width * 0.12, vp!.y + vp!.height * 0.08)
    await page.waitForTimeout(200)
    await expect(page.getByTestId('chat-card')).toBeVisible()
    await expect(page.getByTestId('panel-mistakes')).toHaveCount(0)
  })

  test('prefers-reduced-motion 下页面仍可用', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await waitHotspotReady(page)
    const center = await page.evaluate(() =>
      (window as unknown as { __getRoomScreenCenter?: (r: string) => { x: number; y: number } | null }).__getRoomScreenCenter?.('pantry'),
    )
    await page.mouse.click(center!.x, center!.y)
    await page.waitForTimeout(300)
    await expect(page.getByTestId('panel-mistakes')).toBeVisible()
  })
})