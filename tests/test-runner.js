// tests/test-runner.js
export async function runTest(name, testFn) {
    try {
        await testFn();
        console.log(`✅ ${name}`);
        return true;
    } catch (error) {
        console.error(`❌ ${name}`);
        console.error(`   ${error.message}`);
        return false;
    }
}

export function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}
