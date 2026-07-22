const { connect } = require('puppeteer-real-browser');
const cheerio = require('cheerio');
const fs = require('fs');

async function testDKFull() {
    let browser;
    try {
        const response = await connect({
            headless: 'auto',
            turnstile: true
        });
        browser = response.browser;
        const page = response.page;
        
        await page.goto('https://forum.gta5rp.com/threads/dorozhnyi-kodeks.772196/', { waitUntil: 'domcontentloaded' });
        await new Promise(r => setTimeout(r, 5000));
        
        const html = await page.content();
        const $ = cheerio.load(html);
        
        const posts = $('.message-inner .bbWrapper');
        let fullText = '';

        posts.each((i, el) => {
            const post = $(el);
            post.find('br').replaceWith('\n');
            post.find('p, div, li, h1, h2, h3, h4, h5, h6, ul, ol, table, tr, td, th, tbody, thead, blockquote').prepend('\n').append('\n');
            fullText += post.text() + '\n\n';
        });

        fs.writeFileSync('dk_full.txt', fullText);
        console.log("Saved to dk_full.txt");
        
    } catch (e) {
        console.error(e);
    } finally {
        if (browser) await browser.close();
    }
}
testDKFull();
