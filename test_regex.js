const text1 = '🟢 [А](ОБЩАЯ) 6.1 Нанесение';
const text2 = '[C}6.4.* (ФЕДЕРАЛЬНЫЙ/РЕГИОНАЛЬНЫЙ)';
const text3 = '[А]6.1. (РЕГИОНАЛЬНЫЙ) Умышленное нанесение';
const text4 = '***Статья 1.2 Описание';

// Matches:
// 1. Any non-alphanumeric chars (excluding brackets which are handled below)
// 2. OR bracketed tags like [A], (ОБЩАЯ), [С}
// repeated 0 or more times, followed by optional spaces.
// Then "Статья " (optional) and the number.
const r = /^(?:[^a-zа-я0-9\[\(\{]+|(?:\[|\(|\{)[^\]\)\}]*(?:\]|\)|\}))*\s*(?:(?:Статья|Ст\.?|Пункт|П\.?)\s*(\d+(?:\.\d+)*)|(\d+(?:\.\d+)+))\.?\s*(.*)$/i;

console.log(r.exec(text1));
console.log(r.exec(text2));
console.log(r.exec(text3));
console.log(r.exec(text4));
