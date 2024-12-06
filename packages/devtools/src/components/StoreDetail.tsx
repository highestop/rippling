import { useResizable } from "../hooks/useResizable";
import { EventLog } from "./EventLog";
import { JsonView } from "./JsonView";

export function StoreDetail() {
  const { size: topHeight, handleMouseDown } = useResizable("y");

  return (
    <div className="flex flex-col h-full">
      <div style={{ height: topHeight }} className="min-h-0 h-full">
        <EventLog />
      </div>
      <div
        className="w-full h-1 bg-[#eee8d5] cursor-row-resize"
        onMouseDown={handleMouseDown}
      />
      <div
        style={{ height: `calc(100% - ${topHeight})` }}
        className="min-h-0 overflow-auto p-2 bg-[#002b36]"
      >
        <JsonView />
      </div>
    </div>
  );
}
