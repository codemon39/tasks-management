import React, { forwardRef, useState, useEffect, useRef } from "react";
import classNames from "classnames";
import { useOutsideAlerter } from "../../../hooks/useOutsideAlerter";
import { ColorPicker } from "../ColorPicker";
import styles from "./Task.module.css";

export const Task = forwardRef(
  (
    {
      id,
      childCount,
      clone,
      depth,
      disableSelection,
      disableInteraction,
      ghost,
      handleProps,
      indentationWidth,
      indicator,
      collapsed,
      onCollapse,
      style,
      value,
      wrapperRef,
      isGroup,
      color,
      name,
      isSelected,
      onSelect,
      cloneDepth,
      overTaskList,
      mixedDepth,
      onResolve,
      checked,
      editing,
      handleSaveTask,
      handleRemoveTask,
      handleChangePropertyTask,
      handleAddTaskToGroup,
      handleContextMenu,
      handleAddGap,
      handleAddTask,
      isGap: defaultIsGap,
      pinned,
      isPinnedTask,
      hasPinned,
      ...props
    },
    ref
  ) => {
    const titleRef = useRef(null);
    const contentWrapperRef = useRef(null);
    const [title, setTitle] = useState(name || "");
    const [isSaved, setIsSaved] = useState(false);

    const isGap = defaultIsGap && !editing;

    const getMargin = (depth, cloneDepth) => {
      switch (true) {
        case !!depth && !cloneDepth:
          return "-13px";
        case !depth && !!cloneDepth:
          return "13px";
        default:
          return "0px";
      }
    };

    const getMixedMargin = (depth) => {
      switch (true) {
        case !depth:
          return "-13px";
        case !!depth:
          return "13px";
        default:
          return "0px";
      }
    };

    const handleStartEditingChange = (e) => {
      e.stopPropagation();
      !editing && handleChangePropertyTask(id, "editing");
    };

    const onSaveTask = (task) => {
      handleSaveTask(task);
      setIsSaved(false);
    };

    const handleTaskClick = (e) => {
      if (e.detail > 1) {
        e.preventDefault();
      }
      onSelect(isGroup ? null : id);
    };

    const changeColor = (color) => {
      handleChangePropertyTask(id, "color", color);
    };

    useEffect(() => {
      if (titleRef && titleRef.current) {
        titleRef.current.style.height = "5px";
        titleRef.current.style.height = titleRef.current.scrollHeight + "px";
      }
    }, []);

    const clickOutsideHandler = (isSubmit) => {
      if (!title && defaultIsGap) {
        onSaveTask({ id, title, checked });
        return;
      }
      if (!editing) return;
      if (isSubmit && !title) {
        onSaveTask({ id, title, checked, depth });
        onSelect(null);
        return;
      }

      if (isGroup) {
        handleChangePropertyTask(id, "name", title);
        handleChangePropertyTask(id, "editing", false);
      }

      title ? onSaveTask({ id, title, checked }) : handleRemoveTask(id);

      if (isSubmit) {
        isGroup ? handleAddTaskToGroup(id) : handleAddTask(id);
      }
    };

    useOutsideAlerter(contentWrapperRef, clickOutsideHandler, [title, editing]);

    const handleKeyDown = (e) => {
      if ((e.key === "Enter" || e.keyCode === 13) && !e.shiftKey) {
        clickOutsideHandler(true);
        e.preventDefault();
        return;
      }

      const key = e.key;
      if (key === "Backspace" || key === "Delete") {
        defaultIsGap && handleRemoveTask(id);
      }
    };

    useEffect(() => {
      if (titleRef.current) {
        titleRef.current.focus();
        titleRef.current.selectionStart = titleRef.current.value.length;
        titleRef.current.style.height = "5px";
        titleRef.current.style.height = titleRef.current.scrollHeight + "px";
      }
    }, [editing]);

    const content = (
      <>
        {!isGroup && (
          <input
            id="html"
            type="checkbox"
            className={styles.checkbox}
            checked={checked}
            onChange={onResolve}
          />
        )}
        <>
          <textarea
            ref={titleRef}
            id="textInput"
            type="text"
            className={classNames(styles.text, {
              [styles.groupText]: isGroup,
            })}
            value={editing ? title : name}
            readOnly={!editing}
            onFocus={(e) => !editing && e.preventDefault()}
            onChange={(e) => {
              e.target.style.height = "5px";
              e.target.style.height = e.target.scrollHeight + "px";
              setTitle(e.target.value);
            }}
            onKeyDown={handleKeyDown}
          />

          {!isGroup && (
            <>
              <div className={styles.dateIcon}>{dateIcon}</div>
            </>
          )}

          {isGroup && (
            <>
              <div className={styles.dateIcon}>
                <ColorPicker color={color} onChange={changeColor} />
              </div>
            </>
          )}
        </>
      </>
    );

    return (
      <>
        <div
          className={classNames(
            styles.wrapper,
            clone && styles.clone,
            ghost && styles.ghost,
            disableSelection && styles.disableSelection,
            disableInteraction && styles.disableInteraction,
            overTaskList && styles.overTaskList,
            editing && !isGroup && styles.editing,
            isSaved && styles.saved
          )}
          ref={wrapperRef}
          style={{
            "--spacing": `${indentationWidth * depth}px`,
            "--groupColor": color,
          }}
          {...props}
        >
          <div
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              !isGroup && onSelect(id);
              handleContextMenu(
                e,
                id,
                isGroup,
                isGap,
                !!depth,
                isPinnedTask,
                hasPinned,
                checked
              );
            }}
            onMouseDown={!isGap ? handleTaskClick : undefined}
            onDoubleClick={handleStartEditingChange}
            className={classNames(styles.taskItem, {
              [styles.group]: isGroup,
              [styles.child]: !!depth,
              [styles.selected]: isSelected || editing,
              [styles.checked]: checked,
              [styles.editing]: editing && !isGroup,
              [styles.gap]: isGap,
              [styles.saved]: isSaved,
            })}
            ref={ref}
            style={{
              ...style,
              "--cloneDepth": `${
                indentationWidth * Number(depth ? !cloneDepth : -cloneDepth)
              }px`,
              "--cloneMargin":
                mixedDepth && depth !== cloneDepth
                  ? "0px"
                  : getMargin(depth, cloneDepth),
              "--cloneMarginRight":
                mixedDepth && depth !== cloneDepth
                  ? getMixedMargin(cloneDepth)
                  : "0px",
            }}
            {...handleProps}
          >
            <div
              className={classNames(styles.content, {
                [styles.contentEditing]: editing && !isGroup,
                [styles.saved]: isSaved,
              })}
              ref={contentWrapperRef}
            >
              {!isGap && content}
            </div>
          </div>
        </div>
      </>
    );
  }
);

