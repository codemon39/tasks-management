import { arrayMove } from "@dnd-kit/sortable";
import { v4 as uuid } from "uuid";

export const iOS = /iPad|iPhone|iPod/.test(navigator.platform);

function getDragDepth(offset, indentationWidth) {
  return Math.round(offset / indentationWidth);
}

export function getProjection(
  items,
  activeId,
  overId,
  dragOffset,
  indentationWidth
) {
  const realItems =  items.filter(({hidden}) => !hidden);
  const overItemIndex = items.findIndex(({ id }) => id === overId);
  const activeItemIndex = items.findIndex(({ id }) => id === activeId);
  const activeItem = items[activeItemIndex];
  const overItem = items[overItemIndex];

  const overRealItemIndex = realItems.findIndex(({ id }) => id === overId);
  const activeRealItemIndex = realItems.findIndex(({ id }) => id === activeId);

  const newItems = arrayMove(items, activeItemIndex, overItemIndex);
  const realNewItems = arrayMove(realItems, activeRealItemIndex, overRealItemIndex);

  const previousRealItem = realNewItems[overRealItemIndex - 1];
  const previousItem = newItems[overItemIndex - 1];
  const nextItem = newItems[overItemIndex + 1];
  const dragDepth = getDragDepth(dragOffset, indentationWidth);
  const projectedDepth = activeItem.depth + dragDepth;

  const overGroup = previousItem?.isGroup ? previousItem : newItems.find(({ id }) => id === previousItem?.parentId)
  const isOverGroup =
    overItem?.isGroup ||
    !!overItem?.depth ||
    previousItem?.isGroup ||
    previousItem?.depth;


  const maxDepth =
    activeItem.isGroup ||
    !isOverGroup ||
    (nextItem?.isGroup && !previousItem?.isGroup && !previousItem?.depth)
      ? 0
      : getMaxDepth({
          previousItem,
        });
  const minDepth = activeItem.isGroup ? 0 : getMinDepth({ nextItem });

  let depth = projectedDepth;

  if (projectedDepth >= maxDepth) {
    depth = maxDepth;
  } else if (projectedDepth < minDepth) {
    depth = minDepth;
  }

  return { depth, maxDepth, minDepth, parentId: getParentId(), overItem, previousRealItem: overGroup };

  function getParentId() {
    if (depth === 0 || !previousItem) {
      return null;
    }

    if (depth === previousItem.depth) {
      return previousItem.parentId;
    }

    if (depth > previousItem.depth) {
      return previousItem.id;
    }

    const newParent = newItems
      .slice(0, overItemIndex)
      .reverse()
      .find((item) => item.depth === depth)?.parentId;

    return newParent ?? null;
  }
}

function getMaxDepth() {
  return 1;
}

function getMinDepth({ nextItem }) {
  if (nextItem) {
    return nextItem.depth;
  }

  return 0;
}

function flatten(items = [], parentId = null, depth = 0) {
  return items.reduce((acc, item, index) => {
    const children = flatten(item.children, item.id, depth + 1);

    const formattedChildren = children.length
      ? children.map((item, idx) =>
          idx === children.length - 1 ? { ...item, isLastChild: true } : item
        )
      : children;

    return [...acc, { ...item, parentId, depth, index }, ...formattedChildren];
  }, []);
}

export function flattenTree(items) {
  return flatten(items);
}

export function buildTree(flattenedItems) {
  const root = { id: "root", children: [] };
  const nodes = { [root.id]: root };
  const items = flattenedItems.map((item) => ({ ...item, children: [] }));

  for (const item of items) {
    const { id, children = [] } = item;
    const parentId = item.parentId ?? root.id;
    const parent = nodes[parentId] ?? findItem(items, parentId);

    nodes[id] = { id, children };
    parent.children.push(item);
  }

  return root.children;
}

export function findItem(items, itemId) {
  return items.find(({ id }) => id === itemId);
}

export function findItemDeep(items, itemId) {
  for (const item of items) {
    const { id, children = [] } = item;

    if (id === itemId) {
      return item;
    }

    if (children.length) {
      const child = findItemDeep(children, itemId);

      if (child) {
        return child;
      }
    }
  }

  return undefined;
}

export function setItemToGroup(items, id, task) {
  return items.map((item) => {
    if (item.id === id) {
      return { ...item, children: [task, ...item.children] };
    }

    return item;
  });
}

export function insertNewGroup(items, beforeId, group) {
  let inserted = false;
  let index = -1;
  let lastIndex = -1;
  const updatedItems = [];
  items.forEach((item, idx) => {
    if (item.id === beforeId) {
      lastIndex = items.findIndex((it, i) => i > idx &&( it.isGap || it.isGroup))
      index = idx;
      updatedItems.push({...group, children:items.slice(idx, lastIndex === -1 ? items.length : lastIndex)});
      inserted = true;
      return;
    }

    if(index !== -1 && idx > index && (lastIndex === -1 || idx < lastIndex)) {
      return;
    }

    updatedItems.push(item);
  });

  if (!inserted) {
    return [group, ...updatedItems];
  }

  return updatedItems;
}

