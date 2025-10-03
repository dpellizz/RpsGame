import { expect, Locator, Page } from '@playwright/test';

type GameMove = 'rock' | 'paper' | 'scissors';

type Winner = 'player' | 'computer' | 'draw';

/**
 * Encapsulates interactions with the Rock · Paper · Scissors single-page app.
 */
export class GamePage {
  private readonly page: Page;
  private readonly moveGroup: Locator;
  private readonly latestResultStatus: Locator;
  private readonly historyTable: Locator;
  private readonly resetHistoryButton: Locator;

  constructor(page: Page) {
    this.page = page;
  this.moveGroup = page.getByRole('group', { name: 'Player moves' });
    this.latestResultStatus = page.getByRole('status').filter({ has: page.locator('.result-divider') });
    this.historyTable = page.getByRole('table', { name: 'Match history' });
    this.resetHistoryButton = page.getByRole('button', { name: /reset history/i });
  }

  async goto(baseUrl = '/'): Promise<void> {
    const historyResponse = this.page.waitForResponse((response) => {
      return response.request().method() === 'GET' && response.url().includes('/api/game/history');
    });

    await this.page.goto(baseUrl);
    await historyResponse.catch(() => undefined);
  }

  async playRound(move: GameMove): Promise<void> {
  const button = this.moveGroup.getByRole('button', { name: new RegExp(move, 'i') });
    await expect(button).toBeEnabled();
    await button.click();
  }

  async expectLatestWinner(winner: Winner): Promise<void> {
    const expectedText = winner === 'draw' ? 'Draw' : winner === 'player' ? 'You' : 'Computer';
    await expect(this.latestResultStatus).toContainText(new RegExp(expectedText, 'i'));
  }

  async expectHistoryRowCount(expectedRows: number): Promise<void> {
    if (expectedRows === 0) {
      await expect(this.historyTable).toHaveCount(0);
      await expect(this.page.getByText('No rounds recorded yet.', { exact: true })).toBeVisible();
      return;
    }

    await expect(this.historyTable).toHaveCount(1);
    await expect(this.historyTable.first()).toBeVisible();
    await expect(this.historyTable.getByRole('row')).toHaveCount(expectedRows + 1);
  }

  async resetHistory(): Promise<void> {
    await this.resetHistoryButton.click();
  }

  async expectHistoryEntry(index: number, playerMove: GameMove, computerMove: GameMove, winner: Winner): Promise<void> {
    const row = this.historyTable.getByRole('row').nth(index + 1);
    await expect(row).toContainText(new RegExp(playerMove, 'i'));
    await expect(row).toContainText(new RegExp(computerMove, 'i'));
    const winnerLabel = winner === 'draw' ? 'Draw' : winner === 'player' ? 'You' : 'Computer';
    await expect(row.locator('.status-pill')).toHaveText(new RegExp(winnerLabel, 'i'));
  }
}
