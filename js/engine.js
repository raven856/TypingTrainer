function resolveGlobal(name) {
    if (typeof window !== 'undefined' && window[name]) return window[name];
    if (typeof globalThis !== 'undefined' && globalThis[name]) return globalThis[name];
    return undefined;
}

function lazyGlobal(name) {
    return new Proxy({}, {
        get(_target, prop) {
            const obj = resolveGlobal(name);
            if (!obj) return undefined;
            const value = obj[prop];
            return typeof value === 'function' ? value.bind(obj) : value;
        },
        set(_target, prop, value) {
            const obj = resolveGlobal(name);
            if (obj) obj[prop] = value;
            return true;
        }
    });
}

const TextProvider = lazyGlobal('TextProvider');
const UI = lazyGlobal('UI');
const Storage = lazyGlobal('Storage');

const Engine = {
    state: {
        text: '',
        currentIndex: 0,
        errors: 0,
        startTime: null,
        isPlaying: false,
        totalTyped: 0
    },

    init() {
        this.state.text = (TextProvider && typeof TextProvider.getRandomText === 'function')
            ? TextProvider.getRandomText()
            : '';
        this.state.currentIndex = 0;
        this.state.errors = 0;
        this.state.startTime = null;
        this.state.isPlaying = false;
        this.state.totalTyped = 0;

        UI.renderText(this.state.text);
        UI.setCursor(0);
        UI.elements.hiddenInput.value = '';
        UI.elements.hiddenInput.focus();
    },

    handleInput(char) {
        if (!this.state.isPlaying && this.state.currentIndex === 0) {
            this.state.isPlaying = true;
            this.state.startTime = Date.now();
        }

        if (!this.state.isPlaying) return;

        const targetChar = this.state.text[this.state.currentIndex];
        this.state.totalTyped++;

        if (char === targetChar) {
            UI.updateChar(this.state.currentIndex, 'correct');
        } else {
            UI.updateChar(this.state.currentIndex, 'incorrect');
            this.state.errors++;
        }

        this.state.currentIndex++;
        if (this.state.currentIndex < this.state.text.length) {
            UI.setCursor(this.state.currentIndex);
        } else {
            this.end();
        }
    },

    handleBackspace() {
        if (this.state.currentIndex <= 0) return;

        this.state.currentIndex--;

        UI.updateChar(this.state.currentIndex, null);
        UI.setCursor(this.state.currentIndex);
    },

    end() {
        this.state.isPlaying = false;

        const endTime = Date.now();
        const elapsedSec = Math.max(1, (endTime - this.state.startTime) / 1000);
        const timeElapsedMin = elapsedSec / 60;
        const correctChars = Math.max(0, this.state.currentIndex - this.state.errors);
        const wpm = Math.round((correctChars / 5) / timeElapsedMin);
        const accuracy = this.state.currentIndex > 0
            ? Math.round(((this.state.currentIndex - this.state.errors) / this.state.currentIndex) * 100)
            : 0;

        UI.showResults(wpm, accuracy);

        Storage.saveSession({
            timestamp: new Date().toISOString(),
            wpm,
            accuracy,
            duration: Math.round(elapsedSec)
        });
    }
};

if (typeof window !== 'undefined') {
    window.Engine = Engine;
}

export { Engine };
export default Engine;