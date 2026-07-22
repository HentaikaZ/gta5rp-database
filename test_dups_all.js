const fs = require('fs');

const files = fs.readdirSync('output').filter(f => f.endsWith('.json'));

for (const file of files) {
    const data = JSON.parse(fs.readFileSync('output/' + file, 'utf8'));
    for (const category in data) {
        const articles = data[category];
        const articleBaseNumbers = {};
        for (const article of articles) {
            if (!article.isChapter) {
                const titleParts = article.title.split('|');
                if (titleParts.length > 1) {
                    const chapterPrefix = titleParts[0].trim();
                    const title = titleParts[1].trim();
                    const baseTitleMatch = title.match(/^[\d\.]+/);
                    const baseTitle = baseTitleMatch ? baseTitleMatch[0] : title;
                    
                    if (!articleBaseNumbers[baseTitle]) {
                        articleBaseNumbers[baseTitle] = new Set();
                    }
                    articleBaseNumbers[baseTitle].add(chapterPrefix);
                }
            }
        }
        
        let found = false;
        for (const baseTitle in articleBaseNumbers) {
            if (articleBaseNumbers[baseTitle].size > 1) {
                console.log(`[${file}] [${category}] DUPLICATE: ${baseTitle} in ${Array.from(articleBaseNumbers[baseTitle]).join(', ')}`);
                found = true;
            }
        }
        
        if (!found && articles.some(a => !a.isChapter && a.title.includes('|'))) {
            // It has prefixes but no duplicates were found by this script?!
            console.log(`[${file}] [${category}] HAS PREFIXES BUT NO DUPLICATES FOUND BY THIS SCRIPT!`);
        }
    }
}
