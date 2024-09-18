import React from "react";
import { useContextMenu } from "react-contexify";
import { TodoContainer } from "../TodoContainer";
import ConfirmationModalContextProvider from "../../contexts/modalConfirmationContext";

const MENU_ID = "contextMenu";

const Wrapper = ({ children }) => (
  <div
    style={{
      maxWidth: 600,
      margin: "0 auto",
      minHeight: "100vh",
    }}
  >
    {children}
  </div>
);

const App = () => {
  const { show } = useContextMenu({
    id: MENU_ID,
  });

  const handleContextMenu = (event, taskId, isGroup, isGap, isChild, isPinnedTask, hasPinned, checked) => {
    show({
      event,
      props: {
        taskId,
        isGroup,
        isGap,
        isChild,
        isPinnedTask,
        hasPinned,
        checked
      },
    });
  };

  return (
    <ConfirmationModalContextProvider>
      <div onContextMenu={handleContextMenu}>
        <Wrapper>
          <TodoContainer handleContextMenu={handleContextMenu} />
        </Wrapper>
      </div>
    </ConfirmationModalContextProvider>
  );
};

export default App;
