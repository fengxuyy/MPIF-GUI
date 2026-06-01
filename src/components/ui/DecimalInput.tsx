import React, { useState, useEffect, useRef } from 'react';
import { Input } from './input';

interface DecimalInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

/**
 * A numeric input that maintains its own local string state while the field is
 * focused.  This prevents react-hook-form from re-rendering the input with a
 * parsed numeric value (e.g. "5" when the user typed "5.") which would reset
 * the cursor position back to the start.
 */
export const DecimalInput = React.forwardRef<HTMLInputElement, DecimalInputProps>(
  ({ value, onChange, onBlur, className, ...props }, ref) => {
    const toDisplay = (v: number | undefined) =>
      v !== undefined && !isNaN(v) ? String(v) : '';

    const [localValue, setLocalValue] = useState<string>(toDisplay(value));
    const isFocused = useRef(false);

    // Only sync the display from props when the field is NOT focused, so
    // intermediate states ("5.", "1.0e") are never overwritten while typing.
    useEffect(() => {
      if (!isFocused.current) {
        setLocalValue(toDisplay(value));
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setLocalValue(raw);

      if (raw === '' || raw === '-') {
        onChange(undefined);
      } else {
        const num = parseFloat(raw);
        if (!isNaN(num)) {
          // Report numeric value to the form (e.g. 5 when raw is "5."),
          // but the *display* keeps the raw string because isFocused guards
          // the useEffect above.
          onChange(num);
        }
        // If raw is not yet parseable (shouldn't normally happen with
        // inputMode="decimal") we leave the form value unchanged.
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      isFocused.current = false;
      // Tidy the display on blur (remove trailing dots, etc.)
      const num = parseFloat(localValue);
      if (!isNaN(num)) {
        setLocalValue(String(num));
        onChange(num);
      } else {
        setLocalValue('');
        onChange(undefined);
      }
      onBlur?.(e as any);
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="decimal"
        value={localValue}
        className={className}
        onChange={handleChange}
        onFocus={() => { isFocused.current = true; }}
        onBlur={handleBlur}
      />
    );
  }
);

DecimalInput.displayName = 'DecimalInput';
