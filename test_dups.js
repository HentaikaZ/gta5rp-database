const fs = require('fs');
const data = JSON.parse(fs.readFileSync('output/eclipse-9.json', 'utf8'));
const uk = data['Уголовный Кодекс'] || [];

const articleBaseNumbers = {};
for (const article of uk) {
    if (!article.isChapter) {
        const titleParts = article.title.split('|');
        let chapterPrefix = '';
        let title = article.title;
        if (titleParts.length > 1) {
            chapterPrefix = titleParts[0].trim();
            title = titleParts[1].trim();
        }
        
        if (chapterPrefix) {
            const baseTitleMatch = title.match(/^[\d\.]+/);
            const baseTitle = baseTitleMatch ? baseTitleMatch[0] : title;
            
            if (!articleBaseNumbers[baseTitle]) {
                articleBaseNumbers[baseTitle] = new Set();
            }
            articleBaseNumbers[baseTitle].add(chapterPrefix);
        }
    }
}

for (const baseTitle in articleBaseNumbers) {
    if (articleBaseNumbers[baseTitle].size > 1) {
        console.log(`DUPLICATE FOUND: ${baseTitle} appears in ${Array.from(articleBaseNumbers[baseTitle]).join(', ')}`);
    }
}
