// tests/mocks.js
export const mocks = {
    localStorage: {
        store: {},
        getItem(key) { return this.store[key] || null; },
        setItem(key, value) { this.store[key] = value.toString(); },
        removeItem(key) { delete this.store[key]; },
        clear() { this.store = {}; }
    },
    document: {
        getElementById: (id) => ({
            classList: {
                add: () => {},
                remove: () => {},
                toggle: () => {},
                contains: () => false
            },
            innerHTML: '',
            textContent: '',
            value: '',
            focus: () => {},
            addEventListener: () => {},
            querySelectorAll: () => []
        }),
        querySelectorAll: () => [],
        addEventListener: () => {}
    },
    window: {
        setInterval: (fn) => {
            const id = Math.random();
            setTimeout(fn, 10); // Speed up tests
            return id;
        },
        clearInterval: () => {}
    }
};

// Apply mocks globally for the test environment
global.localStorage = mocks.localStorage;
global.document = mocks.document;
global.window = mocks.window;
global.HTMLElement = class {};
global.Node = class {};
