const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'frontend', 'src', 'data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.ts') && f !== 'lessons.ts' && f !== 'frontend-m1-m2.ts');

for (const file of files) {
    const filePath = path.join(dataDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove startingCode: '...', 
    content = content.replace(/startingCode:\s*('.*?'|".*?"|`[\s\S]*?`),\s*/g, '');

    // Remove language: 'typescript',
    content = content.replace(/language:\s*('.*?'|".*?"),\s*/g, '');

    // Remove targetCode: `...`,
    content = content.replace(/targetCode:\s*`[\s\S]*?`,\s*/g, '');

    // Remove comments: [ ... ],
    content = content.replace(/comments:\s*\[[\s\S]*?\],\s*/g, '');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned ${file}`);
}
