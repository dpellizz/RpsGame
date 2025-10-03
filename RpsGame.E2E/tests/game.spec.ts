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

    const buildHistoryResponse = (items: Array<typeof mockResult>) => {
      const playerWins = items.filter((item) => item.winner === 'player').length;
      const computerWins = items.filter((item) => item.winner === 'computer').length;
      const draws = items.filter((item) => item.winner === 'draw').length;

      return {
        items,
        page: 1,
        pageSize: 10,
        totalCount: items.length,
        totalPages: 1,
        hasPrevious: false,
        hasNext: false,
        summary: {
          total: items.length,
          player: playerWins,
          computer: computerWins,
          draw: draws
        }
      };
    };

    let historyCallCount = 0;

    await page.route('**/api/game/history**', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        historyCallCount += 1;
        const response = historyCallCount === 1 ? buildHistoryResponse([]) : buildHistoryResponse([mockResult]);
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(response) });
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
      const historyPage = await gamePage.openHistory();
      await historyPage.expectRowCount(1);
      await historyPage.expectHistoryEntry(0, 'rock', 'scissors', 'player');
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

	const buildHistoryResponse = (items: Array<typeof mockResult>) => {
      const playerWins = items.filter((item) => item.winner === 'player').length;
      const computerWins = items.filter((item) => item.winner === 'computer').length;
      const draws = items.filter((item) => item.winner === 'draw').length;

      return {
        items,
        page: 1,
        pageSize: 10,
        totalCount: items.length,
        totalPages: 1,
        hasPrevious: false,
        hasNext: false,
        summary: {
          total: items.length,
          player: playerWins,
          computer: computerWins,
          draw: draws
        }
      };
    };

	let historyState: Array<typeof mockResult> = [mockResult];

    await page.route('**/api/game/history**', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(buildHistoryResponse(historyState)) });
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
      const historyPage = await gamePage.openHistory();
      await historyPage.expectRowCount(1);
      await historyPage.goBackToGame();
    });

    await test.step('Reset history', async () => {
      await gamePage.resetHistory();
      const historyPage = await gamePage.openHistory();
      await historyPage.expectRowCount(0);
    });
  });
});
