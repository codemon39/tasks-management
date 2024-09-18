import React, { useContext, useRef, useState } from "react";
import { Modal } from "../components/ui";

const useModalShow = () => {
  const [show, setShow] = useState(false);

  const handleOnHide = () => {
    setShow(false);
  };

  return {
    show,
    setShow,
    onHide: handleOnHide,
  };
};

const ConfirmationModalContext = React.createContext({});

const ConfirmationModalContextProvider = (props) => {
  const { setShow, show, onHide } = useModalShow();
  const [content, setContent] = useState();
  const resolver = useRef();

  const handleShow = (title, message) => {
    setContent({
      title,
      message,
    });
    setShow(true);
    return new Promise(function (resolve) {
      resolver.current = resolve;
    });
  };

  const modalContext = {
    showConfirmation: handleShow,
  };

  const handleOk = () => {
    resolver.current && resolver.current(true);
    onHide();
  };

  const handleCancel = () => {
    resolver.current && resolver.current(false);
    onHide();
  };

  return (
    <ConfirmationModalContext.Provider value={modalContext}>
      {props.children}

      {content && show && (
        <Modal
          title={content.title}
          content={content.message}
          onApprove={handleOk}
          onDeny={handleCancel}
        />
      )}
    </ConfirmationModalContext.Provider>
  );
};

const useConfirmationModalContext = () => useContext(ConfirmationModalContext);

export { useModalShow, useConfirmationModalContext };

export default ConfirmationModalContextProvider;
