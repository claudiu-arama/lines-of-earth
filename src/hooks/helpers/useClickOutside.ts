import { useCallback, useEffect } from "react";

// TODO: replace `any` with proper types
export const useClickOutside = (ref: any, isOpen: any, callback: any) => {
  const handleClickOutside = useCallback(
    (event: any) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    },
    [callback]
  );
  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);
};
