const STORAGE_KEY = 'typeflow_history';
const PARAGRAPHS_KEY = 'typeflow_paragraphs';

const Storage = {
    saveSession(session) {
        const history = this.getHistory();
        history.push(session);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    },

    getHistory() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    removeSession(index) {
        const history = this.getHistory();
        if (index >= 0 && index < history.length) {
            history.splice(index, 1);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        }
    },

    clearHistory() {
        localStorage.removeItem(STORAGE_KEY);
    },

    getAggregates() {
        const history = this.getHistory();
        if (history.length === 0) return { bestWpm: 0, avgWpm: 0, avgAcc: 0 };

        const totalWpm = history.reduce((sum, s) => sum + s.wpm, 0);
        const totalAcc = history.reduce((sum, s) => sum + s.accuracy, 0);
        const bestWpm = Math.max(...history.map(s => s.wpm));

        return {
            bestWpm,
            avgWpm: Math.round(totalWpm / history.length),
            avgAcc: Math.round(totalAcc / history.length)
        };
    },

    saveParagraphs(text) {
        localStorage.setItem(PARAGRAPHS_KEY, text);
    },

    getParagraphsText() {
        return localStorage.getItem(PARAGRAPHS_KEY);
    }
};

if (typeof window !== 'undefined') {
    window.Storage = Storage;
}

export { Storage };
export default Storage;
