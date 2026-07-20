const { connect } = require('puppeteer-real-browser');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'output');
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

// ============================================================================
// НАСТРОЙКИ СЕРВЕРОВ И ССЫЛОК НА ТЕМЫ
// ============================================================================
const SERVERS = [
    {
        id: 'downtown-1',
        name: 'Downtown (1)',
        codes: {
            "Уголовно-административный Кодекс": "https://forum.gta5rp.com/threads/ugolovno-administrativnyi-kodeks-shtata-san-andreas.1458592/",
            "Дорожный Кодекс": "https://forum.gta5rp.com/threads/dorozhno-transportnyi-kodeks-shtata-san-andreas.1457606/",
            "Процессуальный Кодекс": "https://forum.gta5rp.com/threads/processualnyi-kodeks-shtata-san-andreas.1458593/"
        }
    },
    {
        id: 'strawberry-2',
        name: 'Strawberry (2)',
        codes: {
            "Уголовный Кодекс": "https://forum.gta5rp.com/threads/ugolovnyi-kodeks.3353488/",
            "Административный Кодекс": "https://forum.gta5rp.com/threads/administrativnyi-kodeks.3353487/",
            "Дорожный Кодекс": "https://forum.gta5rp.com/threads/dorozhnyi-kodeks.3324568/",
            "Процессуальный Кодекс": "https://forum.gta5rp.com/threads/processualnyi-kodeks.3409233/"
        }
    },
    {
        id: 'vinewood-3',
        name: 'VineWood (3)',
        codes: {
            "Уголовный Кодекс": "https://forum.gta5rp.com/threads/ugolovnyi-kodeks-shtata-san-andreas.3297692/",
            "Административный Кодекс": "https://forum.gta5rp.com/threads/administrativnyi-kodeks-shtata-san-andreas.1810951/",
            "Дорожный Кодекс": "https://forum.gta5rp.com/threads/dorozhnyi-kodeks-shtata-san-andreas.1810949/",
            "Процессуальный Кодекс": "https://forum.gta5rp.com/threads/processualnyi-kodeks-shtata-san-andreas.3302709/"
        }
    },
    {
        id: 'blackberry-4',
        name: 'BlackBerry (4)',
        codes: {
            "Уголовный Кодекс": "https://forum.gta5rp.com/threads/ugolovnyi-kodeks-shtata-san-andreas-redakcija-ot-29-marta-2026-goda.826988/",
            "Административный Кодекс": "https://forum.gta5rp.com/threads/administrativnyi-kodeks-shtata-san-andreas-redakcija-ot-29-marta-2025-goda.827016/",
            "Дорожный Кодекс": "https://forum.gta5rp.com/threads/dorozhnyi-kodeks-shtata-san-andreas-redakcija-ot-15-ijunja-2026-goda.826974/",
            "Процессуальный Кодекс": "https://forum.gta5rp.com/threads/processualnyi-kodeks-shtata-san-andreas-redakcija-ot-15-ijunja-2026-goda.826899/"
        }
    },
    {
        id: 'insquad-5',
        name: 'Insquad (5)',
        codes: {
            "Уголовно-административный Кодекс": "https://forum.gta5rp.com/threads/ugolovno-administrativnyi-kodeks.738487/",
            "Дорожный Кодекс": "https://forum.gta5rp.com/threads/dorozhnyi-kodeks.772196/",
            "Процессуальный Кодекс": "https://forum.gta5rp.com/threads/processualnyi-kodeks.772191/"
        }
    },
    {
        id: 'sunrise-6',
        name: 'Sunrise (6)',
        codes: {
            "Уголовно-административный Кодекс": "https://forum.gta5rp.com/threads/ugolovno-administrativnyi-kodeks-shtata-san-andreas-redakcija-ot-30-04-2026.877278/",
            "Дорожный Кодекс": "https://forum.gta5rp.com/threads/dorozhnyi-kodeks-shtata-san-andreas-redakcija-ot-09-08-2025.877271/",
            "Процессуальный Кодекс": "https://forum.gta5rp.com/threads/processualnyi-kodeks-shtata-san-andreas-redakt-ot-30-04-2026.877277/"
        }
    },
    {
        id: 'rainbow-7',
        name: 'Rainbow (7)',
        codes: {
            "Уголовно-административный Кодекс": "https://forum.gta5rp.com/threads/sa-gov-ugolovno-administrativnyi-kodeks-shtata-san-andreas-redakcija-ot-17-ijunja-2026-goda.1616700/",
            "Дорожный Кодекс": "https://forum.gta5rp.com/threads/sa-gov-dorozhnyi-kodeks-shtata-san-andreas-redakcija-ot-23-aprelja-2026-goda.1616715/",
            "Процессуальный Кодекс": "https://forum.gta5rp.com/threads/sa-gov-processualnyi-kodeks-shtata-san-andreas-redakcija-ot-17-ijunja-2026-goda.1616697/"
        }
    },
    {
        id: 'richman-8',
        name: 'Richman (8)',
        codes: {
            "Уголовный Кодекс": "https://forum.gta5rp.com/threads/ugolovnyi-kodeks-shtata-san-andreas.796350/",
            "Административный Кодекс": "https://forum.gta5rp.com/threads/administrativnyi-kodeks-shtata-san-andreas.796349/",
            "Дорожный Кодекс": "https://forum.gta5rp.com/threads/dorozhnyi-kodeks-shtata-san-andreas.796346/",
            "Процессуальный Кодекс": "https://forum.gta5rp.com/threads/processualnyi-kodeks-shtata-san-andreas.796342/"
        }
    },
    {
        id: 'eclipse-9',
        name: 'Eclipse (9)',
        codes: {
            "Уголовный Кодекс": "https://forum.gta5rp.com/threads/ugolovnyi-kodeks-red-ot-05-07-2026.360457/",
            "Административный Кодекс": "https://forum.gta5rp.com/threads/administrativnyi-kodeks-red-ot-26-03-2026.360455/",
            "Дорожный Кодекс": "https://forum.gta5rp.com/threads/dorozhnyi-kodeks-red-ot-26-03-2026.360454/",
            "Процессуальный Кодекс": "https://forum.gta5rp.com/threads/processualnyi-kodeks-red-ot-08-06-2026.360456/"
        }
    },
    {
        id: 'lamesa-10',
        name: 'La Mesa (10)',
        codes: {
            "Уголовно-административный Кодекс": "https://forum.gta5rp.com/threads/ugolovno-administrativnyi-kodeks-shtata-san-andreas.3285817/",
            "Дорожный Кодекс": "https://forum.gta5rp.com/threads/dorozhnyi-kodeks-shtata-san-andreas.3285809/",
            "Процессуальный Кодекс": "https://forum.gta5rp.com/threads/processualnyi-kodeks-shtata-san-andreas.3285816/"
        }
    },
    {
        id: 'burton-11',
        name: 'Burton (11)',
        codes: {
            "Уголовно-административный Кодекс": "https://forum.gta5rp.com/threads/ugolovno-administrativnyi-kodeks-shtata-san-andreas.3303227/",
            "Дорожный Кодекс": "https://forum.gta5rp.com/threads/dorozhnyi-kodeks-shtata-san-andreas.3303236/",
            "Процессуальный Кодекс": "https://forum.gta5rp.com/threads/processualnyi-kodeks-shtata-san-andreas.3303228/"
        }
    },
    {
        id: 'rockford-12',
        name: 'Rockford (12)',
        codes: {
            "Уголовно-административный Кодекс": "https://forum.gta5rp.com/threads/ugolovno-administrativnyi-kodeks-shtata-san-andreas.814371/",
            "Дорожный Кодекс": "https://forum.gta5rp.com/threads/dorozhnyi-kodeks-shtata-san-andreas.823494/",
            "Процессуальный Кодекс": "https://forum.gta5rp.com/threads/processualnyi-kodeks-shtata-san-andreas.814326/"
        }
    },
    {
        id: 'alta-13',
        name: 'Alta (13)',
        codes: {
            "Уголовный Кодекс": "https://forum.gta5rp.com/threads/ugolovnyi-kodeks-redakcija-ot-04-07-2026.947308/",
            "Административный Кодекс": "https://forum.gta5rp.com/threads/administrativnyi-kodeks-redakcija-ot-04-07-2026.947306/",
            "Дорожный Кодекс": "https://forum.gta5rp.com/threads/dorozhnyi-kodeks-redakcija-ot-23-04-2024.947297/",
            "Процессуальный Кодекс": "https://forum.gta5rp.com/threads/processualnyi-kodeks-redakcija-ot-05-05-2026.947305/"
        }
    },
    {
        id: 'delperro-14',
        name: 'Del Perro (14)',
        codes: {
            "Уголовный Кодекс": "https://forum.gta5rp.com/threads/ugolovnyi-kodeks.1500096/",
            "Административный Кодекс": "https://forum.gta5rp.com/threads/administrativnyi-kodeks.1500088/",
            "Дорожный Кодекс": "https://forum.gta5rp.com/threads/dorozhnyi-kodeks.1500184/",
            "Процессуальный Кодекс": "https://forum.gta5rp.com/threads/processualnyi-kodeks.1500059/"
        }
    },
    {
        id: 'davis-15',
        name: 'Davis (15)',
        codes: {
            "Уголовный Кодекс": "https://forum.gta5rp.com/threads/ugolovnyi-kodeks-shtata-san-andreas-redakcija-ot-04-ijunja-2026-goda.1564197/",
            "Административный Кодекс": "https://forum.gta5rp.com/threads/kodeks-ob-administrativnyx-pravonarushenijax-shtata-san-andreas-redakcija-ot-08-aprelja-2026-goda.1564194/",
            "Дорожный Кодекс": "https://forum.gta5rp.com/threads/dorozhnyi-kodeks-shtata-san-andreas-redakcija-ot-04-ijunja-2026-goda.1564206/",
            "Процессуальный Кодекс": "https://forum.gta5rp.com/threads/processualnyi-kodeks-shtata-san-andreas-redakcija-ot-15-maja-2026-goda.1564210/"
        }
    },
    {
        id: 'harmony-16',
        name: 'Harmony (16)',
        codes: {
            "Уголовный Кодекс": "https://forum.gta5rp.com/threads/ugolovnyi-kodeks-shtata-san-andreas.1755373/",
            "Административный Кодекс": "https://forum.gta5rp.com/threads/administrativnyi-kodeks-shtata-san-andreas.1755368/",
            "Дорожный Кодекс": "https://forum.gta5rp.com/threads/dorozhnyi-kodeks-shtata-san-andreas.1755359/",
            "Процессуальный Кодекс": "https://forum.gta5rp.com/threads/processualnyi-kodeks-shtata-san-andreas.1755347/"
        }
    },
    {
        id: 'redwood-17',
        name: 'Redwood (17)',
        codes: {
            "Уголовно-административный Кодекс": "https://forum.gta5rp.com/threads/sa-gov-ugolovno-administrativnyi-kodeks-shtata-san-andreas.1973527/",
            "Дорожный Кодекс": "https://forum.gta5rp.com/threads/sa-gov-dorozhnyi-kodeks-shtata-san-andreas.1973482/",
            "Процессуальный Кодекс": "https://forum.gta5rp.com/threads/sa-gov-processualnyi-kodeks-shtata-san-andreas.1973524/"
        }
    },
    {
        id: 'hawick-18',
        name: 'Hawick (18)',
        codes: {
            "Уголовный Кодекс": "https://forum.gta5rp.com/threads/ugolovnyi-kodeks-shtata-san-andreas.2401791/",
            "Административный Кодекс": "https://forum.gta5rp.com/threads/administrativnyi-kodeks-shtata-san-andreas.2405367/",
            "Дорожный Кодекс": "https://forum.gta5rp.com/threads/dorozhnyi-kodeks-shtata-san-andreas.2405349/",
            "Процессуальный Кодекс": "https://forum.gta5rp.com/threads/processualnyi-kodeks-shtata-san-andreas.2405363/"
        }
    },
    {
        id: 'grapeseed-19',
        name: 'Grapeseed (19)',
        codes: {
            "Уголовный Кодекс": "https://forum.gta5rp.com/threads/ugolovnyi-kodeks.3252140/",
            "Административный Кодекс": "https://forum.gta5rp.com/threads/administrativnyi-kodeks.3252139/",
            "Дорожный Кодекс": "https://forum.gta5rp.com/threads/dorozhnyi-kodeks.3252124/",
            "Процессуальный Кодекс": "https://forum.gta5rp.com/threads/processualnyi-kodeks.3252138/"
        }
    },
    {
        id: 'murrieta-20',
        name: 'Murrieta (20)',
        codes: {
            "Уголовно-административный Кодекс": "https://forum.gta5rp.com/threads/ugolovno-administrativnyi-kodeks-shtata-san-andreas.3237254/",
            "Дорожный Кодекс": "https://forum.gta5rp.com/threads/dorozhnyi-kodeks-shtata-san-andreas.3237239/",
            "Процессуальный Кодекс": "https://forum.gta5rp.com/threads/processualnyi-kodeks-shtata-san-andreas.3237253/"
        }
    },
    {
        id: 'vespucci-21',
        name: 'Vespucci (21)',
        codes: {
            "Уголовный Кодекс": "https://forum.gta5rp.com/threads/ugolovnyi-kodeks-shtata-san-andreas.3276624/",
            "Административный Кодекс": "https://forum.gta5rp.com/threads/administrativnyi-kodeks-shtata-san-andreas.3276619/",
            "Дорожный Кодекс": "https://forum.gta5rp.com/threads/dorozhnyi-kodeks-shtata-san-andreas.3276620/",
            "Процессуальный Кодекс": "https://forum.gta5rp.com/threads/processualnyi-kodeks-shtata-san-andreas.3276628/"
        }
    },
    {
        id: 'milton-22',
        name: 'Milton (22)',
        codes: {
            "Уголовный Кодекс": "https://forum.gta5rp.com/threads/ugolovnyi-kodeks.3322948/",
            "Административный Кодекс": "https://forum.gta5rp.com/threads/administrativnyi-kodeks.3322950/",
            "Дорожный Кодекс": "https://forum.gta5rp.com/threads/dorozhnyi-kodeks.3322939/",
            "Процессуальный Кодекс": "https://forum.gta5rp.com/threads/processualnyi-kodeks.3322955/"
        }
    },
    {
        id: 'lapuerta-23',
        name: 'La Puerta (23)',
        codes: {
            "Уголовный Кодекс": "https://forum.gta5rp.com/threads/ugolovnyi-kodeks-shtata-san-andreas-redakcija-ot-10-ijulja-2026-goda.3364593/",
            "Административный Кодекс": "https://forum.gta5rp.com/threads/kodeks-ob-administrativnyx-pravonarushenijax-shtata-san-andreas-redakcija-ot-21-ijunja-2026-goda.3364595/",
            "Дорожный Кодекс": "https://forum.gta5rp.com/threads/dorozhnyi-kodeks-shtata-san-andreas-redakcija-ot-10-ijulja-2026-goda.3364591/",
            "Процессуальный Кодекс": "https://forum.gta5rp.com/threads/processualnyi-kodeks-shtata-san-andreas-redakcija-ot-10-ijulja-2026-goda.3364588/"
        }
    },
    {
        id: 'senora-24',
        name: 'Senora (24)',
        codes: {
            "Уголовно-административный Кодекс": "https://forum.gta5rp.com/threads/ugolovno-administrativnyi-kodeks-shtata-san-andreas.3389192/",
            "Дорожный Кодекс": "https://forum.gta5rp.com/threads/dorozhnyi-kodeks-shtata-san-andreas.3389189/",
            "Процессуальный Кодекс": "https://forum.gta5rp.com/threads/processualnyi-kodeks-shtata-san-andreas.3389193/"
        }
    }
];

