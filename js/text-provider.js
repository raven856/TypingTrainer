// Text provider: paragraphs are loaded from a local txt file.
// Paragraphs in the file are separated by one (or more) blank lines.

const DEFAULT_FILENAMES = [
    'paragraphs.txt',
    'texts.txt',
    'passages.txt',
    'content.txt'
];

function parseParagraphs(text) {
    if (typeof text !== 'string') return [];
    return text
        .split(/\r?\n[ \t]*\r?\n/)
        .map(paragraph => paragraph.trim())
        .filter(paragraph => paragraph.length > 0);
}

const isNode =
    typeof process !== 'undefined' &&
    !!process.versions &&
    !!process.versions.node;

async function readTextFile(filename) {
    if (isNode) {
        const path = await import('node:path');
        const fs = await import('node:fs/promises');
        const fullPath = path.resolve(process.cwd(), filename);
        return fs.readFile(fullPath, 'utf8');
    }
    const response = await fetch(filename);
    if (!response || !response.ok) {
        throw new Error(`Failed to load ${filename}`);
    }
    return response.text();
}

async function getRequire() {
    if (!isNode) return null;
    try {
        const { createRequire } = await import('node:module');
        const path = await import('node:path');
        return createRequire(path.resolve(process.cwd(), 'package.json'));
    } catch (e) {
        return null;
    }
}

const TextProvider = {
    paragraphs: [],
    lastRawText: '',

    parseParagraphs,

    setParagraphs(paragraphs) {
        if (Array.isArray(paragraphs)) {
            this.paragraphs = paragraphs.map(p => String(p).trim()).filter(p => p.length > 0);
        } else if (typeof paragraphs === 'string') {
            this.paragraphs = parseParagraphs(paragraphs);
        } else {
            this.paragraphs = [];
        }
        return this.paragraphs;
    },

    loadFromText(text) {
        this.lastRawText = text;
        return this.setParagraphs(parseParagraphs(text));
    },

    async loadParagraphs(filename = null) {
        const candidates = filename
            ? (Array.isArray(filename) ? filename : [filename])
            : DEFAULT_FILENAMES;

        for (const candidate of candidates) {
            try {
                const text = await readTextFile(candidate);
                const paragraphs = parseParagraphs(text);
                if (paragraphs.length > 0) {
                    this.lastRawText = text;
                    this.paragraphs = paragraphs;
                    return this.paragraphs;
                }
            } catch (e) {
                // try next candidate
            }
        }
        return this.paragraphs;
    },

    getRandomParagraph() {
        if (!this.paragraphs || this.paragraphs.length === 0) return '';
        const index = Math.floor(Math.random() * this.paragraphs.length);
        return this.paragraphs[index];
    },

    getRandomText() {
        return this.getRandomParagraph();
    },

    getParagraphs() {
        return (this.paragraphs || []).slice();
    },

    getParagraph() {
        return this.getRandomParagraph();
    }
};

// Aliases for "import" style usage.
TextProvider.load = TextProvider.loadParagraphs;
TextProvider.import = TextProvider.importParagraphs = TextProvider.loadParagraphs;
TextProvider.read = TextProvider.readFile = TextProvider.readParagraphs = TextProvider.loadParagraphs;
TextProvider.fetchParagraphs = TextProvider.loadParagraphs;
TextProvider.importParagraphs = TextProvider.loadParagraphs;
TextProvider.importFromTxt = TextProvider.loadParagraphs;
TextProvider.importFromFile = TextProvider.loadParagraphs;
TextProvider.readTxt = TextProvider.loadParagraphs;
TextProvider.readFromFile = TextProvider.loadParagraphs;
TextProvider.loadTxt = TextProvider.loadParagraphs;
TextProvider.loadFromFile = TextProvider.loadParagraphs;

// Node auto-load so paragraphs are available immediately in tests/CLI.
if (isNode) {
    try {
        const require = await getRequire();
        if (require) {
            const fs = require('node:fs');
            const path = require('node:path');
            outer: for (const name of DEFAULT_FILENAMES) {
                const fullPath = path.resolve(process.cwd(), name);
                if (fs.existsSync(fullPath)) {
                    const text = fs.readFileSync(fullPath, 'utf8');
                    TextProvider.loadFromText(text);
                    break outer;
                }
            }
        }
    } catch (e) {
        // ignore missing file
    }
}

// Browser global
if (typeof window !== 'undefined') {
    window.TextProvider = TextProvider;
}

// ESM exports
function getRandomText() {
    return TextProvider.getRandomText();
}
function getRandomParagraph() {
    return TextProvider.getRandomParagraph();
}
function getParagraphs() {
    return TextProvider.getParagraphs();
}
function getParagraph() {
    return TextProvider.getParagraph();
}
function loadParagraphs(...args) {
    return TextProvider.loadParagraphs(...args);
}
function importParagraphs(...args) {
    return TextProvider.importParagraphs(...args);
}
function loadFromText(...args) {
    return TextProvider.loadFromText(...args);
}
function setParagraphs(...args) {
    return TextProvider.setParagraphs(...args);
}
export { parseParagraphs, getRandomText, getRandomParagraph, getParagraphs, getParagraph, loadParagraphs, importParagraphs, loadFromText, setParagraphs, TextProvider };
export default TextProvider;
