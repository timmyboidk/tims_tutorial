const fs = require('fs');
let content = fs.readFileSync('frontend/src/data/frontend-m3-m5.ts', 'utf8');

const regex = /instructions:\s*(`[\s\S]*?`),\s*targetCode:\s*(`[\s\S]*?`),/g;

content = content.replace(regex, (match, p1, p2) => {
    if (p1.includes('## 📝 完整参考代码')) {
        return match;
    }

    let targetCodeContent = p2.substring(1, p2.length - 1);
    targetCodeContent = targetCodeContent.replace(/\\n/g, '\n');

    // As explained, targetCodeContent is ALREADY ESCAPED correctly for TS template strings!
    // No need to touch `$`, `\``, `\\` anymore! Just drop it in!

    const newInstructions = p1.substring(0, p1.length - 1) +
        '\\n\\n## 📝 完整参考代码\\n\\`\\`\\`typescript\\n' +
        targetCodeContent +
        '\\n\\`\\`\\`' + '`';

    return `instructions: ${newInstructions},\n        targetCode: ${p2},`;
});

fs.writeFileSync('frontend/src/data/frontend-m3-m5.ts', content, 'utf8');
