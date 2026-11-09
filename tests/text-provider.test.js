import { runTest, assert } from './test-runner.js';
import { parseParagraphs, getRandomText, TextProvider } from '../js/text-provider.js';

export async function testTextProvider() {
    await runTest('should parse paragraphs separated by a blank line', () => {
        const text = 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.';
        const paragraphs = parseParagraphs(text);
        assert(paragraphs.length === 3, `Expected 3 paragraphs, got ${paragraphs.length}`);
        assert(paragraphs[0] === 'First paragraph.', 'First paragraph mismatch');
        assert(paragraphs[2] === 'Third paragraph.', 'Third paragraph mismatch');
    });

    await runTest('should ignore empty paragraphs', () => {
        const text = 'Only paragraph.\n\n\n\n   \n\n';
        const paragraphs = parseParagraphs(text);
        assert(paragraphs.length === 1, `Expected 1 paragraph, got ${paragraphs.length}`);
    });

    await runTest('should handle CRLF blank lines', () => {
        const text = 'One.\r\n\r\nTwo.';
        const paragraphs = parseParagraphs(text);
        assert(paragraphs.length === 2, `Expected 2 paragraphs, got ${paragraphs.length}`);
    });

    await runTest('should return a non-empty string', () => {
        const text = getRandomText();
        assert(typeof text === 'string' && text.length > 0, 'Text should not be empty');
    });

    await runTest('should expose paragraphs via TextProvider', () => {
        assert(Array.isArray(TextProvider.getParagraphs()), 'getParagraphs should return an array');
    });
}