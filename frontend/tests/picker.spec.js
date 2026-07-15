import { test, expect } from '@playwright/test'

// Trip picker: structured From/To/date search shown under the greeting.

test('trip picker searches with clean values', async ({ page }) => {
  await page.goto('/#/app')
  const picker = page.getByTestId('trip-picker')
  await expect(picker).toBeVisible()

  await picker.getByLabel('From city').selectOption('Delhi')
  // From=Delhi must be disabled in the To select
  await expect(picker.getByLabel('To city').locator('option[value="Delhi"]')).toBeDisabled()
  await picker.getByLabel('To city').selectOption('Mumbai')
  const date = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10)
  await picker.getByLabel('Travel date').fill(date)

  const reply = page.waitForResponse(r => r.url().includes('/chat') && r.status() === 200, { timeout: 180000 })
  await picker.getByRole('button', { name: 'Search' }).click()
  await expect(page.getByText(`Find flights from Delhi to Mumbai on ${date}`)).toBeVisible()
  await expect(picker).not.toBeVisible()
  await reply
  await expect(page.getByTestId('offer-card').first()).toBeVisible()

  // Widget booking flow: select → passenger form → confirm button → confirmed
  const selectReply = page.waitForResponse(r => r.url().includes('/chat') && r.status() === 200, { timeout: 180000 })
  await page.getByTestId('offer-card').first().getByRole('button', { name: 'Select' }).click()
  await selectReply

  const form = page.getByTestId('passenger-form')
  await expect(form).toBeVisible()
  await form.getByLabel('Passenger full name').fill('Akbar Ali')
  await form.getByLabel('Passenger email').fill('akbar@example.com')
  const detailsReply = page.waitForResponse(r => r.url().includes('/chat') && r.status() === 200, { timeout: 180000 })
  await form.getByRole('button', { name: 'Continue' }).click()
  await detailsReply

  const confirmReply = page.waitForResponse(r => r.url().includes('/chat') && r.status() === 200, { timeout: 180000 })
  await page.getByTestId('confirm-booking').click()
  await confirmReply
  await expect(page.getByTestId('booking-confirmed')).toContainText(/ID FL[0-9A-F]{8}/)
})
