import { useCallback, useEffect } from "react";

export const useClickOutside = (
  ref: React.RefObject<HTMLDivElement> | null,
  isOpen: boolean,
  callback: () => void
) => {
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (ref && ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    },
    [callback]
  ) as EventListener;
  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);
};
