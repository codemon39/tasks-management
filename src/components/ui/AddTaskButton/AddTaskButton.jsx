import React from "react";
import styles from "./AddTaskButton.module.css";

export const AddTaskButton = ({ handleAddTask }) => {
  return (
    <div className={styles.wrapper}>
      <button
        className={styles.button}
        onClick={() => handleAddTask()}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.5 8.5H8.5V14.5H6.5V8.5H0.5V6.5H6.5V0.5H8.5V6.5H14.5V8.5Z"
            fill="white"
          />
        </svg>
      </button>
    </div>
  );
};
