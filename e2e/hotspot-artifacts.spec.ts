import { test } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const ARTIFACT_DIR = '/opt/cursor/artifacts'

test.describe('热区叠框截图（1920×1080）', () => {
  test.use({ viewport: { width: 1920, height: 1080 } })

  test('输出 fit / 平移 / 缩放 三张叠框图', async ({ page }) => {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true })

    const capture = async (name: string) => {
      await page.evaluate(() => {
        const hit = document.querySelector('[data-testid="assistant-scene-hit"]') as HTMLElement | null
        if (hit) hit.style.outline = '3px solid #e85d5d'
      })
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `hotspot-overlay-${name}.png`),
        fullPage: false,
      })
    }

    await page.goto('/')
    await page.getByTestId('scene-viewport').locator('canvas').first().waitFor({ timeout: 15_000 })
    await page.waitForFunction(() => {
      const r = (window as unknown as { __getAssistantHotspotScreenRect?: () => { width: number } | null })
        .__getAssistantHotspotScreenRect?.()
      return r && r.width > 80
    })
    await capture('fit-default')

    const box = await page.getByTestId('scene-viewport').boundingBox()
    if (box) {
      const cx = box.x + box.width / 2
      const cy = box.y + box.height / 2
      await page.mouse.move(cx, cy)
      await page.mouse.down()
      await page.mouse.move(cx + 120, cy + 60, { steps: 10 })
      await page.mouse.up()
    }
    await page.waitForTimeout(250)
    await capture('after-pan')

    await page.getByRole('button', { name: '放大' }).click()
    await page.getByRole('button', { name: '放大' }).click()
    await page.waitForTimeout(250)
    await capture('after-zoom-in')
  })
})