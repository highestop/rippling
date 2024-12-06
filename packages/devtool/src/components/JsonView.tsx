import ReactJson from "react-json-view";

export function JsonView() {
  const mockData = {
    store: {
      name: "TodoStore",
      state: {
        todos: [
          { id: 1, text: "Learn React", completed: true },
          { id: 2, text: "Learn TypeScript", completed: false },
          { id: 3, text: "Build an app", completed: false },
        ],
        filter: "all",
        loading: false,
      },
      actions: ["addTodo", "toggleTodo", "setFilter"],
    },
  };

  return (
    <ReactJson
      src={mockData}
      theme="solarized"
      displayDataTypes={false}
      enableClipboard={false}
      collapsed={1}
      style={{
        fontFamily: "monospace",
        height: "100%",
        backgroundColor: "#002b36",
      }}
    />
  );
}
