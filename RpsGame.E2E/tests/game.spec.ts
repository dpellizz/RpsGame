import { test } from '@playwright/test';
import { GamePage } from './pages/game-page';

test.describe('Rock · Paper · Scissors', () => {
  test('shows latest result and updates history after playing a round', async ({ page }) => {
    const mockResult = {
      id: 'result-1',
      playerMove: 'rock',
      computerMove: 'scissors',
      winner: 'player',
      playedAt: new Date('2024-01-01T12:00:00Z').toISOString()
    };

    let historyCallCount = 0;

    await page.route('**/api/game/history', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        historyCallCount += 1;
        if (historyCallCount === 1) {
          await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
        } else {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([mockResult]) });
        }
        return;
      }

      if (method === 'DELETE') {
        historyCallCount = 0;
        await route.fulfill({ status: 204, body: '' });
        return;
      }

      await route.continue();
    });

    await page.route('**/api/game/play**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResult)
      });
    });

    const gamePage = new GamePage(page);

    await test.step('Open the game', async () => {
      await gamePage.goto();
    });

    await test.step('Play a round', async () => {
      await gamePage.playRound('rock');
      await gamePage.expectLatestWinner('player');
      await gamePage.expectHistoryRowCount(1);
      await gamePage.expectHistoryEntry(0, 'rock', 'scissors', 'player');
    });
  });

  test('resets history when requested', async ({ page }) => {
    const mockResult = {
      id: 'result-reset',
      playerMove: 'paper',
      computerMove: 'rock',
      winner: 'player',
      playedAt: new Date('2024-01-01T12:05:00Z').toISOString()
    };

  let historyState: Array<typeof mockResult> = [mockResult];

    await page.route('**/api/game/history', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(historyState) });
        return;
      }

      if (method === 'DELETE') {
        historyState = [];
        await route.fulfill({ status: 204, body: '' });
        return;
      }

      await route.continue();
    });

    await page.route('**/api/game/play**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResult)
      });
    });

    const gamePage = new GamePage(page);

    await test.step('Open the game with history', async () => {
      await gamePage.goto();
      await gamePage.expectHistoryRowCount(1);
    });

    await test.step('Reset history', async () => {
      await gamePage.resetHistory();
      await gamePage.expectHistoryRowCount(0);
    });
  });
});
