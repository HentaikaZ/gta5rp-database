const rawText = `Глава I. Введение
Статья 1.1. Правонарушением признается нарушение...
Уголовным преступлением признается...
Статья 1.2. Не является преступлением действие (бездействие)...
Статья 1.3. Совокупность преступлений.
Совокупностью преступлений признается совершение...
🟢6.1 [А](ОБЩАЯ) Нанесение телесных повреждений...`;

function parseTextToArticles(rawText, categoryName) {
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const articles = [];

    let currentChapterTitle = '';
    
    let currentArticleNumber = '';
    let currentArticleName = '';
    
    let currentPartNumber = '';
    let currentPartText = [];

    const chapterRegex = /^(?:Глава|Раздел|Часть)\s+([IVX\d]+)\.?\s*(.*)$/i;
    const articleRegex = /^(?:[^a-zа-я0-9]*\s*)?(?:(?:Статья|Ст\.?|Пункт|П\.?)\s*(\d+(?:\.\d+)*)|(\d+(?:\.\d+)+))\.?\s*(.*)$/i;
    const partRegex = /^(?:[^a-zа-я0-9]*\s*)?(?:ч\.?|часть)\s*(\d+)\.?\s*(.*)$/i;

    function saveCurrentPart(isFollowedByPart = false) {
        if (currentArticleNumber) {
            // Не сохраняем "пустую" статью (без текста), если сразу после названия идёт ч. 1
            if (!currentPartNumber && currentPartText.length === 0 && isFollowedByPart) {
                return;
            }

            let title = currentArticleNumber;
            if (currentPartNumber) {
                title += ` ч.${currentPartNumber}`;
            }

            // Добавляем префикс главы, чтобы статьи с одинаковыми номерами (как на Alta) отличались
            if (currentChapterTitle) {
                const shortChapterMatch = currentChapterTitle.match(/^(?:Глава|Раздел|Часть)\s+[IVX\d]+/i);
                if (shortChapterMatch) {
                    title = `${shortChapterMatch[0]} | ${title}`;
                }
            }
            
            let textPieces = [];
            if (currentArticleName) {
                textPieces.push(currentArticleName + (currentArticleName.endsWith('.') ? '' : '.'));
            }
            if (currentPartText.length > 0) {
                textPieces.push(currentPartText.join('\n'));
            }
            
            articles.push({
                title: title,
                text: textPieces.join(' ').trim(),
                category: categoryName,
                isChapter: false
            });
        }
    }

    for (const line of lines) {
        // Проверяем, глава ли это
        const chapterMatch = line.match(chapterRegex);
        if (chapterMatch) {
            saveCurrentPart(false);
            currentArticleNumber = '';
            currentArticleName = '';
            currentPartNumber = '';
            currentPartText = [];
            
            currentChapterTitle = line;
            articles.push({
                title: currentChapterTitle,
                text: "",
                category: categoryName,
                isChapter: true
            });
            continue;
        }

        // Проверяем, статья ли это
        const articleMatch = line.match(articleRegex);
        if (articleMatch) {
            saveCurrentPart(false);
            currentArticleNumber = articleMatch[1] || articleMatch[2]; // e.g. "15.1"
            currentArticleName = articleMatch[3]; // e.g. "Превышение полномочий"
            currentPartNumber = '';
            currentPartText = [];
            continue;
        }

        // Проверяем, часть ли это
        const partMatch = line.match(partRegex);
        if (partMatch && currentArticleNumber) {
            saveCurrentPart(true); // Save previous part if it existed
            currentPartNumber = partMatch[1]; // e.g. "1"
            currentPartText = [];
            if (partMatch[2]) {
                currentPartText.push(partMatch[2]);
            }
            continue;
        }

        // Если это просто текст, добавляем его к текущей части (или к статье, если частей нет)
        if (currentArticleNumber) {
            currentPartText.push(line);
        }
    }

    // Сохраняем последнюю
    saveCurrentPart(false);
    return articles;
}

console.log(JSON.stringify(parseTextToArticles(rawText, "УК"), null, 2));
