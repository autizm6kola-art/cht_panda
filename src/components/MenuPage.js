import React, { useEffect, useState } from 'react';
import { clearAllAnswers, getUserInputs } from '../utils/storage';
import BackButton from './BackButton';
import ProgressBar from './ProgressBar';
import '../styles/menuPage.css';

function MenuPage({ allTasks, onSelectRange }) {
  const [correctWordsCount, setCorrectWordsCount] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [rangesProgress, setRangesProgress] = useState({}); // ключ: "startId-endId", значение: {correct, total}

  useEffect(() => {
    let total = 0;
    let correct = 0;

    allTasks.forEach(task => {
      const words = task.content.filter(item => item.type === 'word');
      total += words.length;

      const savedInputs = getUserInputs(task.id);
      if (savedInputs && Array.isArray(savedInputs[0])) {
        correct += savedInputs[0].length;
      }
    });

    setTotalWords(total);
    setCorrectWordsCount(correct);

    // ДИАПОЗОН — количество заданий в одной кнопке
    const rangeSize = 15;
    const newRangesProgress = {};

    for (let i = 0; i < allTasks.length; i += rangeSize) {
      const rangeTasks = allTasks.slice(i, i + rangeSize);
      const startId = rangeTasks[0].id;
      const endId = rangeTasks[rangeTasks.length - 1].id;

      let rangeTotal = 0;
      let rangeCorrect = 0;

      rangeTasks.forEach(task => {
        const words = task.content.filter(item => item.type === 'word');
        rangeTotal += words.length;

        const savedInputs = getUserInputs(task.id);
        if (savedInputs && Array.isArray(savedInputs[0])) {
          rangeCorrect += savedInputs[0].length;
        }
      });

      newRangesProgress[`${startId}-${endId}`] = {
        correct: rangeCorrect,
        total: rangeTotal
      };
    }

    setRangesProgress(newRangesProgress);
  }, [allTasks]);

  // Функция, чтобы определить цвет кнопки по прогрессу
  const getButtonColor = (correct, total) => {
    if (correct === 0) return 'lightgray'; // ничего не сделано
    if (correct === total) return '#1ae63cc3'; // полностью сделано
    return '#fef60091'; // частично сделано
  };

  return (
    <div className="menu-container">
      <BackButton />
      <h1 className="menu-title">Кунг-фу панда.</h1>

      <ProgressBar correct={correctWordsCount} total={totalWords} />

      <p className="menu-progress-text">
        Прочитано слов: {correctWordsCount} из {totalWords}
      </p>

      <div className="range-buttons-wrapper">
        {Object.entries(rangesProgress).map(([rangeKey, { correct, total }], index) => {
          const btnColor = getButtonColor(correct, total);
            return (
              <button
                key={rangeKey}
                className="range-button"
                 style={{ backgroundColor: btnColor }}
                onClick={() => onSelectRange(rangeKey)}
              >
                {index + 1}
              </button>
            );
        })}

      </div>

      <div className="reset-button-contaner">
        <button
          className="reset-button"
          onClick={() => {
            clearAllAnswers();
            window.location.reload();
          }}
        >
          Сбросить все ответы
        </button>
      </div>
    </div>
  );
}

export default MenuPage;
