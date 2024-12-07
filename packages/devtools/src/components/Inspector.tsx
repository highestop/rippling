import { useSet } from 'rippling';
import { resizable } from '../atoms/resizable';
import { Sidebar } from './Sidebar';
import { StoreDetail } from './StoreDetail';
import { useLayoutEffect, useRef } from 'react';

export function Inspector() {
  const handlerElem = useRef<HTMLDivElement>(null);
  const targetElem = useRef<HTMLDivElement>(null);
  const bindResizable = useSet(resizable);

  useLayoutEffect(() => {
    if (!handlerElem.current || !targetElem.current) return;
    const ctrl = new AbortController();
    bindResizable(handlerElem.current, targetElem.current, 'horizontal', ctrl.signal);
    return () => {
      ctrl.abort();
    };
  }, []);

  return (
    <div className="min-h-screen h-screen bg-[#f3f3f3] text-[#333333] flex flex-col">
      <div className="flex flex-1 overflow-hidden store-inspector-container">
        <div ref={targetElem} className="w-[25%] border-r border-[#e0e0e0] bg-[#f3f3f3]">
          <Sidebar />
        </div>
        <div ref={handlerElem} className="w-[5px] cursor-col-resize relative group">
          <div className="absolute w-[1px] top-0 bottom-0 left-1/2 -translate-x-[0.5px] bg-[#e0e0e0] group-hover:bg-[#2196f3]" />
        </div>
        <div className="flex-1 bg-white">
          <StoreDetail />
        </div>
      </div>
    </div>
  );
}
