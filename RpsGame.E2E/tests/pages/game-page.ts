import { expect, Locator, Page } from '@playwright/test';
import { HistoryPage } from './history-page';

type GameMove = 'rock' | 'paper' | 'scissors';

type Winner = 'player' | 'computer' | 'draw';

/**
 * Encapsulates interactions with the Rock · Paper · Scissors single-page app.
 */
export class GamePage {
  private readonly page: Page;
  private readonly moveGroup: Locator;
  private readonly latestResultStatus: Locator;
  private readonly resetHistoryButton: Locator;
  private readonly viewHistoryLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.moveGroup = page.getByRole('group', { name: 'Player moves' });
    this.latestResultStatus = page.getByRole('status').filter({ has: page.locator('.result-divider') });
    this.resetHistoryButton = page.getByRole('button', { name: /reset history/i });
    this.viewHistoryLink = page.getByRole('link', { name: /view full history/i });
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

  async resetHistory(): Promise<void> {
    await this.resetHistoryButton.click();
  }

  async openHistory(): Promise<HistoryPage> {
    const waitForHistoryResponse = this.page.waitForResponse((response) => {
      return response.request().method() === 'GET' && response.url().includes('/api/game/history');
    });

    await this.viewHistoryLink.click();
    await Promise.all([waitForHistoryResponse.catch(() => undefined), expect(this.page).toHaveURL(/\/history(\?.*)?$/)]);

    return new HistoryPage(this.page);
  }
}
