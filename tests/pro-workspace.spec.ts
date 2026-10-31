import { test, expect } from '@playwright/test';
test('coverage changes positions, annotations and the recommended outcome', async ({ page }) => {
    await page.goto('/');
    const timeline = page.getByRole('slider', { name: '播放時間', exact: true });
    await timeline.fill('6');
    const drop = await page.locator('[data-player=d5]').getAttribute('transform');
    for (const coverage of ['Switch', 'Hedge', 'Blitz']) {
        await page.getByRole('button', { name: coverage, exact: true }).click();
        await expect(timeline).toHaveValue('0');
        await expect(page.locator('.court')).toHaveAttribute('data-coverage', coverage);
        await timeline.fill('6');
        expect(await page.locator('[data-player=d5]').getAttribute('transform')).not.toBe(drop);
        await expect(page.locator('.tactic-callout')).not.toHaveCount(0);
    }
    await expect(page.getByRole('button', { name: 'Kick-out', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await timeline.fill('7.2');
    await expect(page.locator('.basketball')).toHaveAttribute('data-handler', 'o3');
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: 'tests/advanced-action.png', fullPage: true });
});
test('frame stepping, custom speed, pause and looping use the shared timeline', async ({ page }) => {
    await page.goto('/');
    const slider = page.getByRole('slider', { name: '播放時間', exact: true });
    await page.getByRole('button', { name: '逐格前進', exact: true }).click();
    expect(+await slider.inputValue()).toBeCloseTo(1 / 60);
    await page.getByRole('button', { name: '逐格後退', exact: true }).click();
    expect(+await slider.inputValue()).toBe(0);
    await page.getByLabel('自訂倍速', { exact: true }).fill('1.7');
    await expect(page.getByLabel('播放速度', { exact: true })).toHaveValue('1.7');
    await slider.fill('11.9');
    await page.getByRole('button', { name: '循環播放', exact: true }).click();
    await page.getByRole('button', { name: '播放', exact: true }).click();
    await page.waitForTimeout(350);
    await page.getByRole('button', { name: '暫停', exact: true }).click();
    const at = await slider.inputValue();
    expect(+at).toBeLessThan(3);
    await page.waitForTimeout(120);
    await expect(slider).toHaveValue(at);
});
test('view changes preserve world positions and both panels can collapse', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('slider', { name: '播放時間', exact: true }).fill('6');
    const player = page.locator('[data-player=o1]');
    const x = await player.getAttribute('data-x'), y = await player.getAttribute('data-y');
    for (const name of ['木地板', '斜角視圖', '攝影機跟隨', '重點聚焦'])
        await page.getByRole('button', { name, exact: true }).click();
    await page.getByRole('slider', { name: '球場縮放', exact: true }).fill('1.35');
    await expect(player).toHaveAttribute('data-x', x!);
    await expect(player).toHaveAttribute('data-y', y!);
    await page.getByRole('button', { name: '收合戰術資料庫' }).click();
    await expect(page.locator('.sidebar')).toBeHidden();
    await page.getByRole('button', { name: '展開戰術資料庫' }).click();
    await page.getByRole('button', { name: '收合分析面板' }).click();
    await expect(page.locator('.analysis-panel')).toBeHidden();
    await page.getByRole('button', { name: '展開分析面板' }).click();
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(player).toHaveAttribute('data-x', x!);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(768);
});
test('flipped, zoomed editor converts pointer coordinates back to court feet', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '建立自訂戰術', exact: true }).click();
    await page.getByRole('slider', { name: '球場縮放', exact: true }).fill('1.3');
    await page.getByRole('button', { name: '切換進攻方向', exact: true }).click();
    await page.waitForTimeout(500);
    const player = page.locator('[data-player=o1]'), before = +(await player.getAttribute('data-x'))!, box = await player.boundingBox();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width / 2 + 30, box!.y + box!.height / 2, { steps: 6 });
    await page.mouse.up();
    expect(+(await player.getAttribute('data-x'))!).toBeLessThan(before);
    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    await expect(player).toHaveAttribute('data-x', before.toFixed(4));
});
test('comparison uses unique SVG definitions and can reach the longer right timeline', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Give and Go 傳切配合' }).click();
    await page.getByRole('button', { name: '戰術比較', exact: true }).click();
    await page.getByLabel('比較戰術').selectOption('pnr');
    const slider = page.getByRole('slider', { name: '播放時間', exact: true });
    await expect(slider).toHaveAttribute('max', '12');
    await slider.fill('11');
    const ids = await page.locator('svg.court [id]').evaluateAll(nodes => nodes.map(n => n.id));
    expect(new Set(ids).size).toBe(ids.length);
});
