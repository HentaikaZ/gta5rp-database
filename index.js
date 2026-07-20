const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// ============================================================================
// НАСТРОЙКИ ОБХОДА CLOUDFLARE (ДЛЯ GITHUB ACTIONS)
// ============================================================================
// Так как GitHub Actions блокируется Cloudflare, нам нужен сервис-обходчик.
// ScrapingAnt дает 10,000 бесплатных запросов в месяц (хватит на обновления каждый день).
// Зарегистрируйтесь на https://scrapingant.com/ и вставьте ключ сюда, 
// либо передайте через процесс окружения (в GitHub Secrets).
const SCRAPINGANT_API_KEY = process.env.SCRAPINGANT_API_KEY || ""; 

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
            "Дорожный Кодекс": "https://forum.gta5rp.com/threads/dorozhnyi-kodeks.1360667/",
            "Процессуальный Кодекс": "https://forum.gta5rp.com/threads/processualnyi-kodeks.738491/"
        }
    },
    {
        id: 'sunrise-6',
        name: 'Sunrise (6)',
        codes: {
            "Уголовный Кодекс": "СЮДА_ССЫЛКУ",
            "Административный Кодекс": "СЮДА_ССЫЛКУ",
            "Дорожный Кодекс": "СЮДА_ССЫЛКУ",
            "Процессуальный Кодекс": "СЮДА_ССЫЛКУ"
        }
    },
    {
        id: 'rainbow-7',
        name: 'Rainbow (7)',
        codes: {
            "Уголовный Кодекс": "СЮДА_ССЫЛКУ",
            "Административный Кодекс": "СЮДА_ССЫЛКУ",
            "Дорожный Кодекс": "СЮДА_ССЫЛКУ",
            "Процессуальный Кодекс": "СЮДА_ССЫЛКУ"
        }
    },
    {
        id: 'richman-8',
        name: 'Richman (8)',
        codes: {
            "Уголовный Кодекс": "СЮДА_ССЫЛКУ",
            "Административный Кодекс": "СЮДА_ССЫЛКУ",
            "Дорожный Кодекс": "СЮДА_ССЫЛКУ",
            "Процессуальный Кодекс": "СЮДА_ССЫЛКУ"
        }
    },
    {
        id: 'eclipse-9',
        name: 'Eclipse (9)',
        codes: {
            "Уголовный Кодекс": "СЮДА_ССЫЛКУ",
            "Административный Кодекс": "СЮДА_ССЫЛКУ",
            "Дорожный Кодекс": "СЮДА_ССЫЛКУ",
            "Процессуальный Кодекс": "СЮДА_ССЫЛКУ"
        }
    },
    {
        id: 'lamesa-10',
        name: 'La Mesa (10)',
        codes: {
            "Уголовный Кодекс": "СЮДА_ССЫЛКУ",
            "Административный Кодекс": "СЮДА_ССЫЛКУ",
            "Дорожный Кодекс": "СЮДА_ССЫЛКУ",
            "Процессуальный Кодекс": "СЮДА_ССЫЛКУ"
        }
    },
    {
        id: 'burton-11',
        name: 'Burton (11)',
        codes: {
            "Уголовный Кодекс": "СЮДА_ССЫЛКУ",
            "Административный Кодекс": "СЮДА_ССЫЛКУ",
            "Дорожный Кодекс": "СЮДА_ССЫЛКУ",
            "Процессуальный Кодекс": "СЮДА_ССЫЛКУ"
        }
    },
    {
        id: 'rockford-12',
        name: 'Rockford (12)',
        codes: {
            "Уголовный Кодекс": "СЮДА_ССЫЛКУ",
            "Административный Кодекс": "СЮДА_ССЫЛКУ",
            "Дорожный Кодекс": "СЮДА_ССЫЛКУ",
            "Процессуальный Кодекс": "СЮДА_ССЫЛКУ"
        }
    },
    {
        id: 'alta-13',
        name: 'Alta (13)',
        codes: {
            "Уголовный Кодекс": "СЮДА_ССЫЛКУ",
            "Административный Кодекс": "СЮДА_ССЫЛКУ",
            "Дорожный Кодекс": "СЮДА_ССЫЛКУ",
            "Процессуальный Кодекс": "СЮДА_ССЫЛКУ"
        }
    },
    {
        id: 'delperro-14',
        name: 'Del Perro (14)',
        codes: {
            "Уголовный Кодекс": "СЮДА_ССЫЛКУ",
            "Административный Кодекс": "СЮДА_ССЫЛКУ",
            "Дорожный Кодекс": "СЮДА_ССЫЛКУ",
            "Процессуальный Кодекс": "СЮДА_ССЫЛКУ"
        }
    },
    {
        id: 'davis-15',
        name: 'Davis (15)',
        codes: {
            "Уголовный Кодекс": "СЮДА_ССЫЛКУ",
            "Административный Кодекс": "СЮДА_ССЫЛКУ",
            "Дорожный Кодекс": "СЮДА_ССЫЛКУ",
            "Процессуальный Кодекс": "СЮДА_ССЫЛКУ"
        }
    },
    {
        id: 'harmony-16',
        name: 'Harmony (16)',
        codes: {
            "Уголовный Кодекс": "СЮДА_ССЫЛКУ",
            "Административный Кодекс": "СЮДА_ССЫЛКУ",
            "Дорожный Кодекс": "СЮДА_ССЫЛКУ",
            "Процессуальный Кодекс": "СЮДА_ССЫЛКУ"
        }
    },
    {
        id: 'redwood-17',
        name: 'Redwood (17)',
        codes: {
            "Уголовный Кодекс": "СЮДА_ССЫЛКУ",
            "Административный Кодекс": "СЮДА_ССЫЛКУ",
            "Дорожный Кодекс": "СЮДА_ССЫЛКУ",
            "Процессуальный Кодекс": "СЮДА_ССЫЛКУ"
        }
    },
    {
        id: 'hawick-18',
        name: 'Hawick (18)',
        codes: {
            "Уголовный Кодекс": "СЮДА_ССЫЛКУ",
            "Административный Кодекс": "СЮДА_ССЫЛКУ",
            "Дорожный Кодекс": "СЮДА_ССЫЛКУ",
            "Процессуальный Кодекс": "СЮДА_ССЫЛКУ"
        }
    },
    {
        id: 'grapeseed-19',
        name: 'Grapeseed (19)',
        codes: {
            "Уголовный Кодекс": "СЮДА_ССЫЛКУ",
            "Административный Кодекс": "СЮДА_ССЫЛКУ",
            "Дорожный Кодекс": "СЮДА_ССЫЛКУ",
            "Процессуальный Кодекс": "СЮДА_ССЫЛКУ"
        }
    },
    {
        id: 'murrieta-20',
        name: 'Murrieta (20)',
        codes: {
            "Уголовный Кодекс": "СЮДА_ССЫЛКУ",
            "Административный Кодекс": "СЮДА_ССЫЛКУ",
            "Дорожный Кодекс": "СЮДА_ССЫЛКУ",
            "Процессуальный Кодекс": "СЮДА_ССЫЛКУ"
        }
    },
    {
        id: 'vespucci-21',
        name: 'Vespucci (21)',
        codes: {
            "Уголовный Кодекс": "СЮДА_ССЫЛКУ",
            "Административный Кодекс": "СЮДА_ССЫЛКУ",
            "Дорожный Кодекс": "СЮДА_ССЫЛКУ",
            "Процессуальный Кодекс": "СЮДА_ССЫЛКУ"
        }
    },
    {
        id: 'milton-22',
        name: 'Milton (22)',
        codes: {
            "Уголовный Кодекс": "СЮДА_ССЫЛКУ",
            "Административный Кодекс": "СЮДА_ССЫЛКУ",
            "Дорожный Кодекс": "СЮДА_ССЫЛКУ",
            "Процессуальный Кодекс": "СЮДА_ССЫЛКУ"
        }
    },
    {
        id: 'lapuerta-23',
        name: 'La Puerta (23)',
        codes: {
            "Уголовный Кодекс": "СЮДА_ССЫЛКУ",
            "Административный Кодекс": "СЮДА_ССЫЛКУ",
            "Дорожный Кодекс": "СЮДА_ССЫЛКУ",
            "Процессуальный Кодекс": "СЮДА_ССЫЛКУ"
        }
    },
    {
        id: 'senora-24',
        name: 'Senora (24)',
        codes: {
            "Уголовный Кодекс": "СЮДА_ССЫЛКУ",
            "Административный Кодекс": "СЮДА_ССЫЛКУ",
            "Дорожный Кодекс": "СЮДА_ССЫЛКУ",
            "Процессуальный Кодекс": "СЮДА_ССЫЛКУ"
        }
    }
];

