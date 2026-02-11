import { expect, test } from '@playwright/test'

test('追加・削除の基本フロー', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByTestId('circle-chart')).toBeVisible()
  await page.getByTestId('add-activity-btn').click()

  await expect(page.getByTestId('add-dialog-title')).toHaveText('活動を追加')

  await page.getByTestId('select-category').selectOption('c-sleep')
  await page.getByTestId('input-start-hour').fill('0')
  await page.getByTestId('input-start-minute').fill('0')
  await page.getByTestId('input-duration').fill('60')
  await page.getByTestId('save-activity-btn').click()

  await expect(page.getByTestId('activity-list')).toContainText('睡眠')
  await expect(page.locator('[data-testid^="segment-"]')).toHaveCount(1)

  const deleteButton = page.locator('[data-testid^="delete-activity-"]')
  await deleteButton.first().click()
  await expect(page.getByTestId('delete-confirm-message')).toContainText('削除しますか')
  await page.getByTestId('confirm-delete-btn').click()

  await expect(page.getByTestId('empty-message')).toHaveText('活動が記録されていません')
})
