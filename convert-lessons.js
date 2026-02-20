const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'frontend/src/data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.ts') && f !== 'lessons.ts');

files.forEach(file => {
    const filePath = path.join(dataDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Simple regex replacement: find instructions and targetCode, append targetCode to instructions
    // We can't do this easily with regex if there are backticks inside the strings.
    // Instead we will rely on injecting after "instructions: `...`,"
    // Actually, doing this with regex for nested backticks is hard in JS. 
    // Wait, the files export a standard format.
    // Let's print the files to see if we can just append it manually or write a robust parser.
});
console.log(files);