// ============================================================================
// ЛОГИКА СКАЧИВАНИЯ И ПАРСИНГА
// ============================================================================

/**
 * Скачивает HTML страницы через puppeteer-real-browser
 */
async function fetchThreadText(page, url) {
    if (!url || url.includes("СЮДА_ССЫЛКУ")) return null;

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        try {
            await page.waitForSelector('.message-inner .bbWrapper', { timeout: 15000 });
        } catch (e) {
            console.error(`    [Cloudflare/Timeout] Не удалось дождаться контента для ${url}`);
            const html = await page.content();
            console.log("    [DEBUG] HTML страницы:");
            console.log(html.substring(0, 1000)); // Выводим первые 1000 символов, чтобы понять, что там
            return null;
        }

        const html = await page.content();
        const $ = cheerio.load(html);

        // В движке XenForo текст сообщений находится в классе .message-inner .bbWrapper
        // Собираем текст со ВСЕХ сообщений на странице, так как длинные кодексы могут быть разбиты на несколько постов
        const posts = $('.message-inner .bbWrapper');
        let fullText = '';

        posts.each((i, el) => {
            const post = $(el);
            
            // Заменяем теги <br> на настоящие переносы строк (\n), чтобы регулярки сработали
            post.find('br').replaceWith('\n');
            
            // Вставляем переносы строк вокруг блочных элементов, чтобы текст не слипался
            post.find('p, div, li, h1, h2, h3, h4, h5, h6, ul, ol, table, tr, td, th, tbody, thead, blockquote').prepend('\n').append('\n');

            // Достаем очищенный текст поста и добавляем к общему тексту
            fullText += post.text() + '\n\n';
        });

        return fullText;
    } catch (e) {
        console.error(`[Ошибка] Не удалось скачать ${url}:`, e.message);
        return null;
    }
}

