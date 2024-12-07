import { useSet } from 'rippling';
import { resizable } from '../atoms/resizable';
import { EventLog } from './EventLog';
import { JsonView } from './JsonView';
import { useLayoutEffect, useRef } from 'react';

export function StoreDetail() {
  const handlerElem = useRef<HTMLDivElement>(null);
  const targetElem = useRef<HTMLDivElement>(null);
  const bindResizable = useSet(resizable);

  useLayoutEffect(() => {
    if (!handlerElem.current || !targetElem.current) return;
    const ctrl = new AbortController();
    bindResizable(handlerElem.current, targetElem.current, 'vertical', ctrl.signal);
    return () => {
      ctrl.abort();
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="min-h-0 h-[50%]" ref={targetElem}>
        <EventLog />
      </div>
      <div className="w-full h-[1px] bg-[#e0e0e0] cursor-row-resize hover:bg-[#2196f3]" ref={handlerElem} />
      <div className="min-h-0 flex-1 overflow-auto p-2 bg-white">
        <JsonView />
      </div>
    </div>
  );
}
