import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { defaultAnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import styles from "./MenuItem.module.css";
import { ColorPicker } from "../ColorPicker";

const animateLayoutChanges = (args) => false;

export const MenuItem = ({
  activeTab,
  handleTabChange,
  title,
  index,
  color,
  disabled,
}) => {
  const { active, over, setNodeRef } = useSortable({
    id: title,
    data: {
      type: "tab",
      children: [],
    },
    animateLayoutChanges,
  });
  const [topic, setTopic] = useState(title);
  const [backColor, setBackColor] = useState(color);
  const [read, setRead] = useState(true);

  useEffect(() => {}, []);

  const isOverTab =
    over && title === over.id && active?.data.current?.type !== "tab";
  const changeColor = (value) => {
    setBackColor(value);
  };
  return (
    <li
      key={index}
      className={classNames(styles.tab, {
        [styles.selected]: index === activeTab,
        [styles.hover]: isOverTab,
      })}
      style={{
        background: `rgba(${backColor}, 0.12)`,
        borderBottom: `2px solid rgba(${backColor})`,
      }}
      onDoubleClick={() => setRead(false)}
      onClick={() => handleTabChange(index)}
    >
      <input
        className={classNames(styles.text)}
        style={{
          color: `rgb(${backColor})`,
        }}
        value={topic}
        size={topic.length - 3}
        onChange={(e) => setTopic(e.target.value)}
        readOnly={read}
      />
      <ColorPicker color="color" onChange={changeColor} />
      <div
        className={styles.container}
        ref={disabled ? undefined : setNodeRef}
      />
    </li>
  );
};
