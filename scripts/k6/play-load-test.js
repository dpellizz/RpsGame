import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrlEnv = __ENV.API_BASE ?? __ENV.API_BASE_URL;
const baseUrl = (baseUrlEnv ?? 'http://localhost:5198').replace(/\/$/, '');
const iterationPause = Number(__ENV.K6_ITERATION_PAUSE ?? '0.1');
const moves = (__ENV.K6_MOVES ?? 'rock,paper,scissors')
  .split(',')
  .map((move) => move.trim().toLowerCase())
  .filter(Boolean);
const resetHistory = (__ENV.K6_RESET_HISTORY ?? 'false').toLowerCase() === 'true';

const vus = Number(__ENV.K6_VUS ?? '25');
const duration = __ENV.K6_DURATION ?? '2m';

if (moves.length === 0) {
  throw new Error('No valid moves configured. Set K6_MOVES env var with comma-separated list.');
}

export const options = {
  vus,
  duration,
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export function setup() {
  if (!resetHistory) {
    return;
  }

  const response = http.del(`${baseUrl}/api/game/history`);
  check(response, {
    'history reset succeeded': (res) => res.status === 200 || res.status === 204,
  });
}

export default function () {
  const move = moves[Math.floor(Math.random() * moves.length)];
  const url = `${baseUrl}/api/game/play?playerMove=${encodeURIComponent(move)}`;

  const response = http.post(url, null, {
    tags: { move },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  check(response, {
    'play request succeeded': (res) => res.status === 200,
    'response includes winner': (res) => {
      try {
        const data = res.json();
        return Boolean(data?.winner);
      } catch (error) {
        return false;
      }
    },
  });

  if (iterationPause > 0) {
    sleep(iterationPause);
  }
}
