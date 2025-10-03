import { expect, Locator, Page } from '@playwright/test';

type GameMove = 'rock' | 'paper' | 'scissors';

type Winner = 'player' | 'computer' | 'draw';

export class GamePage {
  readonly page: Page;
  readonly moveButtons: Locator;
  readonly latestResultRegion: Locator;
  readonly computerMoveAnnouncement: Locator;
  readonly statusPills: Locator;
  readonly resetButton: Locator;
  readonly historyTable: Locator;
  readonly historyRows: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.moveButtons = page.getByRole('group', { name: 'Player moves' }).getByRole('button');
    this.latestResultRegion = page.getByRole('status', { includeHidden: false }).filter({ hasText: 'vs' });
    this.computerMoveAnnouncement = page.getByRole('status', { name: /computer move/i, includeHidden: false });
    this.statusPills = page.locator('.status-pill');
    this.resetButton = page.getByRole('button', { name: 'Reset history' });
    this.historyTable = page.getByRole('table', { name: 'Match history' });
    this.historyRows = this.historyTable.getByRole('row').filter({ hasNotText: /^#$/ });
  }

  async goto(baseUrl = '/'): Promise<void> {
    await this.page.goto(baseUrl);
  }

  async playRound(move: GameMove): Promise<void> {
    await this.moveButtons.filter({ hasText: new RegExp(`^${move}$`, 'i') }).first().click();
  }

  async expectLatestWinner(winner: Winner): Promise<void> {
    const expectedText = winner === 'draw' ? 'Draw' : winner === 'player' ? 'You' : 'Computer';
    await expect(this.statusPills.first()).toHaveText(expectedText, { timeout: 5000 });
  }

  async expectLatestComputerMove(): Promise<void> {
    await expect(this.latestResultRegion).toContainText(/computer/i);
  }

  async expectHistoryRowCount(expected: number): Promise<void> {
    await expect(this.historyTable.getByRole('row')).toHaveCount(expected + 1); // include header row
  }

  async resetHistory(): Promise<void> {
    await this.resetButton.click();
  }

  async expectHistoryEntry(index: number, playerMove: GameMove, computerMove: GameMove, winner: Winner): Promise<void> {
    const row = this.historyRows.nth(index);
    await expect(row).toContainText(new RegExp(`${index + 1}`));
    await expect(row).toContainText(new RegExp(playerMove, 'i'));
    await expect(row).toContainText(new RegExp(computerMove, 'i'));
    const winnerLabel = winner === 'draw' ? 'Draw' : winner === 'player' ? 'You' : 'Computer';
    await expect(row.locator('.status-pill')).toHaveText(winnerLabel);
  }
}
