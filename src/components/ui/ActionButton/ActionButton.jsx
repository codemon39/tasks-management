import React, { forwardRef } from "react";
import classNames from "classnames";
import styles from "./ActionButton.module.css";

export const ActionButton = forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        {...props}
        className={classNames(styles.ActionButton, className)}
      />
    );
  }
);
