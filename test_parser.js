const rawText = `1. Водитель обязан остановиться.
2. Водитель обязан проходить освидетельствование.
3. Еще какое-то правило.`;

function parseTextToArticles(rawText, categoryName) {
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    const articles = [];

    let currentChapterTitle = '';
    
    let currentArticleNumber = '';
    let currentArticleName = '';
    
    let currentPartNumber = '';
    let currentPartText = [];

    const chapterRegex = /^(?:Глава|Раздел|Часть)\s+([IVX\d]+)\.?\s*(.*)$/i;
    
    // Если это Дорожный, Этический или Трудовой кодекс, разрешаем статьи из одной цифры (например "2. ") даже без слова "Статья"
    const allowSingleDigitWithoutKeyword = /дорожный|этический|трудовой|пдд/i.test(categoryName);
    const singleDigitPart = allowSingleDigitWithoutKeyword ? '*' : '+';
    
    const articleRegex = new RegExp(`^(?:[^a-zа-я0-9\\[\\(\\{]+|(?:\\[|\\(|\\{)[^\\]\\)\\}]*(?:\\]|\\)|\\}))*\\s*(?:(?:Статья|Ст\\.?|Пункт|П\\.?)\\s*(\\d+(?:\\.\\d+)*)|(\\d+(?:\\.\\d+)${singleDigitPart}))\\.?\\s*(.*)$`, 'i');
    
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

            let chapterPrefix = null;
            if (currentChapterTitle) {
                const shortChapterMatch = currentChapterTitle.match(/^(?:Глава|Раздел|Часть)\s+[IVX\d]+/i);
                if (shortChapterMatch) {
                    chapterPrefix = shortChapterMatch[0];
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
                isChapter: false,
                _chapterPrefix: chapterPrefix
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
    
    // ПОСТ-ОБРАБОТКА: Проверяем, дублируются ли номера статей в разных главах
    const articleBaseNumbers = {}; // title -> Set of chapter prefixes
    for (const article of articles) {
        if (!article.isChapter && article._chapterPrefix) {
            // Берем только сам номер статьи без части (чтобы "1.1" и "1.1 ч.1" считались одной и той же статьей для проверки)
            const baseTitleMatch = article.title.match(/^[\d\.]+/);
            const baseTitle = baseTitleMatch ? baseTitleMatch[0] : article.title;
            
            if (!articleBaseNumbers[baseTitle]) {
                articleBaseNumbers[baseTitle] = new Set();
            }
            articleBaseNumbers[baseTitle].add(article._chapterPrefix);
        }
    }

    // Если есть хотя бы одна статья, которая встречается в РАЗНЫХ главах, значит нумерация сбрасывается в каждой главе (как на Alta)
    let needsChapterPrefix = false;
    for (const baseTitle in articleBaseNumbers) {
        if (articleBaseNumbers[baseTitle].size > 1) {
            needsChapterPrefix = true;
            break;
        }
    }

    // Если нужно, применяем префикс ко всем статьям
    if (needsChapterPrefix) {
        for (const article of articles) {
            if (!article.isChapter && article._chapterPrefix) {
                article.title = `${article._chapterPrefix} | ${article.title}`;
            }
        }
    }

    // Удаляем служебное поле _chapterPrefix перед выдачей результата
    for (const article of articles) {
        delete article._chapterPrefix;
    }

    return articles;
}

console.log("=== Testing as УК ===");
console.log(JSON.stringify(parseTextToArticles(rawText, 'УК'), null, 2));

console.log("\n=== Testing as Дорожный Кодекс ===");
console.log(JSON.stringify(parseTextToArticles(rawText, 'Дорожный Кодекс'), null, 2));
