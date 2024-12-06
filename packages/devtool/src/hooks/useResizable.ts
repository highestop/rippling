import { useCallback, useRef, useState } from "react";

export function useResizable(
  axis: "x" | "y",
  initialSize = "50%",
  containerSelector?: string
) {
  const [size, setSize] = useState(initialSize);
  const isResizing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef(0);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      isResizing.current = true;
      startPos.current = { x: e.clientX, y: e.clientY };

      let container: Element | null;
      if (containerSelector) {
        container = document.querySelector(containerSelector);
      } else {
        container = (e.target as HTMLElement).parentElement;
      }
      if (!container) return;

      const rect = container.getBoundingClientRect();
      startSize.current = axis === "x" ? rect.width : rect.height;

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [axis, containerSelector]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing.current) return;

      let container: Element | null;
      if (containerSelector) {
        container = document.querySelector(containerSelector);
      } else {
        container = (e.target as HTMLElement).parentElement;
      }
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const delta =
        axis === "x"
          ? e.clientX - startPos.current.x
          : e.clientY - startPos.current.y;

      const containerSize = axis === "x" ? rect.width : rect.height;
      const newSizePixels = startSize.current + delta;
      const newSizePercent = (newSizePixels / containerSize) * 100;

      setSize(`${String(Math.max(10, Math.min(90, newSizePercent)))}%`);
    },
    [axis, containerSelector]
  );

  const handleMouseUp = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  return {
    size,
    handleMouseDown: (e: React.MouseEvent) => {
      handleMouseDown(e as unknown as MouseEvent);
    },
  };
}
