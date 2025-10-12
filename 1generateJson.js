const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, 'input.txt');
const OUTPUT_FILE = path.join(__dirname, 'tasks_chtenie.json');

const inputText = fs.readFileSync(INPUT_FILE, 'utf-8');

const pagesRaw = inputText.split('--- PAGE START ---').slice(1);

const tasks = pagesRaw.map((pageBlock, index) => {
  const [headerLine, ...textLines] = pageBlock
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && line !== '--- PAGE END ---');

  const titleMatch = headerLine.match(/^#TITLE:\s*(\d+)/);
  const title = titleMatch ? parseInt(titleMatch[1]) : index + 1;

  const text = textLines.join(' ');

  const content = [];
  const wordRegex = /[\p{L}\p{N}]+|[.,!?;:—–\-()"«»]/gu;

  let match;
  while ((match = wordRegex.exec(text)) !== null) {
    const token = match[0];
    const isWord = /\p{L}/u.test(token);

    content.push({
      word: token,
      type: isWord ? "word" : "punctuation"
    });
  }

  return {
    id: title,
    content
  };
});

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(tasks, null, 2), 'utf-8');

console.log('✅ tasks_chtenie.json создан как массив задач');
