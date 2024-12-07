import { $computed, $effect, $value } from 'rippling';

const _selectedStoreIndex = $value<number | undefined>(1);
export const selectedStoreIndex = $computed((get) => get(_selectedStoreIndex));
export const updateSelectedStoreIndex = $effect((get, set, index: number) => {
  set(_selectedStoreIndex, index);
});
