const fs = require('fs');
const path = require('path');

const INPUT_HTML = 'index.html';
const OUTPUT_DIR = 'dist';
const OUTPUT_HTML = path.join(OUTPUT_DIR, 'index.html');

function build() {
    console.log('📦 Starting robust build process...');

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR);
    }

    let html = fs.readFileSync(INPUT_HTML, 'utf8');

    // More robust regex to find script tags with a src attribute
    // Matches <script src="path"></script> or <script src='path'></script>
    // Handles optional whitespace and different quote types
    const scriptRegex = /<script\b[^>]*?\bsrc=["']([^"']+)["'][^>]*><\/script>/g;
    
    let matchCount = 0;
    const bundledHtml = html.replace(scriptRegex, (match, src) => {
        // Only bundle local JS files
        if (src.startsWith('http') || src.startsWith('//')) {
            return match;
        }

        const filePath = path.resolve(process.cwd(), src);
        if (fs.existsSync(filePath)) {
            matchCount++;
            console.log(`  ✅ Bundling ${src}...`);
            const rawContent = fs.readFileSync(filePath, 'utf8');
            // Strip ESM export statements so the bundle works as classic scripts.
            let content = rawContent.replace(/^\s*export\b.*$/gm, '');
            // Remove Node-only auto-load block (uses top-level await) from browser bundle.
            content = content.replace(/\/\/ Node auto-load[\s\S]*?\/\/ Browser global/g, '// Browser global');
            // Wrap in a block to avoid duplicate top-level declarations across bundled files.
            return `<script>\n/* Bundled: ${src} */\n{\n${content}\n}\n</script>`;
        } else {
            console.warn(`  ⚠️ Warning: Local file ${src} not found at ${filePath}. Skipping.`);
            return match;
        }
    });

    if (matchCount === 0) {
        console.error('❌ Error: No local scripts were found to bundle. Check your index.html script tags.');
    }

    fs.writeFileSync(OUTPUT_HTML, bundledHtml);
    console.log(`\n✨ Build complete! ${matchCount} files bundled.`);
    console.log(`🚀 Single-file app created at: ${OUTPUT_HTML}`);
}

build();
