const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'frontend/src/data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.ts'));

// Regex to match emojis commonly used in the codebase
const emojiPattern = /[💡🧠🎯🔍🚀✨📝✅⭐🔥⚡🤔🎉❤️🤍✓❓🛠️📚🗄️📲📨📱]/g;

// Analogies to simplify
const analogies = [
    { match: /像安检员一样/g, replace: '作为中间件' },
    { match: /汪洋大海/g, replace: '系统' },
    { match: /岛屿架构/g, replace: '独立架构' },
    { match: /防波堤/g, replace: '防护层' },
    { match: /海王模式：接管接驳/g, replace: '统一接管' },
    { match: /护城河/g, replace: '防护体系' },
    { match: /木乃伊体/g, replace: '静态数据' },
    { match: /注水复苏/g, replace: '重新激活' },
    { match: /大招/g, replace: '进阶方案' },
    { match: /核聚变/g, replace: '底层变革' },
    { match: /防线/g, replace: '安全机制' },
    { match: /上帝视角/g, replace: '全局视角' },
    { match: /上帝引擎/g, replace: '核心引擎' }
];

for (const file of files) {
    const filePath = path.join(dataDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // Remove emojis
    content = content.replace(emojiPattern, '');

    // Replace analogies
    for (const a of analogies) {
        content = content.replace(a.match, a.replace);
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Cleaned ${file}`);
}