/**
 * Разбивает сплошной текст на Главы и Статьи с помощью регулярных выражений.
 * Это та же самая логика, которая используется у вас в Lexis-App для импорта текста!
 */
function parseTextToArticles(rawText, categoryName) {
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const articles = [];

    let currentChapterTitle = '';

    let currentArticleNumber = '';
    let currentArticleName = '';

    let currentPartNumber = '';
    let currentPartText = [];

    const chapterRegex = /^(?:Глава|Раздел|Часть)\s+([IVX\d]+)\.?\s*(.*)$/i;
    const articleRegex = /^(?:[^a-zа-я0-9\[\(\{]+|(?:\[|\(|\{)[^\]\)\}]*(?:\]|\)|\}))*\s*(?:(?:Статья|Ст\.?|Пункт|П\.?)\s*(\d+(?:\.\d+)*)|(\d+(?:\.\d+)+))\.?\s*(.*)$/i;
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

    // Сохраняем последнюю статью в конце файла
    saveCurrentPart();
    
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

// ============================================================================
// ГЛАВНЫЙ ЦИКЛ
// ============================================================================

async function run() {
    console.log('=== Запуск парсера законов GTA5RP ===\n');

    // Запускаем браузер один раз на все запросы
    console.log('⏳ Запуск браузера для обхода Cloudflare...');
    const { browser, page } = await connect({
        headless: 'auto',
        turnstile: true
    });
    console.log('✅ Браузер запущен!\n');

    let errorLog = [];

    for (const server of SERVERS) {
        console.log(`⏳ Обработка сервера: ${server.name}`);
        const serverData = []; // Массив, который будет сохранен в .json
        let serverHasErrors = false;
        let serverErrorText = `Сервер: ${server.name}\n`;

        for (const [codeName, url] of Object.entries(server.codes)) {
            if (!url || url === 'СЮДА_ССЫЛКУ') {
                console.log(`  [Пропуск] ${codeName} (ссылка не указана)`);
                serverErrorText += `  - ${codeName}: Ссылка не указана\n`;
                serverHasErrors = true;
                continue;
            }

            console.log(`  [Скачивание] ${codeName}...`);

            let rawText = null;
            let attempts = 0;
            const maxAttempts = 3;

            while (attempts < maxAttempts) {
                attempts++;
                rawText = await fetchThreadText(page, url);

                if (rawText) {
                    break; // Успешно скачали
                } else if (attempts < maxAttempts) {
                    console.log(`    [Повтор] Ошибка скачивания, попытка ${attempts + 1} из ${maxAttempts}...`);
                    await new Promise(r => setTimeout(r, 3000)); // Пауза перед повторной попыткой
                }
            }

            if (rawText) {
                const parsedArticles = parseTextToArticles(rawText, codeName);
                if (parsedArticles.length > 0) {
                    serverData.push({
                        name: codeName,
                        articles: parsedArticles
                    });
                    console.log(`    ✓ Найдено: ${parsedArticles.length} (глав и статей)`);
                } else {
                    console.log(`    ⚠ Текст скачан, но не удалось распознать структуру статей.`);
                    serverErrorText += `  - ${codeName}: Текст скачан, но не удалось распознать структуру (возможно, пустой текст или изменился формат)\n`;
                    serverHasErrors = true;
                    // Сохраняем текст в файл для отладки
                    const safeName = codeName.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_');
                    fs.writeFileSync(path.join(OUTPUT_DIR, `failed_${server.id}_${safeName}.txt`), rawText, 'utf-8');
                }
            } else {
                console.log(`    ❌ Ошибка скачивания после ${maxAttempts} попыток.`);
                serverErrorText += `  - ${codeName}: Ошибка скачивания после ${maxAttempts} попыток (возможно блокировка Cloudflare или неверная ссылка)\n`;
                serverHasErrors = true;
            }

            // Пауза 2 секунды между запросами, чтобы форум не заблокировал IP за DDoS
            await new Promise(r => setTimeout(r, 2000));
        }

        if (serverHasErrors) {
            errorLog.push(serverErrorText);
        }

        // Сохраняем JSON файл для сервера
        if (serverData.length > 0) {
            const outPath = path.join(OUTPUT_DIR, `${server.id}.json`);
            // Формат полностью совместим с Lexis-App
            fs.writeFileSync(outPath, JSON.stringify({ data: serverData }, null, 2), 'utf-8');
            console.log(`✅ Сохранено: output/${server.id}.json\n`);
        } else {
            console.log(`❌ Нет данных для сохранения: ${server.name}\n`);
        }
    }

    // Сохранение лога ошибок в текстовый файл
    if (errorLog.length > 0) {
        const now = new Date();
        const dateStr = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
        const logFileName = `database[${dateStr}].txt`;
        const logFilePath = path.join(OUTPUT_DIR, logFileName);

        const fileHeader = `=== Отчет об ошибках парсинга от ${dateStr} ===\n\nНиже перечислены кодексы, которые не удалось скачать или распознать:\n\n`;
        fs.writeFileSync(logFilePath, fileHeader + errorLog.join('\n'));
        console.log(`📝 Отчет об ошибках сохранен в: ${logFileName}`);
    }

    await browser.close();
    console.log('🎉 Парсинг успешно завершен! Файлы лежат в папке output.');
}

run();
