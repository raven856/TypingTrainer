import { runTest, assert } from './test-runner.js';
import { Storage } from '../js/storage.js';

export async function testStorage() {
    localStorage.clear();

    await runTest('should save and retrieve a session', () => {
        const session = { timestamp: '2023-01-01', wpm: 60, accuracy: 95, duration: 30 };
        Storage.saveSession(session);
        const history = Storage.getHistory();
        assert(history.length === 1, 'History should have 1 session');
        assert(history[0].wpm === 60, 'WPM should be 60');
    });

    await runTest('should calculate aggregates correctly', () => {
        Storage.saveSession({ timestamp: '2', wpm: 100, accuracy: 100, duration: 30 });
        const aggs = Storage.getAggregates();
        assert(aggs.bestWpm === 100, 'Best WPM should be 100');
        assert(aggs.avgWpm === 80, 'Avg WPM should be 80');
    });

    await runTest('should clear history', () => {
        Storage.clearHistory();
        assert(Storage.getHistory().length === 0, 'History should be empty');
    });
}
