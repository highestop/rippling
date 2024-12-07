import { useState } from 'react';

export function Sidebar() {
  const [selectedStore, setSelectedStore] = useState(0);

  return (
    <aside className="p-2 text-[#586e75] h-full overflow-y-auto text-sm">
      <ul className="space-y-1">
        <li
          className={`px-2 py-1 hover:bg-[#eee8d5] rounded cursor-pointer ${selectedStore === 0 ? 'bg-[#eee8d5]' : ''}`}
          onClick={() => {
            setSelectedStore(0);
          }}
        >
          Store 1
        </li>
        <li
          className={`px-2 py-1 hover:bg-[#eee8d5] rounded cursor-pointer ${selectedStore === 1 ? 'bg-[#eee8d5]' : ''}`}
          onClick={() => {
            setSelectedStore(1);
          }}
        >
          Store 2
        </li>
        <li
          className={`px-2 py-1 hover:bg-[#eee8d5] rounded cursor-pointer ${selectedStore === 2 ? 'bg-[#eee8d5]' : ''}`}
          onClick={() => {
            setSelectedStore(2);
          }}
        >
          Store 3
        </li>
      </ul>
    </aside>
  );
}
