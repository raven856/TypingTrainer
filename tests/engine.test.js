import { runTest, assert } from './test-runner.js';
import { Engine } from '../js/engine.js';
import { UI } from '../js/ui.js';

// Mock UI methods to avoid DOM errors
UI.renderText = () => {};
UI.updateChar = () => {};
UI.updateTimer = () => {};
UI.showResults = () => {};

export async function testEngine() {
    await runTest('should initialize state correctly', () => {
        Engine.init();
        assert(Engine.state.currentIndex === 0, 'Index should be 0');
    });

    await runTest('should handle correct input', () => {
        Engine.init(30);
        Engine.state.isPlaying = true;
        Engine.state.text = 'hello';
        Engine.handleInput('h');
        assert(Engine.state.currentIndex === 1, 'Index should advance to 1');
        assert(Engine.state.errors === 0, 'Errors should be 0');
    });

    await runTest('should handle incorrect input', () => {
        Engine.init(30);
        Engine.state.isPlaying = true;
        Engine.state.text = 'hello';
        Engine.handleInput('z');
        assert(Engine.state.currentIndex === 1, 'Index should advance to 1');
        assert(Engine.state.errors === 1, 'Errors should be 1');
    });

    await runTest('should end game when text is finished', () => {
        Engine.init(30);
        Engine.state.isPlaying = true;
        Engine.state.text = 'hi';
        Engine.handleInput('h');
        Engine.handleInput('i');
        assert(Engine.state.isPlaying === false, 'Game should end');
    });
}
