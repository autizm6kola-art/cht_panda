

export function createSpeechRecognizer({ onResult, onEnd }) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Ваш браузер не поддерживает распознавание речи.");
    return null;
  }

  const recognizer = new SpeechRecognition();
  recognizer.lang = "ru-RU";
  recognizer.continuous = true;
  recognizer.interimResults = true;

  recognizer.onresult = (event) => {
    const transcriptArray = Array.from(event.results)
      .map(result => result[0].transcript)
      .join(' ')
      .trim();

    if (transcriptArray && onResult) {
      onResult(transcriptArray);
    }
  };

  recognizer.onend = () => {
    if (onEnd) onEnd();
  };

  return recognizer;
}

