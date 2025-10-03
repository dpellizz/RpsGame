import { expect, Locator, Page } from '@playwright/test';

type GameMove = 'rock' | 'paper' | 'scissors';

type Winner = 'player' | 'computer' | 'draw';

export class HistoryPage {
  private readonly page: Page;
  private readonly historyTable: Locator;

  constructor(page: Page) {
    this.page = page;
    this.historyTable = page.getByRole('table', { name: /match history table/i });
  }

  async expectRowCount(expectedRows: number): Promise<void> {
    if (expectedRows === 0) {
      await expect(this.historyTable).toHaveCount(0);
      await expect(this.page.getByText('No rounds recorded yet.', { exact: true })).toBeVisible();
      return;
    }

    const table = this.historyTable.first();
    await expect(table).toBeVisible();
    await expect(table.locator('tbody tr')).toHaveCount(expectedRows);
  }

  async expectHistoryEntry(index: number, playerMove: GameMove, computerMove: GameMove, winner: Winner): Promise<void> {
    const row = this.historyTable.getByRole('row').nth(index + 1);
    await expect(row).toContainText(new RegExp(playerMove, 'i'));
    await expect(row).toContainText(new RegExp(computerMove, 'i'));
    const winnerLabel = winner === 'draw' ? 'Draw' : winner === 'player' ? 'You' : 'Computer';
    await expect(row.locator('.status-pill')).toHaveText(new RegExp(winnerLabel, 'i'));
  }

  async goBackToGame(): Promise<void> {
    await Promise.all([
      this.page.waitForURL((url) => {
        const targetUrl = typeof url === 'string' ? new URL(url) : url;
        const path = targetUrl.pathname;
        return path === '/' || path === '/index.html';
      }).catch(() => undefined),
      this.page.getByRole('link', { name: /back to game/i }).click()
    ]);
  }
}
