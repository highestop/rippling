import { useResizable } from "./hooks/useResizable";
import { Sidebar } from "./components/Sidebar";
import { StoreDetail } from "./components/StoreDetail";

export function StoreInspector() {
  const { size: leftWidth, handleMouseDown } = useResizable(
    "x",
    "25%",
    ".store-inspector-container",
  );

  return (
    <div className="min-h-screen h-screen bg-[#fdf6e3] text-[#586e75] flex flex-col">
      <div className="flex flex-1 overflow-hidden store-inspector-container">
        <div
          style={{ width: leftWidth }}
          className="border-r border-[#eee8d5] bg-[#fdf6e3]"
        >
          <Sidebar />
        </div>
        <div
          className="w-1 hover:bg-[#eee8d5] cursor-col-resize"
          onMouseDown={handleMouseDown}
        />
        <div className="flex-1">
          <StoreDetail />
        </div>
      </div>
    </div>
  );
}
