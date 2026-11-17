import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'

const ARTIFACT_DIR = '/opt/cursor/artifacts'
const TMP_DIR = '/workspace/tmp/用户测试反馈叠框'

test.describe('用户测试反馈叠框（1920×1080）', () => {
  test.use({ viewport: { width: 1920, height: 1080 } })

  test('输出验收叠框', async ({ page }) => {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true })
    fs.mkdirSync(TMP_DIR, { recursive: true })

    const outlineHits = () =>
      page.evaluate(() => {
        document.querySelectorAll('[data-testid="assistant-scene-hit"], [data-testid^="room-hit-"]').forEach((el) => {
          ;(el as HTMLElement).style.outline = '3px solid #e85d5d'
        })
        const cap = document.querySelector('[data-testid="look-home-capsule"]') as HTMLElement | null
        if (cap && !cap.hidden) cap.style.outline = '3px solid #e85d5d'
      })

    const capture = async (name: string) => {
      await outlineHits()
      const file = path.join(ARTIFACT_DIR, `hotspot-overlay-${name}.png`)
      const tmp = path.join(TMP_DIR, `hotspot-overlay-${name}.png`)
      await page.screenshot({ path: file, fullPage: false })
      fs.copyFileSync(file, tmp)
      return createHash('sha256').update(fs.readFileSync(file)).digest('hex')
    }

    const waitReady = async () => {
      await page.goto('/')
      await page.getByTestId('scene-viewport').locator('canvas').first().waitFor({ timeout: 15_000 })
      await page.waitForFunction(() => {
        const r = (window as unknown as { __getAssistantHotspotScreenRect?: () => { width: number } | null })
          .__getAssistantHotspotScreenRect?.()
        return r && r.width > 80
      })
    }

    const roomCenter = async (room: 'app' | 'hr') => {
      const c = await page.evaluate(
        (r) =>
          (window as unknown as { __getRoomScreenCenter?: (id: string) => { x: number; y: number } | null }).__getRoomScreenCenter?.(r),
        room,
      )
      expect(c).not.toBeNull()
      return c!
    }

    await waitReady()
    const hashFit = await capture('fit-default')

    const appC = await roomCenter('app')
    await page.mouse.move(appC.x, appC.y)
    await page.mouse.down()
    await page.mouse.move(appC.x - 130, appC.y + 80, { steps: 12 })
    await page.mouse.up()
    await page.waitForTimeout(450)
    const hashPan = await capture('after-pan-on-app-room')
    expect(hashPan).not.toBe(hashFit)

    await page.mouse.move(appC.x, appC.y)
    await page.mouse.wheel(0, -420)
    await page.waitForTimeout(400)
    const hashWheel = await capture('after-wheel-on-room')
    expect(hashWheel).not.toBe(hashFit)

    await waitReady()
    const hrC = await roomCenter('hr')
    await page.mouse.click(hrC.x, hrC.y)
    await page.waitForTimeout(500)
    const hashHr = await capture('click-hr-projects')
    await expect(page.getByTestId('look-home-capsule')).toBeVisible()

    await waitReady()
    const input = page.getByTestId('chat-input')
    await input.fill('叠框验收：回车发送')
    await input.press('Enter')
    await page.waitForTimeout(200)
    const hashChat = await capture('chat-after-enter-send')
    expect(hashChat).not.toBe(hashHr)
    expect(hashChat).not.toBe(hashFit)
  })
})