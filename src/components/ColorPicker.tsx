import { useRef, useState } from "react";

import { COLOR_PRESETS } from "constants/staticConstants";
import { useClickOutside } from "hooks/helpers/useClickOutside";

import style from "./ColorPicker.module.scss";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useClickOutside(ref, open, () => setOpen(false));

  return (
    <div className={style.wrapper} ref={ref}>
      <button
        className={style.trigger}
        style={{ background: value }}
        onClick={() => setOpen((o) => !o)}
        aria-label="Pick layer color"
      />
      {open && (
        <div className={style.popover}>
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              className={`${style.swatch} ${color === value ? style.active : ""}`}
              style={{ background: color }}
              onClick={() => {
                onChange(color);
                setOpen(false);
              }}
              aria-label={color}
            />
          ))}
        </div>
      )}
    </div>
  );
}
