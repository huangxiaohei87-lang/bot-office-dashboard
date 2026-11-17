import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'

const ARTIFACT_DIR = '/opt/cursor/artifacts'

test.describe('热区叠框截图（1920×1080）', () => {
  test.use({ viewport: { width: 1920, height: 1080 } })

  test('输出验收叠框与镜头变化证据', async ({ page }) => {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true })

    const outlineHits = () =>
      page.evaluate(() => {
        document.querySelectorAll('[data-testid="assistant-scene-hit"], [data-testid^="room-hit-"]').forEach((el) => {
          ;(el as HTMLElement).style.outline = '3px solid #e85d5d'
        })
      })

    const capture = async (name: string) => {
      await outlineHits()
      const file = path.join(ARTIFACT_DIR, `hotspot-overlay-${name}.png`)
      await page.screenshot({ path: file, fullPage: false })
      return createHash('sha256').update(fs.readFileSync(file)).digest('hex')
    }

    await page.goto('/')
    await page.getByTestId('scene-viewport').locator('canvas').first().waitFor({ timeout: 15_000 })
    await page.waitForFunction(() => {
      const r = (window as unknown as { __getAssistantHotspotScreenRect?: () => { width: number } | null })
        .__getAssistantHotspotScreenRect?.()
      return r && r.width > 80
    })

    const hashFit = await capture('fit-default')

    const box = await page.getByTestId('scene-viewport').boundingBox()
    expect(box).not.toBeNull()
    await page.evaluate(() => {
      document.querySelectorAll('.scene-room-hit').forEach((el) => {
        ;(el as HTMLElement).style.pointerEvents = 'none'
      })
    })
    const sx = box!.x + box!.width * 0.52
    const sy = box!.y + 28
    await page.mouse.move(sx, sy)
    await page.mouse.down()
    await page.mouse.move(sx - 150, sy + 70, { steps: 12 })
    await page.mouse.up()
    await page.waitForTimeout(400)
    const hashPan = await capture('after-pan')
    expect(hashPan).not.toBe(hashFit)

    await page.getByRole('button', { name: '放大' }).click()
    await page.getByRole('button', { name: '放大' }).click()
    await page.waitForTimeout(350)
    const hashZoom = await capture('after-zoom-in')
    expect(hashZoom).not.toBe(hashFit)

    await page.mouse.move(box!.x + box!.width * 0.52, box!.y + 28)
    await page.mouse.wheel(0, -360)
    await page.waitForTimeout(350)
    const hashWheel = await capture('after-wheel-zoom')
    expect(hashWheel).not.toBe(hashFit)

    const clickRoom = async (room: 'app' | 'hr' | 'pantry' | 'boss') => {
      const c = await page.evaluate(
        (r) =>
          (window as unknown as { __getRoomScreenCenter?: (id: string) => { x: number; y: number } | null }).__getRoomScreenCenter?.(r),
        room,
      )
      expect(c).not.toBeNull()
      await page.mouse.click(c!.x, c!.y)
      await page.waitForTimeout(500)
    }

    await page.reload()
    await page.waitForTimeout(800)
    await clickRoom('app')
    await capture('click-app-projects')

    await page.reload()
    await page.waitForTimeout(800)
    await clickRoom('hr')
    await capture('click-hr-projects')

    await page.reload()
    await page.waitForTimeout(800)
    await clickRoom('pantry')
    await capture('click-pantry-mistakes')

    await clickRoom('boss')
    await capture('click-boss-home-chat')
  })
})