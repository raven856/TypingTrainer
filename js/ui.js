const UI = {
    elements: {
        textDisplay: document.getElementById('text-display'),
        hiddenInput: document.getElementById('hidden-input'),
        btnReset: document.getElementById('btn-reset'),
        btnViewTyping: document.getElementById('btn-view-typing'),
        btnViewStats: document.getElementById('btn-view-stats'),
        btnUpdateParagraphs: document.getElementById('btn-update-paragraphs'),
        viewTyping: document.getElementById('view-typing'),
        viewStats: document.getElementById('view-stats'),
        modalResults: document.getElementById('modal-results'),
        modalContent: document.getElementById('modal-content'),
        resWpm: document.getElementById('res-wpm'),
        resAcc: document.getElementById('res-acc'),
        btnCloseModal: document.getElementById('btn-close-modal'),
        statBestWpm: document.getElementById('stat-best-wpm'),
        statAvgWpm: document.getElementById('stat-avg-wpm'),
        statAvgAcc: document.getElementById('stat-avg-acc'),
        historyTableBody: document.getElementById('history-table-body'),
        btnClearHistory: document.getElementById('btn-clear-history'),
        themeToggle: document.getElementById('theme-toggle'),
        themeIcon: document.getElementById('theme-icon'),
        navHome: document.getElementById('nav-home')
    },

    renderText(text) {
        this.elements.textDisplay.innerHTML = '';
        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            span.className = 'char';
            this.elements.textDisplay.appendChild(span);
        });
    },

    updateChar(index, status) {
        const chars = this.elements.textDisplay.querySelectorAll('.char');
        if (!chars[index]) return;

        chars[index].classList.remove('correct', 'incorrect');
        if (status) {
            chars[index].classList.add(status);
        }
    },

    setCursor(index) {
        const chars = this.elements.textDisplay.querySelectorAll('.char');
        chars.forEach(c => c.classList.remove('current'));
        if (chars[index]) {
            chars[index].classList.add('current');
        }
    },

    showView(view) {
        if (view === 'typing') {
            this.elements.viewTyping.classList.remove('hidden');
            this.elements.viewStats.classList.add('hidden');
            this.elements.btnViewTyping.classList.add('text-accent');
            this.elements.btnViewTyping.classList.remove('text-gray-400');
            this.elements.btnViewStats.classList.remove('text-accent');
            this.elements.btnViewStats.classList.add('text-gray-400');
            this.elements.hiddenInput.focus();
        } else {
            this.elements.viewTyping.classList.add('hidden');
            this.elements.viewStats.classList.remove('hidden');
            this.elements.btnViewStats.classList.add('text-accent');
            this.elements.btnViewStats.classList.remove('text-gray-400');
            this.elements.btnViewTyping.classList.remove('text-accent');
            this.elements.btnViewTyping.classList.add('text-gray-400');
        }
    },

    showResults(wpm, acc) {
        this.elements.resWpm.textContent = wpm;
        this.elements.resAcc.textContent = `${acc}%`;
        this.elements.modalResults.classList.remove('hidden');
        setTimeout(() => {
            this.elements.modalContent.classList.remove('scale-95', 'opacity-0');
            this.elements.modalContent.classList.add('scale-100', 'opacity-100');
        }, 10);
    },

    hideResults() {
        this.elements.modalContent.classList.remove('scale-100', 'opacity-100');
        this.elements.modalContent.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            this.elements.modalResults.classList.add('hidden');
        }, 200);
    },

    updateStats(aggregates, history) {
        this.elements.statBestWpm.innerHTML = `${aggregates.bestWpm} <span class="text-lg font-normal text-gray-500">WPM</span>`;
        this.elements.statAvgWpm.innerHTML = `${aggregates.avgWpm} <span class="text-lg font-normal text-gray-500">WPM</span>`;
        this.elements.statAvgAcc.innerHTML = `${aggregates.avgAcc} <span class="text-lg font-normal text-gray-500">%</span>`;

        const reversedHistory = history.map((s, i) => ({...s, originalIndex: i})).reverse();

        this.elements.historyTableBody.innerHTML = reversedHistory.map(s => `
            <tr class="hover:bg-gray-800/50 transition-colors">
                <td class="px-6 py-4 text-gray-400">${new Date(s.timestamp).toLocaleDateString()}</td>
                <td class="px-6 py-4">${s.duration}s</td>
                <td class="px-6 py-4 font-bold text-accent">${s.wpm}</td>
                <td class="px-6 py-4">${s.accuracy}%</td>
                <td class="px-6 py-4 text-right">
                    <button data-index="${s.originalIndex}" class="btn-delete text-gray-500 hover:text-red-400 transition-colors p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </td>
            </tr>
        `).join('');
    }
};

if (typeof window !== 'undefined') {
    window.UI = UI;
}

export { UI };
export default UI;
