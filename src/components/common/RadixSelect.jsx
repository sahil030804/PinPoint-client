'use client';

import * as Select from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RadixSelect({ value, onChange, options, placeholder, variant, disabled, triggerClassName, itemClassName }) {
  const isGhost = variant === 'ghost';
  return (
    <Select.Root value={value} onValueChange={onChange} disabled={disabled}>
      <Select.Trigger
        className={cn(
          'inline-flex items-center justify-between gap-1 whitespace-nowrap transition-colors',
          isGhost
            ? 'rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground'
            : 'rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary',
          triggerClassName
        )}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon>
          <ChevronDown className={cn('h-4 w-4 shrink-0', isGhost ? 'text-muted-foreground' : 'text-muted-foreground')} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="z-50 min-w-[var(--radix-select-trigger-width)] rounded-lg border border-border bg-card p-1 shadow-lg"
          position="popper"
          sideOffset={4}
        >
          <Select.Viewport>
            {options.map((opt) => {
              const v = typeof opt === 'string' ? opt : opt.value;
              const label = typeof opt === 'string' ? opt : opt.label;
              return (
                <Select.Item
                  key={v}
                  value={v}
                  className={cn(
                    'relative flex cursor-default select-none items-center rounded-md px-3 py-2 pr-8 text-sm text-foreground',
                    'data-[highlighted]:bg-muted data-[highlighted]:text-foreground',
                    'data-[state=checked]:text-foreground',
                    itemClassName
                  )}
                >
                  <Select.ItemText>{label}</Select.ItemText>
                  <Select.ItemIndicator className="absolute right-2">
                    <Check className="h-3.5 w-3.5 text-primary" />
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
