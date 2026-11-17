import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'

const ARTIFACT_DIR = '/opt/cursor/artifacts'

test.describe('正式动效叠框（1920×1080）', () => {
  test.use({ viewport: { width: 1920, height: 1080 } })

  test('输出动效验收叠框', async ({ page }) => {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true })

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
      await page.screenshot({ path: file, fullPage: false })
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

    const tapRoom = async (room: 'app' | 'hr' | 'pantry') => {
      const c = await page.evaluate(
        (r) =>
          (window as unknown as { __getRoomScreenCenter?: (id: string) => { x: number; y: number } | null }).__getRoomScreenCenter?.(r),
        room,
      )
      expect(c).not.toBeNull()
      await page.evaluate(
        ({ x, y }) =>
          (window as unknown as { __sceneTapAtClient?: (a: number, b: number) => void }).__sceneTapAtClient?.(x, y),
        { x: c!.x, y: c!.y },
      )
      await page.waitForTimeout(400)
    }

    const clickCapsule = async () => {
      const box = await page.getByTestId('look-home-capsule').boundingBox()
      expect(box).not.toBeNull()
      await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2)
      await page.waitForTimeout(450)
    }

    await waitReady()
    await capture('fit-default')

    await tapRoom('app')
    await page.waitForTimeout(360)
    const hashAppSel = await capture('click-app-or-hr-selected')
    const first = page.getByTestId('app-project-item-0')
    await expect(first).toHaveClass(/panel-list__item--selected/)

    await waitReady()
    await tapRoom('pantry')
    await capture('click-pantry-mistakes')

    await waitReady()
    await tapRoom('hr')
    await expect(page.getByTestId('look-home-capsule')).toBeVisible()
    const hashCapsule = await capture('capsule-visible')

    await clickCapsule()
    await expect(page.getByTestId('look-home-capsule')).toBeHidden()
    await expect(page.getByTestId('panel-hr-projects')).toBeVisible()
    const hashAfterCapsule = await capture('after-capsule-click')
    expect(hashAfterCapsule).not.toBe(hashCapsule)

    await page.emulateMedia({ reducedMotion: 'reduce' })
    await waitReady()
    await tapRoom('hr')
    await expect(page.getByTestId('look-home-capsule')).toBeVisible()
  const capAnim = await page.getByTestId('look-home-capsule').evaluate((el) => getComputedStyle(el).animationName)
    expect(capAnim).toBe('none')
    await capture('reduced-motion')

    void hashAppSel
  })
})