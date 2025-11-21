
import React, { useState, useEffect, useRef } from "react";
import styles from '../styles/ReadingPage.module.css';
import SentenceDisplay from "./SentenceDisplay";
import { saveCorrectInput, getUserInputs, saveUserInputs } from "../utils/storage";
import { createSpeechRecognizer } from "../utils/bookUtils";

function normalizeToArray(text) {
  return text
    .toLowerCase()
    .replace(/[.,!?;:«»"()\r\n\-]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

export default function ReadingTask({ task }) {
  const [isListening, setIsListening] = useState(false);
  const [highlightedIndexes, setHighlightedIndexes] = useState([]);
  const recognizerRef = useRef(null);

  // 🔴 Запись
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);

  const content = task.content || [];
  const totalWords = content.filter(item => item.type === "word").length;

  useEffect(() => {
    const saved = getUserInputs(task.id);
    if (saved?.[0]) {
      setHighlightedIndexes(saved[0]);
    }
  }, [task.id]);

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
  }, [isListening]);

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

  function handleResult(transcript) {
    const spokenTokens = normalizeToArray(transcript);
    const availableTokens = [...spokenTokens];

    const newMatchedIndexes = [];

    content.forEach((item, index) => {
      if (item.type !== "word") return;
      const clean = item.word.toLowerCase().replace(/[.,!?;:«»"()\r\n\-]/g, "");
      const foundIndex = availableTokens.findIndex(tok => tok === clean);
      if (foundIndex !== -1) {
        newMatchedIndexes.push(index);
        availableTokens.splice(foundIndex, 1);
      }
    });

    setHighlightedIndexes(newMatchedIndexes);
    saveUserInputs(task.id, [newMatchedIndexes]);

    if (newMatchedIndexes.length >= totalWords / 2) {
      saveCorrectInput(task.id, 0);
    }
  }

  const handleStart = () => {
    setIsListening(true);
    startRecording(); // ⬅️ запись
  };

  const handleStop = () => {
    setIsListening(false);
    stopRecording(); // ⬅️ сохранить файл
  };

  return (
    <div className={`${styles.container} ${
      highlightedIndexes.length > 0 ? styles.completed : ""
    }`}
  >
      <div className={styles.row}>

      <SentenceDisplay content={content} highlightedIndexes={highlightedIndexes} />
        <button
          className={styles.button}
          onClick={handleStart}
          disabled={isListening}
          title="Начать читать"
        >
          {/* <svg width="20" height="20" viewBox="0 0 20 20" fill="#000" xmlns="http://www.w3.org/2000/svg">
    <polygon points="5,3 15,10 5,17" />
  </svg> */}
          ▶️
        </button>

        <button
          className={styles.button}
          onClick={handleStop}
          disabled={!isListening}
          title="Стоп"
        >
          {/* <svg width="20" height="20" viewBox="0 0 20 20" fill="#000" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="20" height="20" />
  </svg> */}
          ⏹️
        </button>
      </div>

      {/* <p>Распознано слов: {highlightedIndexes.length} из {totalWords}</p> */}
    </div>
  );
}
