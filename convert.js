const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'input.txt');
const outputPath = path.join(__dirname, 'public', 'data', 'book.json');

const rawText = fs.readFileSync(inputPath, 'utf-8');

const pagesRaw = rawText.split(/--- PAGE START ---|--- PAGE END ---/).map(s => s.trim()).filter(Boolean);

const pages = [];

pagesRaw.forEach((pageText, pageIndex) => {
  // Получаем строки по переносам
  const lines = pageText.split('\n').map(l => l.trim()).filter(Boolean);

  // Ищем заголовок (опционально)
  let title = null;
  if (lines[0] && lines[0].startsWith('#TITLE:')) {
    title = lines[0].replace('#TITLE:', '').trim();
    lines.shift(); // удаляем заголовок из текста
  }

  // Собираем предложения как строки, их может быть несколько
  // Предположим, что оставшиеся строки — это предложения, можно склеить их в абзацы или оставить как есть
  // Здесь я оставлю каждую строку как отдельное предложение

  const sentences = lines.map((sentenceText, sentenceIndex) => {
    // Разбиваем на слова (простая регулярка, можно улучшить)
    // Например, учитываем дефисы, апострофы, буквы, цифры
    const wordsRaw = sentenceText.match(/\b[\wа-яё'-]+\b/gi) || [];

    const words = wordsRaw.map((w, i) => ({
      id: i + 1,
      word: w,
    }));

    return {
      id: sentenceIndex + 1,
      text: sentenceText,
      words,
    };
  });

  pages.push({
    id: pageIndex + 1,
    title,
    sentences,
  });
});

// Убедимся, что папка существует
const dataDir = path.dirname(outputPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(pages, null, 2), 'utf-8');

console.log(`✅ Готово! Обработано страниц: ${pages.length}`);
console.log(`➡️ Файл сохранён: ${outputPath}`);
