

import React from "react";
import styles from "../styles/ReadingPage.module.css";

const SentenceDisplay = ({ content, highlightedIndexes = [] }) => {
  return (
    <div className={styles.textContainer}>
      {content.map((item, index) => {
        const isHighlighted = highlightedIndexes.includes(index);
        const className =
          item.type === "word"
            ? isHighlighted
              ? styles.highlightedWord
              : styles.word
            : styles.punctuation;

        // Определяем нужно ли добавлять пробел перед элементом
        const prev = content[index - 1];
        const needsSpaceBefore =
          index === 0
            ? false
            : item.type === "word" || (item.type === "punctuation" && prev?.type === "punctuation");

        return (
          <React.Fragment key={index}>
            {needsSpaceBefore && ' '}
            <span className={className}>{item.word}</span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default SentenceDisplay;
