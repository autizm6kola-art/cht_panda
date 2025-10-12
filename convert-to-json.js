const fs = require("fs");
const path = require("path");

const inputPath = path.join(__dirname, "input.txt");
const outputPath = path.join(__dirname, "public", "data", "book.json");

// Читаем исходный текст
const rawText = fs.readFileSync(inputPath, "utf-8");

// Разбиваем на предложения
const sentences = rawText
  .split(/(?<=[.!?…])\s+(?=[А-ЯЁ])/g) // регулярка: точка/воскл./вопрос + пробел + заглавная буква
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

// Генерируем массив объектов
const result = {
  sentences: sentences.map((text, index) => ({
    id: index + 1,
    text
  }))
};

// Убедимся, что папка public/data существует
const dataDir = path.join(__dirname, "public", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Сохраняем как JSON
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");

console.log(`✅ Готово! Обработано предложений: ${result.sentences.length}`);
console.log(`➡️ Файл сохранён как: public/data/book.json`);