// ============================================================================
// ЛОГИКА СКАЧИВАНИЯ И ПАРСИНГА
// ============================================================================

/**
 * Скачивает HTML страницы. Если указан SCRAPINGANT_API_KEY, использует его для обхода Cloudflare.
 */
async function fetchThreadText(url) {
    if (!url || url.includes("СЮДА_ССЫЛКУ")) return null;
    
    try {
        let fetchUrl = url;
        if (SCRAPINGANT_API_KEY) {
            fetchUrl = `https://api.scrapingant.com/v2/general?url=${encodeURIComponent(url)}&x-api-key=${SCRAPINGANT_API_KEY}&browser=false`;
        }
        
        const response = await axios.get(fetchUrl);
        const html = response.data;
        
        const $ = cheerio.load(html);
        
        // В движке XenForo текст первого сообщения находится в классе .message-inner .bbWrapper
        const firstPost = $('.message-inner .bbWrapper').first();
        
        // Заменяем теги <br> на настоящие переносы строк (\n), чтобы регулярки сработали
        firstPost.find('br').replaceWith('\n');
        
        // Убираем скрытый текст (спойлеры), цитаты и прочий мусор, если нужно
        firstPost.find('.bbCodeBlock-quote').remove();
        
        // Достаем очищенный текст
        return firstPost.text();
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
    
    let currentArticleTitle = '';
    let currentArticleText = [];
    let currentChapterTitle = '';
    
    const chapterRegex = /^(?:Глава|Раздел|Часть)\s+([IVX\d]+)\.?\s*(.*)$/i;
    const articleRegex = /^(?:Статья|Ст\.?|Пункт|П\.?)\s*(\d+(?:\.\d+)*)\.?\s*(.*)$/i;
    
    function saveCurrentArticle() {
        if (currentArticleTitle) {
            articles.push({
                title: currentArticleTitle,
                text: currentArticleText.join('\n').trim(),
                category: categoryName,
                isChapter: false
            });
        }
    }
    
    for (const line of lines) {
        // Проверяем, глава ли это
        const chapterMatch = line.match(chapterRegex);
        if (chapterMatch) {
            saveCurrentArticle();
            currentArticleTitle = '';
            currentArticleText = [];
            currentChapterTitle = line; // Например: "Глава 1. Общие положения"
            
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
            saveCurrentArticle();
            currentArticleTitle = line; // Например: "Статья 1.1"
            currentArticleText = [];
            continue;
        }
        
        // Если это просто текст, добавляем его к текущей статье
        if (currentArticleTitle) {
            currentArticleText.push(line);
        }
    }
    
    // Сохраняем последнюю статью в конце файла
    saveCurrentArticle();
    return articles;
}

// ============================================================================
// ГЛАВНЫЙ ЦИКЛ
// ============================================================================

async function run() {
    console.log('=== Запуск парсера законов GTA5RP ===\n');

    for (const server of SERVERS) {
        console.log(`⏳ Обработка сервера: ${server.name}`);
        const serverData = []; // Массив, который будет сохранен в .json
        
        for (const [codeName, url] of Object.entries(server.codes)) {
            if (!url || url === 'СЮДА_ССЫЛКУ') {
                console.log(`  [Пропуск] ${codeName} (ссылка не указана)`);
                continue;
            }
            
            console.log(`  [Скачивание] ${codeName}...`);
            const rawText = await fetchThreadText(url);
            
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
                }
            }
            
            // Пауза 2 секунды между запросами, чтобы форум не заблокировал IP за DDoS
            await new Promise(r => setTimeout(r, 2000));
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
    
    console.log('🎉 Парсинг успешно завершен! Файлы лежат в папке output.');
}

run();
