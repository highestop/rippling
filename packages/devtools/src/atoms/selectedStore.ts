import { $computed, $func, $value } from 'rippling';

const _selectedStoreIndex = $value<number | undefined>(1);
export const selectedStoreIndex = $computed((get) => get(_selectedStoreIndex));
export const updateSelectedStoreIndex = $func(({ set }, index: number) => {
  set(_selectedStoreIndex, index);
});
