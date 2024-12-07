import { $computed, $effect, $value } from 'rippling';

const maskElem = $effect((_get, _set, axis, signal: AbortSignal) => {
  const mask = document.createElement('div');
  mask.style.position = 'fixed';
  mask.style.top = '0';
  mask.style.left = '0';
  mask.style.width = '100%';
  mask.style.height = '100%';
  mask.style.backgroundColor = 'transparent';
  mask.style.pointerEvents = 'auto';
  mask.style.cursor = axis === 'horizontal' ? 'ew-resize' : 'ns-resize';
  mask.style.zIndex = '9999';
  document.body.appendChild(mask);
  signal.addEventListener('abort', () => {
    mask.remove();
  });
  return mask;
});

export const resizable = $effect(
  (
    get,
    set,
    handlerElem: HTMLElement,
    targetElem: HTMLElement,
    axis: 'horizontal' | 'vertical',
    signal: AbortSignal,
  ) => {
    const isResizing = $value(false);
    const startPos = $value(0);
    const startSize = $value(0);
    const draggingSignal = $computed((get) => {
      const controller = get(draggingController);
      if (!controller) return signal;
      return AbortSignal.any([signal, controller.signal]);
    });

    const draggingController = $value<AbortController | undefined>(undefined);
    const maskElement = $value<HTMLDivElement | undefined>(undefined);

    function handleMouseDown(e: MouseEvent) {
      get(draggingController)?.abort();
      const controller = new AbortController();
      set(draggingController, controller);

      set(isResizing, true);
      controller.signal.addEventListener('abort', () => {
        set(isResizing, false);
        get(maskElement)?.remove();
        set(maskElement, undefined);
      });

      const mask = set(maskElem, axis, get(draggingSignal));
      set(maskElement, mask);

      set(startPos, axis === 'horizontal' ? e.clientX : e.clientY);

      const rect = targetElem.getBoundingClientRect();
      set(startSize, axis === 'horizontal' ? rect.width : rect.height);

      document.addEventListener('mousemove', handleMouseMove, { signal: get(draggingSignal) });
      document.addEventListener('mouseup', handleMouseUp, { signal: get(draggingSignal) });
    }

    function handleMouseMove(e: MouseEvent) {
      if (!get(isResizing)) return;

      const delta = axis === 'horizontal' ? e.clientX - get(startPos) : e.clientY - get(startPos);
      const newSizePixels = get(startSize) + delta;
      if (axis === 'horizontal') {
        targetElem.style.width = String(newSizePixels) + 'px';
      } else {
        targetElem.style.height = String(newSizePixels) + 'px';
      }
    }

    function handleMouseUp() {
      get(draggingController)?.abort();
    }

    handlerElem.addEventListener('mousedown', handleMouseDown, { signal });
  },
);
