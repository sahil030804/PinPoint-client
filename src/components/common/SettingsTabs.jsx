'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SETTINGS_TABS } from '@/lib/constants';
import { Settings, Key, Users, Bell } from 'lucide-react';

const TAB_ICONS = {
  General: Settings,
  'API Keys': Key,
  Members: Users,
  Notifications: Bell,
};

export function SettingsTabs() {
  const pathname = usePathname();

  return (
    <div className="border-b border-border bg-card/50">
      <div className="px-6 sm:px-8">
        <nav className="flex gap-1 overflow-x-auto py-1">
          {SETTINGS_TABS.map((tab) => {
            const active = pathname === tab.href;
            const Icon = TAB_ICONS[tab.label];
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'group relative flex items-center gap-2 text-sm font-medium px-4 py-3 rounded-lg whitespace-nowrap transition-all duration-150',
                  active
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                )}
              >
                {Icon && (
                  <Icon
                    size={16}
                    className={cn(
                      'shrink-0 transition-colors',
                      active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />
                )}
                <span>{tab.label}</span>
                {active && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-6 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
