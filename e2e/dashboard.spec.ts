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

test.describe('可视化 Bot 协作管理后台 — 第一期烟雾', () => {
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

    expect(hit.left).toBeGreaterThan(vp.left + vp.width * 0.18)
    expect(hit.top).toBeGreaterThan(vp.top + vp.height * 0.38)
    expect(api).not.toBeNull()
    expect(Math.abs((api?.centerX ?? 0) - (hit.left + hit.width / 2))).toBeLessThan(2)
  })

  test('左栏工具条与右栏卡片下沿对齐（底边留白）', async ({ page }) => {
    await page.goto('/')
    const shell = await page.locator('.dashboard-shell').boundingBox()
    const toolbar = await page.getByTestId('scene-toolbar').boundingBox()
    const chat = await page.getByTestId('chat-card').boundingBox()
    expect(shell).not.toBeNull()
    expect(toolbar).not.toBeNull()
    expect(chat).not.toBeNull()
    expect(shell!.height - (toolbar!.y + toolbar!.height - shell!.y)).toBeGreaterThanOrEqual(16)
    expect(Math.abs(chat!.y + chat!.height - (toolbar!.y + toolbar!.height))).toBeLessThan(4)
  })

  test('点击助理人物位置可聚焦；点视口左上空白不聚焦', async ({ page }) => {
    await waitHotspotReady(page)
    const center = await page.evaluate(() =>
      (window as unknown as { __getAssistantScreenCenter?: () => { x: number; y: number } | null }).__getAssistantScreenCenter?.(),
    )
    expect(center).not.toBeNull()

    await page.mouse.click(center!.x, center!.y)
    await expect(page.getByTestId('chat-card')).toHaveClass(/chat-card--focused/)
    await expect(page.getByTestId('chat-input')).toBeFocused()

    await page.evaluate(() => document.getElementById('chat-card')?.classList.remove('chat-card--focused'))
    await page.evaluate(() => (document.getElementById('chat-input') as HTMLInputElement)?.blur())

    const vp = await page.getByTestId('scene-viewport').boundingBox()
    expect(vp).not.toBeNull()
    await page.mouse.click(vp!.x + 48, vp!.y + 36)
    await expect(page.getByTestId('chat-card')).not.toHaveClass(/chat-card--focused/)
    await expect(page.getByTestId('chat-input')).not.toBeFocused()
  })

  test('平移、缩放、fit 后热区仍跟随助理', async ({ page }) => {
    await waitHotspotReady(page)
    const vp = page.getByTestId('scene-viewport')
    const box = await vp.boundingBox()
    expect(box).not.toBeNull()
    const cx = box!.x + box!.width / 2
    const cy = box!.y + box!.height / 2

    await page.mouse.move(cx, cy)
    await page.mouse.down()
    await page.mouse.move(cx + 90, cy + 50, { steps: 8 })
    await page.mouse.up()
    await page.getByRole('button', { name: '放大' }).click()
    await page.getByRole('button', { name: '缩小' }).click()
    await page.getByRole('button', { name: '适应' }).click()
    await page.waitForTimeout(200)

    const { hit, vp: vpBox } = await readHotspotRect(page)
    const relX = (hit.left + hit.width / 2 - vpBox.left) / vpBox.width
    const relY = (hit.top + hit.height / 2 - vpBox.top) / vpBox.height
    expect(relX).toBeGreaterThan(0.22)
    expect(relY).toBeGreaterThan(0.45)

    const center = await page.evaluate(() =>
      (window as unknown as { __getAssistantScreenCenter?: () => { x: number; y: number } | null }).__getAssistantScreenCenter?.(),
    )
    await page.mouse.click(center!.x, center!.y)
    await expect(page.getByTestId('chat-input')).toBeFocused()
  })

  test('画布旋转保持 0', async ({ page }) => {
    await waitHotspotReady(page)
    const rotation = await page.evaluate(() =>
      (window as unknown as { __sceneRotation?: () => number }).__sceneRotation?.(),
    )
    expect(rotation).toBe(0)
  })
})