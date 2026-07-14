import { test, expect } from '@playwright/test'

// End-to-end booking flow through the real agent (Groq + mock inventory).
// Slow by nature: each turn is an LLM round-trip, and free-tier rate limits
// mean built-in server-side retries. Generous timeouts are intentional.

const chatInput = (page) => page.getByLabel('Message the flight assistant')

const waitForReply = (page) =>
  page.waitForResponse(r => r.url().includes('/chat') && r.status() === 200, { timeout: 180000 })

async function say(page, text) {
  await chatInput(page).fill(text)
  const reply = waitForReply(page)
  await page.getByRole('button', { name: 'Send' }).click()
  await reply
}

test('landing page links into the app', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('knows what a fair price is.')).toBeVisible()
  await page.getByTestId('cta-app').click()
  await expect(chatInput(page)).toBeVisible()
})

test('predict tab returns a historical estimate', async ({ page }) => {
  await page.goto('/#/app')
  await page.getByRole('tab', { name: /Price estimate/ }).click()
  await page.getByRole('button', { name: /Predict Price/i }).click()
  await expect(page.locator('#result')).toContainText('₹', { timeout: 30000 })
})

test('search, pick a flight, book, get confirmation', async ({ page }) => {
  await page.goto('/#/app')

  await say(page, 'find flights Delhi to Mumbai on 2026-07-25')
  const cards = page.getByTestId('offer-card')
  await expect(cards.first()).toBeVisible()
  expect(await cards.count()).toBeGreaterThan(1)

  const selectReply = waitForReply(page)
  await cards.first().getByRole('button', { name: 'Select' }).click()
  await selectReply

  await say(page, 'passenger is Akbar Ali, email akbar@example.com')
  await say(page, 'yes, I confirm the booking')

  await expect(page.getByTestId('booking-confirmed')).toContainText(/ID FL[0-9A-F]{8}/)
})
