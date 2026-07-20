const { connect } = require('puppeteer-real-browser');
const cheerio = require('cheerio');
const fs = require('fs');

async function run() {
    const { browser, page } = await connect({
        headless: 'auto',
        turnstile: true
    });
    
    try {
        await page.goto('https://forum.gta5rp.com/threads/dorozhnyi-kodeks.1360667/', { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.message-inner .bbWrapper', { timeout: 15000 });
        const html = await page.content();
        
        const $ = cheerio.load(html);
        const firstPost = $('.message-inner .bbWrapper').first();
        firstPost.find('br').replaceWith('\n');
        firstPost.find('p, div, li, h1, h2, h3, h4, h5, h6, ul, ol, table, tr, td, th, tbody, thead, blockquote').prepend('\n').append('\n');
        
        const rawText = firstPost.text();
        fs.writeFileSync('debug_insquad.txt', rawText, 'utf-8');
        console.log('Saved to debug_insquad.txt');
    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}
run();
