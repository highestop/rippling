function generateMockEvents() {
  // ... 保持原有的 generateMockEvents 函数不变
}

export function EventLog() {
  const events = generateMockEvents();

  return (
    <div className="h-full border-b border-[#eee8d5] bg-[#fdf6e3] flex flex-col">
      <div className="p-2 bg-[#e4ddc9] flex justify-between items-center">
        <div></div>
        <div>
          <input
            type="text"
            placeholder="debug label"
            className="px-3 py-1 rounded border border-[#93a1a1] bg-[#fdf6e3] text-[#586e75] text-sm focus:outline-none focus:border-[#586e75]"
          />
        </div>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full text-sm text-[#586e75]">
          {/* ... 保持原有的表格结构不变 */}
        </table>
      </div>
    </div>
  );
}
