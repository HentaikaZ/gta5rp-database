const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://forum.gta5rp.com/threads/ugolovno-administrativnyi-kodeks-shtata-san-andreas.1458592/');
    const html = await page.content();
    console.log("HTML snippets:");
    const match1 = html.match(/sitekey['\"]\s*:\s*['\"]([^'\"]+)['\"]/i);
    const match2 = html.match(/data-sitekey=['\"]([^'\"]+)['\"]/i);
    const match3 = html.match(/"sitekey"\s*:\s*"([^"]+)"/i);
    console.log(match1 ? match1[1] : 'not found 1');
    console.log(match2 ? match2[1] : 'not found 2');
    console.log(match3 ? match3[1] : 'not found 3');
    await browser.close();
})();
