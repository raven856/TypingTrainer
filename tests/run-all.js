import './mocks.js';
import { testTextProvider } from './text-provider.test.js';
import { testStorage } from './storage.test.js';
import { testEngine } from './engine.test.js';

async function runAll() {
    console.log('🚀 Starting Typing Trainer Test Suite...\n');
    
    await testTextProvider();
    await testStorage();
    await testEngine();

    console.log('\n✨ All tests completed!');
}

runAll().catch(err => {
    console.error('Fatal Error:', err);
    process.exit(1);
});
