import { useGet, useSet } from 'rippling';
import { selectedStoreIndex, updateSelectedStoreIndex } from '../atoms/selectedStore';
import { getMockStores } from '../mocks/mockStores';

export function Sidebar() {
  const index = useGet(selectedStoreIndex);
  const updateIndex = useSet(updateSelectedStoreIndex);
  const stores = getMockStores();

  return (
    <aside className="h-full overflow-y-auto text-[11px] bg-[#f3f3f3] border-r border-[#e0e0e0]">
      <div className="p-2 border-b border-[#e0e0e0] text-[#5f6368] font-medium">Store</div>
      <ul>
        {stores.map((store) => (
          <li
            key={store.id}
            className={`px-4 py-[6px] hover:bg-[#e8eaed] cursor-pointer ${
              index === store.id ? 'bg-[#e8eaed] text-[#1a73e8]' : 'text-[#333]'
            }`}
            onClick={() => {
              updateIndex(store.id);
            }}
          >
            {store.name}
          </li>
        ))}
      </ul>
    </aside>
  );
}
