import React from "react";
import { MenuItem } from "../MenuItem";
import styles from "./TabsPanel.module.css";
import classNames from "classnames";

export const TabsPanel = ({
  activeTab,
  handleTabChange,
  addTab,
  children,
  lists,
}) => {
  const renderMenu = () => {
    return children.map((elem, index) => {
      return (
        <div key={elem.props.id}>
          <MenuItem
            key={elem.props.title + elem.props.id}
            activeTab={activeTab}
            handleTabChange={handleTabChange}
            title={elem.props.title}
            index={index}
            disabled={activeTab === index}
            color={lists[index].color}
          />
        </div>
      );
    });
  };

  return (
    <div>
      <ul className={styles.tabs}>
        {renderMenu()}
        <li
          onClick={addTab}
          className={classNames(styles.tab, {
            [styles.hover]: true,
          })}
        >
          +
        </li>
      </ul>
      <div className={styles.tabContent}>{children[activeTab]}</div>
    </div>
  );
};
