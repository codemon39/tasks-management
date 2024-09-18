import { Menu, Item, Separator } from "react-contexify";
import "react-contexify/ReactContexify.css";
import { useConfirmationModalContext } from "../../../contexts/modalConfirmationContext";
import "./ContextMenu.css";

const MENU_ID = "contextMenu";

export const ContextMenu = ({
  menuId = MENU_ID,
  handleRemoveTask,
  handleAddTask,
  handleDuplicateTask,
  handleAddGap,
  handleAddGroup,
  handleAddTaskToGroup,
  handleRemoveGroup,
  handlePinTask,
  handleRemoveGap,
  handlePinGroup,
  handleReleaseGroup,
  setSelectedTaskId,
  selectedTaskId,
}) => {
  const { showConfirmation } = useConfirmationModalContext();

  const handleItemClick = async ({ id, props }) => {
    switch (id) {
      case "newTask":
        handleAddTask(props.taskId);
        break;
      case "selectTask":
        setSelectedTaskId(props.taskId);
        break;
      case "duplicateTask":
        handleDuplicateTask(props.taskId);
        break;
      case "newGap":
        handleAddGap(props.taskId);
        break;
      case "newGroup":
        handleAddGroup(props.taskId);
        break;
      case "pinTask":
        handlePinTask(props.taskId);
        break;
      case "pinGroup":
        handlePinGroup(props.taskId);
        break;
      case "addTaskToGroup":
        handleAddTaskToGroup(props.taskId);
        break;
      case "deleteTask":
        handleRemoveTask(props.taskId);
        break;
      case "deleteGap":
        handleRemoveGap(props.taskId);
        break;
      case "revert":
        handleReleaseGroup(props.taskId);
        break;
      case "deleteGroup":
        const result = await showConfirmation(
          "Are you sure?",
          "Do you really want to delete this group? This process cannot be undone"
        );

        const deleteWithChildrenResult =
          result &&
          (await showConfirmation(
            "Delete group with children?",
            'If you press "no", children will be shown in the group location'
          ));

        result && handleRemoveGroup(props.taskId, deleteWithChildrenResult);
        break;
      default:
    }
  };

  const isNotTask = ({ props }) => {
    return !props.taskId || props.isGroup || props.isGap;
  };

  const cannotBeHighlighted = ({ props }) => {
    return (
      !props.taskId ||
      props.isGroup ||
      props.isGap ||
      props.taskId === selectedTaskId
    );
  };

  const isNotChild = ({ props }) => {
    return !props.taskId || props.isGroup || props.isGap || props.isChild;
  };

  const isNotGroup = ({ props }) => {
    return !props.taskId || !props.isGroup;
  };

  // const cannotGroupBePinned = ({ props }) => {
  //   return !props.taskId || !props.isGroup || props.hasPinned;
  // };

  const isNotGeneral = ({ props }) => {
    return props.isGroup || props.isGap;
  };

  const isNotGap = ({ props }) => {
    return !props.isGap;
  };

  const isDoneTask = ({ props }) => {
    return props.checked;
  };

  return (
    <Menu id={menuId}>
      <Item id="revert" onClick={handleItemClick} hidden={isNotGroup}>
        Revert to Task
      </Item>
      <Item id="newTask" onClick={handleItemClick} hidden={isNotGeneral}>
        Create Task
      </Item>
      <Item
        id="duplicateTask"
        onClick={handleItemClick}
        disabled={isDoneTask}
        hidden={isNotTask}
      >
        Duplicate Task
      </Item>
      <Item
        id="selectTask"
        onClick={handleItemClick}
        disabled={(p) => cannotBeHighlighted(p)}
        hidden={isNotTask}
      >
        Highlight Task
      </Item>
      <Item
        id="newGroup"
        onClick={handleItemClick}
        disabled={isNotChild}
        hidden={isNotTask}
        className="last"
      >
        Make Group
      </Item>
      <Separator hidden={isNotTask} />
      <Item
        id="newGap"
        onClick={handleItemClick}
        disabled={isDoneTask}
        hidden={isNotTask}
      >
        Add Gap
      </Item>
      <Item id="deleteTask" onClick={handleItemClick} hidden={isNotTask}>
        Delete Task
      </Item>
      <Item id="addTaskToGroup" onClick={handleItemClick} hidden={isNotGroup}>
        Create Task
      </Item>
      <Item id="deleteGroup" onClick={handleItemClick} hidden={isNotGroup}>
        Delete Item
      </Item>
      <Item id="newGap" onClick={handleItemClick} hidden={isNotGap}>
        Add Gap
      </Item>
      <Item id="deleteGap" onClick={handleItemClick} hidden={isNotGap}>
        Delete Gap
      </Item>
    </Menu>
  );
};
