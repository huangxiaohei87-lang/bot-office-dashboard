import { expect, test } from '@playwright/test'

test.describe('可视化 Bot 协作管理后台 — 第一期烟雾', () => {
  test('纸白外壳、近黑圆角视口与对话栏可见', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.dashboard-shell')).toBeVisible()
    await expect(page.getByTestId('scene-viewport')).toBeVisible()
    await expect(page.getByTestId('chat-card')).toBeVisible()
    await expect(page.locator('.dashboard-title')).toHaveText('可视化 Bot 协作管理后台')

    const viewport = page.getByTestId('scene-viewport')
    const bg = await viewport.evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(bg).toBe('rgb(16, 16, 16)')
  })

  test('场景图加载，模拟状态文案包含四间房与离开/休息', async ({ page }) => {
    await page.goto('/')
    const imgOk = await page
      .getByTestId('scene-viewport')
      .locator('canvas')
      .first()
      .waitFor({ state: 'visible', timeout: 15_000 })
    expect(imgOk).toBeUndefined()

    const text = await page.getByTestId('chat-messages').innerText()
    expect(text).toContain('老大办公室')
    expect(text).toContain('APP制作台')
    expect(text).toContain('茶水间休息')
    expect(text).toContain('离开状态')
    expect(text).toContain('人事部')
  })

  test('可平移、可缩放，场景旋转保持 0', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('scene-viewport').locator('canvas').first().waitFor({ timeout: 15_000 })

    const vp = page.getByTestId('scene-viewport')
    const box = await vp.boundingBox()
    expect(box).not.toBeNull()
    const cx = box!.x + box!.width / 2
    const cy = box!.y + box!.height / 2

    await page.mouse.move(cx, cy)
    await page.mouse.down()
    await page.mouse.move(cx + 80, cy + 40, { steps: 8 })
    await page.mouse.up()

    await page.getByRole('button', { name: '放大' }).click()
    await page.getByRole('button', { name: '缩小' }).click()

    const rotation = await page.evaluate(() =>
      (window as unknown as { __sceneRotation?: () => number }).__sceneRotation?.(),
    )
    expect(rotation).toBe(0)
  })

  test('点击助理热区聚焦右侧对话，不另开窗口', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('scene-viewport').locator('canvas').first().waitFor({ timeout: 15_000 })

    const pagesBefore = page.context().pages().length
    await page.getByTestId('assistant-scene-hit').waitFor({ state: 'visible', timeout: 10_000 })
    await page.getByTestId('assistant-scene-hit').click()

    await expect(page.getByTestId('chat-card')).toHaveClass(/chat-card--focused/)
    await expect(page.getByTestId('chat-input')).toBeFocused()
    expect(page.context().pages().length).toBe(pagesBefore)
  })
})