export function findAndDeleteTask(items, taskId) {
  let deletedTask;
  const updatedItems = [];

  items.forEach((item) => {
    if (item.id === taskId) {
      deletedTask = item;
      return;
    }

    if (item.children?.length) {
      const {
        updatedItems: childrenUpdatedItems,
        deletedTask: childrenDeletedTask,
      } = findAndDeleteTask(item.children, taskId);
      deletedTask = childrenDeletedTask || deletedTask;
      updatedItems.push({
        ...item,
        children: childrenUpdatedItems,
      });
      return;
    }

    updatedItems.push(item);
  });

  return { updatedItems, deletedTask };
}

export function findAndReleaseChildren(items, taskId) {
  let groupId;
  let taskIdx;
  items.forEach((item) => {
    if (item.children?.length) {
       const taskI = item.children.findIndex(({id}) => id === taskId);
       if(taskI !== -1) {
        groupId = item.id;
        taskIdx = taskI;
       }
    }
  });

  return deleteGroupWithoutChildren(items, groupId,taskIdx)
}

export function releaseGroupWithoutChildren(items, groupId, afterIdx = -1) {
  const updatedItems = [];

  items.forEach((item) => {
    if(afterIdx !== -1 && item.id === groupId) {
      const oldChildren = [ ...item.children];
      item.children = oldChildren.slice(0, afterIdx)
      updatedItems.push(item);
      updatedItems.push(...oldChildren.slice(afterIdx+1));
      return;
    }

    if (item.id === groupId) {
      updatedItems.push({ ...item, children: [], isGroup: false});
      updatedItems.push(...item.children);
      return;
    }

    updatedItems.push(item);
  });
  console.log('updatedItems', updatedItems)
  return updatedItems;
}

export function deleteGroupWithoutChildren(items, groupId, afterIdx = -1) {
  const updatedItems = [];

  items.forEach((item) => {
    if(afterIdx !== -1 && item.id === groupId) {
      const oldChildren = [ ...item.children];
      item.children = oldChildren.slice(0, afterIdx)
      updatedItems.push(item);
      updatedItems.push(...oldChildren.slice(afterIdx+1));
      return;
    }

    if (item.id === groupId) {
      updatedItems.push(...item.children);
      return;
    }

    updatedItems.push(item);
  });
  console.log('updatedItems', updatedItems)
  return updatedItems;
}

export function insertNewItem(items, beforeId, updatedItem) {
  const updatedItems = [];

  items.forEach((item) => {
    if (item.id === beforeId) {
      updatedItems.push(item);
      updatedItems.push(updatedItem || { ...item, id: uuid() });
      return;
    }

    if (item.children?.length) {
      updatedItems.push({
        ...item,
        children: insertNewItem(item.children, beforeId, updatedItem),
      });
      return;
    }

    updatedItems.push(item);
  });

  return updatedItems;
}

export function setItem(items, id, updatedItem) {
  return items.map((item, idx) => {
    if (item.id === id) {
      return { ...item, ...updatedItem };
    }

    if (item.children?.length) {
      return { ...item, children: setItem(item.children, id, updatedItem) };
    }

    return item;
  });
}

export function setProperty(items, id, property, setter) {
  for (const item of items) {
    if (item.id === id) {
      item[property] = setter(item[property]);
      continue;
    }

    if (item.children?.length) {
      item.children = setProperty(item.children, id, property, setter);
    }
  }

  return [...items];
}

function countChildren(items = [], count = 0) {
  return items.reduce((acc, { children }) => {
    if (children?.length) {
      return countChildren(children, acc + 1);
    }

    return acc + 1;
  }, count);
}

export function getChildCount(items, id) {
  const item = findItemDeep(items, id);

  return item ? countChildren(item.children) : 0;
}

export function removeChildrenOf(items, ids) {
  const excludeParentIds = [...ids];

  return items.filter((item) => {
    if (item.parentId && excludeParentIds.includes(item.parentId)) {
      if (item.children?.length) {
        excludeParentIds.push(item.id);
      }
      return false;
    }

    return true;
  });
}

export function hideChildrenOf(items, ids) {
  const excludeParentIds = [...ids];

  return items.map((item) => {
    if (item.parentId && excludeParentIds.includes(item.parentId)) {
      if (item.children?.length) {
        excludeParentIds.push(item.id);
      }
      return { ...item, hidden: true };
    }

    return item;
  });
}
