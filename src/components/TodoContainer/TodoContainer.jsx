import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { v4 as uuid } from "uuid";
import { TabsPanel, Tab, AddTaskButton, ContextMenu } from "../ui";
import { TaskList } from "../TaskList";
import { defaultLists } from "../../helpers/testData";
import "react-contexify/ReactContexify.css";
import {
  buildTree,
  flattenTree,
  getProjection,
  setItem,
  hideChildrenOf,
  setProperty,
  insertNewItem,
  insertNewGroup,
  setItemToGroup,
  deleteGroupWithoutChildren,
  findAndDeleteTask,
  findAndReleaseChildren,
  releaseGroupWithoutChildren,
} from "../../helpers/utilities";

const indentationWidth = 13;

const measuring = {
  droppable: {
    strategy: 0,
  },
};

export const TodoContainer = ({ handleContextMenu }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [lists, setLists] = useState(() => defaultLists);
  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const items = lists[activeTab].taskList;

  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(items).filter(({ deleted }) => !deleted);
    const collapsedItems = flattenedTree.reduce(
      (acc, { children, collapsed, id }) =>
        collapsed && children.length ? [...acc, id] : acc,
      []
    );

    return hideChildrenOf(
      flattenedTree,
      activeId ? [activeId, ...collapsedItems] : collapsedItems
    );
  }, [activeId, items]);

  const addlist = () => {
    setLists([
      ...lists,
      {
        id: lists.length + 1,
        color: "",
        name: `Task list ${lists.length + 1}`,
        taskList: [],
      },
    ]);
  };

  const sensorContext = useRef({
    items: flattenedItems,
    offset: offsetLeft,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 120,
        tolerance: 5,
      },
    })
  );

  const projected =
    activeId && overId
      ? getProjection(
          flattenedItems,
          activeId,
          overId,
          offsetLeft,
          indentationWidth
        )
      : null;

  useEffect(() => {
    sensorContext.current = {
      items: flattenedItems,
      offset: offsetLeft,
    };
  }, [flattenedItems, offsetLeft]);

  const resetState = () => {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);

    document.body.style.setProperty("cursor", "");
  };

  const handleRemoveTask = (id) => {
    setLists(
      lists.map((tab, idx) =>
        idx === activeTab
          ? {
              ...tab,
              taskList: setProperty(tab.taskList, id, "deleted", () => {
                return true;
              }),
            }
          : tab
      )
    );
  };

  const handleSaveTask = (
    { id, title, checked, notes, priority, depth },
    submit
  ) => {
    setIsEditing(false);
    const task = {
      id,
      name: title,
      checked,
      notes,
      priority,
      editing: false,
      isGap: !title,
    };

    const gap = {
      id,
      name: "",
      isGap: true,
      editing: false,
    };

    setLists(
      lists.map((tab, idx) =>
        idx === activeTab
          ? {
              ...tab,
              taskList: setItem(tab.taskList, id, title ? task : gap),
            }
          : tab
      )
    );
    if (!title && depth) {
      setLists(
        lists.map((tab, idx) =>
          idx === activeTab
            ? {
                ...tab,
                taskList: findAndReleaseChildren(tab.taskList, id),
              }
            : tab
        )
      );
    }
  };

  const handleAddTask = (afterTaskId) => {
    setIsEditing(true);
    const task = {
      id: uuid(),
      name: "",
      editing: true,
      isGroup: false,
      checked: false,
    };
    if (afterTaskId || selectedTaskId) {
      setLists((lists) =>
        lists.map((tab, idx) =>
          idx === activeTab
            ? {
                ...tab,
                taskList: insertNewItem(
                  tab.taskList,
                  afterTaskId || selectedTaskId,
                  task
                ),
              }
            : tab
        )
      );
    } else {
      setLists((lists) =>
        lists.map((tab, idx) =>
          idx === activeTab
            ? { ...tab, taskList: [task, ...tab.taskList] }
            : tab
        )
      );
    }
  };

  const handleAddTaskToGroup = (groupId) => {
    const task = {
      id: uuid(),
      name: "",
      editing: true,
      isGroup: false,
      checked: false,
    };

    setLists(
      lists.map((tab, idx) =>
        idx === activeTab
          ? {
              ...tab,
              taskList: setItemToGroup(tab.taskList, groupId, task),
            }
          : tab
      )
    );
  };

  const handleAddGap = (afterTaskId) => {
    const gap = {
      id: uuid(),
      name: "",
      isGap: true,
      editing: false,
    };

    if (afterTaskId || selectedTaskId) {
      setLists(
        lists.map((tab, idx) =>
          idx === activeTab
            ? {
                ...tab,
                taskList: insertNewItem(
                  tab.taskList,
                  afterTaskId || selectedTaskId,
                  gap
                ),
              }
            : tab
        )
      );
    } else {
      setLists(
        lists.map((tab, idx) =>
          idx === activeTab ? { ...tab, taskList: [gap, ...tab.taskList] } : tab
        )
      );
    }
  };

  const handleAddGroup = (afterTaskId) => {
    const group = {
      id: uuid(),
      name: "New Group",
      color: "239, 108, 0",
      isGroup: true,
      editing: false,
    };

    setLists(
      lists.map((tab, idx) =>
        idx === activeTab
          ? {
              ...tab,
              taskList: insertNewGroup(
                tab.taskList,
                afterTaskId || selectedTaskId,
                group
              ),
            }
          : tab
      )
    );
  };

  const handlePinGroup = (groupId) => {
    const group = lists[activeTab]?.taskList.find(({ id }) => id === groupId);

    const updatedGroup = {
      ...group,
      pinned: true,
      children: group?.children?.map((child) => ({
        ...child,
        isPinnedTask: true,
      })),
    };

    setLists(
      lists.map((tab, idx) =>
        idx === activeTab
          ? {
              ...tab,
              taskList: [
                updatedGroup,
                ...tab.taskList.filter(({ id }) => id !== groupId),
              ],
            }
          : tab
      )
    );
  };

  const handlePinTask = (taskId) => {
    const { updatedItems, deletedTask } = findAndDeleteTask(
      lists[activeTab]?.taskList,
      taskId
    );
    const pinnedGroup = lists[activeTab]?.taskList[0];

    if (pinnedGroup?.pinned) {
      setLists(
        lists.map((tab, idx) =>
          idx === activeTab
            ? {
                ...tab,
                taskList: setItemToGroup(updatedItems, pinnedGroup.id, {
                  ...deletedTask,
                  isPinnedTask: true,
                }),
              }
            : tab
        )
      );
    } else {
      const group = {
        id: uuid(),
        name: "Pinned",
        color: "211, 47, 47",
        isGroup: true,
        pinned: true,
        editing: false,
        children: [{ ...deletedTask, isPinnedTask: true }],
      };
      setLists(
        lists.map((tab, idx) =>
          idx === activeTab
            ? {
                ...tab,
                taskList: [group, ...updatedItems],
              }
            : tab
        )
      );
    }
  };

  const handleRemoveGroup = (groupId, withChildren, withoutGroup) => {
    if (withChildren) {
      setLists(
        lists.map((tab, idx) =>
          idx === activeTab
            ? {
                ...tab,
                taskList: tab.taskList.filter(({ id }) => id !== groupId),
              }
            : tab
        )
      );
    } else {
      setLists(
        lists.map((tab, idx) =>
          idx === activeTab
            ? {
                ...tab,
                taskList: deleteGroupWithoutChildren(tab.taskList, groupId),
              }
            : tab
        )
      );
    }
  };

  const handleReleaseGroup = (groupId) => {
    setLists(
      lists.map((tab, idx) =>
        idx === activeTab
          ? {
              ...tab,
              taskList: releaseGroupWithoutChildren(tab.taskList, groupId),
            }
          : tab
      )
    );
  };

  const handleDuplicateTask = (taskId) => {
    setLists(
      lists.map((tab, idx) =>
        idx === activeTab
          ? {
              ...tab,
              taskList: insertNewItem(tab.taskList, taskId),
            }
          : tab
      )
    );
  };

  const handleChangePropertyTask = (id, property, updatedValue) => {
    setLists(
      lists.map((tab, idx) =>
        idx === activeTab
          ? {
              ...tab,
              taskList: setProperty(tab.taskList, id, property, (value) => {
                return updatedValue || !value;
              }),
            }
          : tab
      )
    );
  };
  const handleResolveTask = (id) => {
    setLists(
      lists.map((tab, idx) =>
        idx === activeTab
          ? {
              ...tab,
              taskList: setProperty(tab.taskList, id, "checked", (value) => {
                return !value;
              }),
            }
          : tab
      )
    );
  };

  const handleCollapse = (id) => {
    setLists(
      lists.map((tab, idx) =>
        idx === activeTab
          ? {
              ...tab,
              taskList: setProperty(tab.taskList, id, "collapsed", (value) => {
                return !value;
              }),
            }
          : tab
      )
    );
  };

  const handleDragCancel = () => {
    resetState();
  };

  const handleDragStart = ({ active }) => {
    setActiveId(active.id);
    setOverId(active.id);

    document.body.style.setProperty("cursor", "grabbing");
  };

  const handleDragMove = ({ delta }) => {
    setOffsetLeft(delta.x);
  };

  const handleDragOver = ({ over }) => {
    setOverId(over?.id ?? null);
  };

  const handleDragEnd = ({ active, over }) => {
    resetState();

    if (projected && over) {
      const taskListNames = lists.map(({ name }) => name);

      const { depth, parentId } = projected;
      const clonedItems = JSON.parse(JSON.stringify(flattenTree(items)));
      const overIndex = clonedItems.findIndex(({ id }) => id === over.id);
      const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);
      const activeTreeItem = clonedItems[activeIndex];

      clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId };

      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
      const updatedItems = taskListNames.includes(over.id)
        ? sortedItems.filter(
            ({ id, parentId }) => id !== active.id && parentId !== active.id
          )
        : sortedItems;

      const newItems = buildTree(updatedItems);

      if (taskListNames.includes(over.id)) {
        const taskListIndex = lists.findIndex(({ name }) => name === over.id);

        const updatedTaskLists = lists
          .map((tab, idx) =>
            idx === taskListIndex
              ? {
                  ...tab,
                  taskList: tab.taskList[0]?.pinned
                    ? [
                        tab.taskList[0],
                        activeTreeItem,
                        ...tab.taskList.slice(1),
                      ]
                    : [activeTreeItem, ...tab.taskList],
                }
              : tab
          )
          .map((tab, idx) =>
            idx === activeTab ? { ...tab, taskList: newItems } : tab
          );

        setLists(updatedTaskLists);

        return;
      }

      setLists(
        lists.map((tab, idx) =>
          idx === activeTab ? { ...tab, taskList: newItems } : tab
        )
      );
    }
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <DndContext
        sensors={sensors}
        measuring={measuring}
        layoutMeasuring={{ strategy: 0 }}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <TabsPanel
          activeTab={activeTab}
          handleTabChange={setActiveTab}
          addTab={addlist}
          lists={lists}
        >
          {lists.map(({ id, name, taskList }) => (
            <Tab key={id} title={name}>
              <TaskList
                lists={lists}
                projected={projected}
                flattenedItems={flattenedItems}
                items={taskList}
                activeId={activeId}
                offsetLeft={offsetLeft}
                handleCollapse={handleCollapse}
                handleResolveTask={handleResolveTask}
                handleRemoveTask={handleRemoveTask}
                handleSaveTask={handleSaveTask}
                handleChangePropertyTask={handleChangePropertyTask}
                handleAddTaskToGroup={handleAddTaskToGroup}
                setSelectedTaskId={setSelectedTaskId}
                selectedTaskId={selectedTaskId}
                indentationWidth={indentationWidth}
                handleContextMenu={handleContextMenu}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                handleAddGap={handleAddGap}
                handleAddTask={handleAddTask}
              />
            </Tab>
          ))}
        </TabsPanel>
        <AddTaskButton handleAddTask={handleAddTask} />
      </DndContext>
      <ContextMenu
        handleRemoveTask={handleRemoveTask}
        handleDuplicateTask={handleDuplicateTask}
        handleAddTask={handleAddTask}
        handleAddGap={handleAddGap}
        handleAddGroup={handleAddGroup}
        handleAddTaskToGroup={handleAddTaskToGroup}
        handleRemoveGroup={handleRemoveGroup}
        handlePinTask={handlePinTask}
        handleRemoveGap={handleRemoveTask}
        handlePinGroup={handlePinGroup}
        handleReleaseGroup={handleReleaseGroup}
        setSelectedTaskId={setSelectedTaskId}
        selectedTaskId={selectedTaskId}
      />
    </div>
  );
};
