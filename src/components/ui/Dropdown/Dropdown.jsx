import React, { useRef } from "react";
import { useOutsideAlerter } from "../../../hooks/useOutsideAlerter";
import styles from "./Dropdown.module.css";

export const Dropdown = ({ options = [], icon, onChange, onClose }) => {
  const wrapperRef = useRef(null);

  useOutsideAlerter(wrapperRef, onClose, [onClose]);

  return (
    <div
      className={styles.content}
      ref={wrapperRef}
    >
      {options.map(({ value, title, color }) => (
        <div
          className={styles.item}
          style={{ "--iconColor": color }}
          onClick={() => onChange(value)}
        >
          <div className={styles.icon}>{icon}</div>
          <div className={styles.title}>{title}</div>
        </div>
      ))}
    </div>
  );
};
