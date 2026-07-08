import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';

interface EditableSelectProps {
  options: string[];
  value?: string;
  onChange: (value: string) => void;
  [key: string]: any; // Allow other props
}

export function EditableSelect({ options, value, onChange, ...props }: EditableSelectProps) {
  const [inputValue, setInputValue] = useState(value || '');
  const [showOptions, setShowOptions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setShowOptions(true);
  };

  const handleOptionClick = (option: string) => {
    setInputValue(option);
    onChange(option);
    setShowOptions(false);
  };

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowOptions(true)}
        {...props}
        className="w-full"
      />
      {showOptions && filteredOptions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg mt-1 max-h-60 overflow-auto text-zinc-900 dark:text-zinc-100">
          {filteredOptions.map((option) => (
            <li
              key={option}
              onClick={() => handleOptionClick(option)}
              className="px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-900 dark:hover:text-purple-100"
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
