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
        }
    });
}
const UI = lazyGlobal('UI');
const Engine = lazyGlobal('Engine');
const Storage = lazyGlobal('Storage');

let progressChart = null;
let currentChartMode = 'sessions'; // 'sessions' or 'dates'

function initChart() {
    const canvas = document.getElementById('progressChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const history = Storage.getHistory();
    
    const labels = currentChartMode === 'sessions' 
        ? history.map((_, i) => `S${i + 1}`) 
        : history.map(s => new Date(s.timestamp).toLocaleDateString());

    const data = {
        labels: labels,
        datasets: [{
            label: 'WPM',
            data: history.map(s => s.wpm),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#6366f1'
        }]
    };

    if (progressChart) {
        progressChart.destroy();
    }

    progressChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#9ca3af' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#9ca3af' }
                }
            }
        }
    });
}

function updateStatsView() {
    const aggregates = Storage.getAggregates();
    const history = Storage.getHistory();
    UI.updateStats(aggregates, history);
    initChart();
}

function setupEventListeners() {
    UI.elements.btnViewTyping.addEventListener('click', () => UI.showView('typing'));
    UI.elements.btnViewStats.addEventListener('click', () => {
        UI.showView('stats');
        updateStatsView();
    });
    UI.elements.navHome.addEventListener('click', () => UI.showView('typing'));

    const uploadInput = document.getElementById('paragraphs-upload');
    if (uploadInput) {
        uploadInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const text = await file.text();
                window.TextProvider.loadFromText(text);
                Storage.saveParagraphs(text);
                document.getElementById('text-load-error').classList.add('hidden');
                Engine.init();
            }
        });
    }

    UI.elements.btnUpdateParagraphs.addEventListener('click', () => {
        if (uploadInput) uploadInput.click();
    });

    UI.elements.btnReset.addEventListener('click', () => Engine.init());
    UI.elements.btnCloseModal.addEventListener('click', () => {
        UI.hideResults();
        Engine.init();
    });

    UI.elements.hiddenInput.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
            Engine.handleBackspace();
        } else if (e.key.length === 1) {
            Engine.handleInput(e.key);
        }
    });

    document.getElementById('typing-container').addEventListener('click', () => {
        UI.elements.hiddenInput.focus();
    });

    UI.elements.themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        UI.elements.themeIcon.innerHTML = isDark 
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />'
            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />';
    });

    UI.elements.btnClearHistory.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all your progress?')) {
            Storage.clearHistory();
            updateStatsView();
        }
    });

    UI.elements.historyTableBody.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-delete');
        if (!btn) return;

        const index = parseInt(btn.dataset.index);
        if (confirm('Remove this session from your history?')) {
            Storage.removeSession(index);
            updateStatsView();
        }
    });

    // Chart axis toggle
    document.getElementById('btn-chart-sessions').addEventListener('click', (e) => {
        currentChartMode = 'sessions';
        updateChartButtons(e.target);
        initChart();
    });

    document.getElementById('btn-chart-dates').addEventListener('click', (e) => {
        currentChartMode = 'dates';
        updateChartButtons(e.target);
        initChart();
    });
}

function updateChartButtons(activeBtn) {
    document.querySelectorAll('.chart-toggle-btn').forEach(btn => {
        btn.classList.remove('bg-accent', 'text-white', 'font-medium');
        btn.classList.add('text-gray-500', 'dark:text-gray-400', 'hover:text-gray-900', 'dark:hover:text-white');
    });
    activeBtn.classList.add('bg-accent', 'text-white', 'font-medium');
    activeBtn.classList.remove('text-gray-500', 'dark:text-gray-400', 'hover:text-gray-900', 'dark:hover:text-white');
}

document.addEventListener('DOMContentLoaded', async () => {
    setupEventListeners();
    try {
        const storedText = Storage.getParagraphsText();
        if (storedText) {
            window.TextProvider.loadFromText(storedText);
        } else {
            if (window.TextProvider && typeof window.TextProvider.loadParagraphs === 'function') {
                await window.TextProvider.loadParagraphs();
                if (window.TextProvider.getParagraphs().length > 0) {
                    Storage.saveParagraphs(window.TextProvider.lastRawText);
                } else {
                    throw new Error('No paragraphs loaded from file');
                }
            } else {
                throw new Error('TextProvider not found');
            }
        }
    } catch (e) {
        console.warn('Failed to load paragraphs:', e);
        const errorDiv = document.getElementById('text-load-error');
        if (errorDiv) errorDiv.classList.remove('hidden');
    }
    Engine.init();
});
