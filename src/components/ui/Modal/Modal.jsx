import React from "react";
import styles from "./Modal.module.css";

export const Modal = ({ title, content, onApprove, onDeny }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h4 className={styles.modalTitle}>{title}</h4>
          </div>
          <div className={styles.modalBody}>
            <p>
              {content}
            </p>
          </div>
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onDeny}
            >
              No
            </button>
            <button
              type="button"
              className={styles.submitButton}
              onClick={onApprove}
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
