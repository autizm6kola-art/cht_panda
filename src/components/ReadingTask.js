


import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import styles from '../styles/ReadingPage.module.css';
import SentenceDisplay from "./SentenceDisplay";
import { saveCorrectInput, getUserInputs, saveUserInputs } from "../utils/storage";
import { createSpeechRecognizer } from "../utils/bookUtils";
import { addTodayWords } from "../utils/dailyStats";


function normalizeToArray(text) {
  return text
    .toLowerCase()
    .replace(/[.,!?;:«»"()\r\n]/g, "")  // Убрали лишнее экранирование
    .split(/\s+/)
    .filter(Boolean);
}

export default function ReadingTask({ task }) {
  const [isListening, setIsListening] = useState(false);
  const [highlightedIndexes, setHighlightedIndexes] = useState([]);
  const [isStopped, setIsStopped] = useState(false); // ⬅️ ОТВЕЧАЕТ ЗА ЗЕЛЁНЫЙ ФОН
  const recognizerRef = useRef(null);

  // 🔴 Запись
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);

  const content = useMemo(() => task.content || [], [task.content]); // Мемоизация content, чтобы избежать лишних пересозданий

  const totalWords = content.filter(item => item.type === "word").length;

  useEffect(() => {
    const saved = getUserInputs(task.id);
    if (saved?.[0]) {
      setHighlightedIndexes(saved[0]);
    }
  }, [task.id]);

  // Оборачиваем handleResult в useCallback
  const handleResult = useCallback((transcript) => {
    const spokenTokens = normalizeToArray(transcript);
    const availableTokens = [...spokenTokens];

    const newMatchedIndexes = [];

    content.forEach((item, index) => {
      if (item.type !== "word") return;
      const clean = item.word.toLowerCase().replace(/[.,!?;:«»"()\r\n]/g, "");
      const foundIndex = availableTokens.findIndex(tok => tok === clean);
      if (foundIndex !== -1) {
        newMatchedIndexes.push(index);
        availableTokens.splice(foundIndex, 1);
      }
    });

    // Получаем старые сохранённые индексы
const saved = getUserInputs(task.id);
const oldIndexes = saved?.[0] || [];

// Определяем НОВЫЕ слова
const trulyNew = newMatchedIndexes.filter(
  (index) => !oldIndexes.includes(index)
);

// 👉 увеличиваем счётчик сегодняшнего дня
addTodayWords(trulyNew.length);

// Сохраняем обновлённые индексы
setHighlightedIndexes(newMatchedIndexes);
saveUserInputs(task.id, [newMatchedIndexes]);


    if (newMatchedIndexes.length >= totalWords / 2) {
      saveCorrectInput(task.id, 0);
    }

    // 👉 Событие обновления прогресса
    window.dispatchEvent(new Event('progressUpdated'));
  }, [content, task.id, totalWords]);  // Зависимости: content, task.id, totalWords

  // Добавляем handleResult в зависимости useEffect
  useEffect(() => {
    if (isListening && !recognizerRef.current) {
      recognizerRef.current = createSpeechRecognizer({
        onResult: handleResult,
        onEnd: () => setIsListening(false),
      });
      recognizerRef.current.start();
    }

    if (!isListening && recognizerRef.current) {
      recognizerRef.current.stop();
      recognizerRef.current = null;
    }

    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
        recognizerRef.current = null;
      }
    };
  }, [isListening, handleResult]);  // Добавили handleResult

  // 🔴 Начать запись
  const startRecording = async () => {
    recordedChunks.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        a.download = `reading-${task.id}-${timestamp}.webm`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
      };

      mediaRecorder.start();
    } catch (err) {
      console.error("Ошибка доступа к микрофону", err);
      alert("Не удалось начать запись. Разрешите доступ к микрофону.");
    }
  };

  // 🔴 Остановить запись
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleStart = () => {
    setIsStopped(false); // ⬅️ при старте чтения фон НЕ зелёный
    setIsListening(true);
    startRecording();
  };

  const handleStop = () => {
    setIsListening(false);
    setIsStopped(true); // ⬅️ фон станет зелёным только здесь
    stopRecording();
  };

  return (
    <div
      className={`${styles.container} ${isStopped ? styles.completed : ""}`}
    >
      <div className={styles.row}>
        <SentenceDisplay content={content} highlightedIndexes={highlightedIndexes} />

        <button
          className={styles.button}
          onClick={handleStart}
          disabled={isListening}
          title="Начать читать"
        >
          ▶️
        </button>

        {/* <button
          className={styles.button}
          onClick={handleStop}
          disabled={!isListening}
          title="Стоп"
        >
          ⏹️
        </button> */}
      </div>
    </div>
  );
}
