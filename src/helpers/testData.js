const firstListInitialItemsItems = [
  {
    id: "Home",
    isGroup: false,
    name: "Home",
    checked: false,
  },
  {
    id: "Collections",
    name: "Collections",
    color: "239, 108, 0",
    isGroup: true,
    show: false,
    children: [
      { id: "Spring", name: "Spring", checked: false, display: "none" },
      { id: "Summer", name: "Summer", checked: false, display: "none" },
      { id: "Fall", name: "Fall", checked: false, display: "none" },
      { id: "Winter", name: "Winter", checked: false, display: "none" },
    ],
  },
  {
    id: "About Us",
    isGroup: false,
    name: "About Us",
    checked: false,
  },
  {
    id: "My Account",
    name: "My Account",
    isGroup: true,
    show: true,
    color: "46, 125, 50",
    children: [
      { id: "Addresses", name: "Addresses", checked: false, display: "none" },
      {
        id: "Order History",
        name: "Order History",
        checked: false,
        display: "none",
      },
    ],
  },
];

const secondListInitialItems = [
  {
    id: "Pass tests",
    name: "Pass tests",
    color: "239, 108, 0",
    show: true,
    isGroup: true,
    children: [
      { id: "Math", name: "Math", checked: false, display: "none" },
      { id: "Language", name: "Language", checked: false, display: "none" },
      { id: "Exam", name: "Exam", checked: false, display: "none" },
    ],
  },
  {
    id: "Check homework",
    isGroup: false,
    name: "Check homework",
    checked: false,
  },
  {
    id: "Clean house",
    isGroup: false,
    name: "Clean house",
    checked: false,
  },
  {
    id: "Visit doctor",
    isGroup: false,
    name: "Visit doctor",
    checked: false,
  },
  {
    id: "Dance",
    isGroup: false,
    name: "Dance",
    checked: false,
  },
  {
    id: "Help friend",
    isGroup: false,
    name: "Help friend",
    checked: false,
  },
];

export const defaultLists = [
  {
    id: 1,
    color: "",
    name: "Task list 1",
    taskList: firstListInitialItemsItems,
  },
  {
    id: 2,
    color: "",
    name: "Task list 2",
    taskList: secondListInitialItems,
  },
];
