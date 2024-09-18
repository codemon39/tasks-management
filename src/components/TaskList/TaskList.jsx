import React, { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { DragOverlay, defaultDropAnimation } from "@dnd-kit/core";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { getChildCount } from "../../helpers/utilities";
import { SortableTask } from "../SortableTask";
import "./TaskList.css";

const dropAnimationConfig = {
  keyframes({ transform }) {
    return [];
  },
  easing: "ease-out",
  sideEffects({ active }) {
    active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: defaultDropAnimation.duration,
      easing: defaultDropAnimation.easing,
    });
  },
};

export const TaskList = ({
  indentationWidth,
  items,
  activeId,
  handleCollapse,
  handleResolveTask,
  handleSaveTask,
  handleRemoveTask,
  handleChangePropertyTask,
  handleAddTaskToGroup,
  flattenedItems,
  projected,
  selectedTaskId,
  setSelectedTaskId,
  handleContextMenu,
  handleAddGap,
  handleAddTask,
  isEditing,
  setIsEditing,
  lists,
}) => {
  const [disabled, setDisabled] = useState(false);
  const { over } = useSortable({});
  const sortedIds = useMemo(
    () => flattenedItems.map(({ id }) => id),
    [flattenedItems]
  );

  const activeItemIndex = activeId
    ? flattenedItems.findIndex(({ id }) => id === activeId)
    : -1;

  const activeItem = activeId ? flattenedItems[activeItemIndex] : null;

  const hasPinned = flattenedItems.some(({ pinned }) => pinned);

  const handleExited = () => {
    isEditing && setIsEditing(false);
  };

  const handleEnter = () => {
    setSelectedTaskId(null);
  };

  useEffect(() => {
    setDisabled(true);
    setTimeout(() => {
      setDisabled(false);
    }, 250);
  }, [flattenedItems]);
  return (
    <SortableContext
      items={sortedIds}
      strategy={verticalListSortingStrategy}
      disabled={disabled}
    >
      <TransitionGroup exit={!activeItem} enter={!activeItem} appear in>
        {flattenedItems
          .filter((item) =>
            activeItem?.isGroup && item.parentId ? false : true
          )
          .filter((item) =>
            activeItem &&
            (over?.id === item.parentId ||
              over?.data?.current?.parentId === item.parentId) &&
            !activeItem?.isGroup
              ? true
              : !item.hidden
          )
          .map(
            (
              {
                id,
                show,
                collapsed,
                depth,
                isGroup,
                name,
                color,
                parentId,
                checked,
                editing,
                isLastChild,
                notes,
                priority,
                pinned,
                isGap,
                isPinnedTask,
                display,
              },
              idx
            ) => (
              <CSSTransition
                key={id}
                appear
                timeout={250}
                classNames="task"
                onExited={handleExited}
                onEnter={() => setSelectedTaskId(1)}
                onEntered={handleEnter}
              >
                <div>
                  <SortableTask
                    id={id}
                    show={show}
                    value={id}
                    name={name}
                    parentId={parentId}
                    lists={lists}
                    pinned={pinned}
                    color={
                      color ||
                      (parentId &&
                        flattenedItems.find(({ id }) => id === parentId)?.color)
                    }
                    draggableIsGroup={activeItem?.isGroup}
                    childCount={getChildCount(items, activeId) + 1}
                    depth={
                      id === activeId && projected ? projected.depth : depth
                    }
                    isGroup={isGroup}
                    indentationWidth={indentationWidth}
                    isSelected={selectedTaskId === id}
                    checked={checked}
                    editing={editing}
                    priority={priority}
                    notes={notes}
                    isGap={isGap}
                    onSelect={setSelectedTaskId}
                    collapsed={
                      activeItem?.isGroup && isGroup
                        ? true
                        : collapsed && isGroup
                    }
                    isPinnedTask={isPinnedTask}
                    onCollapse={() => handleCollapse(id)}
                    onResolve={() => handleResolveTask(id)}
                    handleRemoveTask={() => handleRemoveTask(id)}
                    handleAddTaskToGroup={handleAddTaskToGroup}
                    handleAddTask={handleAddTask}
                    handleContextMenu={handleContextMenu}
                    handleChangePropertyTask={handleChangePropertyTask}
                    handleSaveTask={handleSaveTask}
                    handleAddGap={handleAddGap}
                    isBelowDraggable={activeId && idx > activeItemIndex}
                    isUpperDraggable={activeId && idx < activeItemIndex}
                    isLastChild={isLastChild}
                    hasPinned={hasPinned}
                    previousItem={projected?.previousRealItem}
                  />
                </div>
              </CSSTransition>
            )
          )}
      </TransitionGroup>
      {createPortal(
        <DragOverlay dropAnimation={dropAnimationConfig}>
          {activeId && activeItem ? (
            <SortableTask
              id={activeId}
              depth={activeItem.depth}
              isGroup={activeItem.isGroup}
              name={activeItem.name}
              color={activeItem.color}
              isGap={activeItem.isGap}
              checked={activeItem.checked}
              notes={activeItem.notes}
              priority={activeItem.priority}
              clone
              childCount={getChildCount(items, activeId) + 1}
              value={activeId.toString()}
              indentationWidth={indentationWidth}
              cloneDepth={
                typeof projected?.depth === "number"
                  ? projected?.depth
                  : activeItem.depth
              }
              mixedDepth={
                !activeItem.isGroup &&
                projected?.maxDepth !== projected?.minDepth
              }
            />
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </SortableContext>
  );
};