const dateIcon = (
  <svg
    width="19"
    height="18"
    viewBox="0 0 19 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1.5 8.80769C1.5 5.90674 1.5 4.45626 2.43726 3.55505C3.37452 2.65384 4.88301 2.65384 7.9 2.65384H11.1C14.117 2.65384 15.6255 2.65384 16.5627 3.55505C17.5 4.45626 17.5 5.90674 17.5 8.80769V10.3462C17.5 13.2471 17.5 14.6976 16.5627 15.5988C15.6255 16.5 14.117 16.5 11.1 16.5H7.9C4.88301 16.5 3.37452 16.5 2.43726 15.5988C1.5 14.6976 1.5 13.2471 1.5 10.3462V8.80769Z"
      stroke="black"
      stroke-opacity="0.08"
      stroke-width="1.5"
    />
    <path
      d="M5.5 2.65385V1.5"
      stroke="black"
      stroke-opacity="0.08"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M13.5 2.65385V1.5"
      stroke="black"
      stroke-opacity="0.08"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M1.89999 6.5H17.1"
      stroke="black"
      stroke-opacity="0.08"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M14.3 12.6538C14.3 13.0787 13.9418 13.4231 13.5 13.4231C13.0582 13.4231 12.7 13.0787 12.7 12.6538C12.7 12.229 13.0582 11.8846 13.5 11.8846C13.9418 11.8846 14.3 12.229 14.3 12.6538Z"
      fill="black"
      fill-opacity="0.08"
    />
    <path
      d="M14.3 9.57691C14.3 10.0017 13.9418 10.3461 13.5 10.3461C13.0582 10.3461 12.7 10.0017 12.7 9.57691C12.7 9.15208 13.0582 8.80768 13.5 8.80768C13.9418 8.80768 14.3 9.15208 14.3 9.57691Z"
      fill="black"
      fill-opacity="0.08"
    />
    <path
      d="M10.3 12.6538C10.3 13.0787 9.94184 13.4231 9.50001 13.4231C9.05818 13.4231 8.70001 13.0787 8.70001 12.6538C8.70001 12.229 9.05818 11.8846 9.50001 11.8846C9.94184 11.8846 10.3 12.229 10.3 12.6538Z"
      fill="black"
      fill-opacity="0.08"
    />
    <path
      d="M10.3 9.57691C10.3 10.0017 9.94184 10.3461 9.50001 10.3461C9.05818 10.3461 8.70001 10.0017 8.70001 9.57691C8.70001 9.15208 9.05818 8.80768 9.50001 8.80768C9.94184 8.80768 10.3 9.15208 10.3 9.57691Z"
      fill="black"
      fill-opacity="0.08"
    />
    <path
      d="M6.30001 12.6538C6.30001 13.0787 5.94184 13.4231 5.50001 13.4231C5.05818 13.4231 4.70001 13.0787 4.70001 12.6538C4.70001 12.229 5.05818 11.8846 5.50001 11.8846C5.94184 11.8846 6.30001 12.229 6.30001 12.6538Z"
      fill="black"
      fill-opacity="0.08"
    />
    <path
      d="M6.30001 9.57691C6.30001 10.0017 5.94184 10.3461 5.50001 10.3461C5.05818 10.3461 4.70001 10.0017 4.70001 9.57691C4.70001 9.15208 5.05818 8.80768 5.50001 8.80768C5.94184 8.80768 6.30001 9.15208 6.30001 9.57691Z"
      fill="black"
      fill-opacity="0.08"
    />
  </svg>
);
