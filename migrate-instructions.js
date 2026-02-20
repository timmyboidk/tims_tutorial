const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'frontend/src/data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.ts') && f !== 'lessons.ts');

files.forEach(file => {
    const filePath = path.join(dataDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    const regex = /instructions:\s*(`[\s\S]*?`),\s*targetCode:\s*(`[\s\S]*?`),/g;

    let modified = false;
    content = content.replace(regex, (match, p1, p2) => {
        if (p1.includes('## 📝 完整参考代码')) {
            return match;
        }
        modified = true;

        let evaledString;
        try {
            evaledString = eval(p2);
        } catch (e) {
            console.error('Failed to eval p2 in ' + file);
            return match;
        }

        // We escape backticks, backslashes and dollar signs so they render verbatim in the markdown text
        // Note: we need to escape backslashes first so we don't escape our freshly added escapes!
        let safeContent = evaledString.replace(/\\/g, '\\\\')
            .replace(/`/g, '\\`')
            .replace(/\$/g, '\\$');

        const newInstructions = p1.substring(0, p1.length - 1) +
            '\\n\\n## 📝 完整参考代码\\n\\`\\`\\`typescript\\n' +
            safeContent +
            '\\n\\`\\`\\`' + '`'; // close p1

        return `instructions: ${newInstructions},\n        targetCode: ${p2},`;
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
