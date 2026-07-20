const cheerio = require('cheerio');
const html = `
<div class="message-inner">
    <div class="bbWrapper">
        <p>Статья 6. Презумпция невиновности</p>
        <p>ч. 1 Обвиняемый считается невиновным</p>
        <div>Статья 7. Свобода оценки</div>
        ч. 1 Судья...<br>ч. 2 Никакие...
    </div>
</div>
`;
const $ = cheerio.load(html);
const root = $('.bbWrapper');
root.find('br').replaceWith('\n');
root.find('p, div, li, h1, h2, h3, h4, h5, h6, ul, ol').prepend('\n').append('\n');
const text = root.text();
console.log(text.split('\n').map(l => l.trim()).filter(l => l.length > 0).join(' | '));
