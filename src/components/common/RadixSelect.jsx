'use client';

import * as Select from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';

export function RadixSelect({ value, onChange, options, placeholder, triggerClassName, itemClassName }) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger className={`inline-flex items-center justify-between gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white whitespace-nowrap ${triggerClassName || ''}`}>
        <Select.Value placeholder={placeholder} />
        <Select.Icon>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="z-50 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800" position="popper" sideOffset={4}>
          <Select.Viewport className="p-1">
            {options.map((opt) => {
              const v = typeof opt === 'string' ? opt : opt.value;
              const label = typeof opt === 'string' ? opt : opt.label;
              return (
                <Select.Item
                  key={v}
                  value={v}
                  className={`relative flex cursor-pointer select-none items-center rounded-md px-3 py-2 pr-8 text-sm text-gray-700 whitespace-nowrap data-[highlighted]:bg-gray-100 dark:text-gray-300 dark:data-[highlighted]:bg-gray-700 ${itemClassName || ''}`}
                >
                  <Select.ItemText>{label}</Select.ItemText>
                  <Select.ItemIndicator className="absolute right-2">
                    <Check className="h-3.5 w-3.5 text-blue-600" />
                  </Select.ItemIndicator>
                </Select.Item>
              );
            })}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
