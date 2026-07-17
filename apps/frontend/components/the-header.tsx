'use client';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Link, usePathname } from '@/i18n/navigation';
import React from 'react';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { cn } from '@/lib/utils/cn';
import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from './locale-switcher';

const NAVIGATION_MENU_ITEMS = [
  {
    class: 'text-xl text-primary',
    href: '/',
    tKey: 'etonee123x',
    isActive: (pathname: string): boolean => {
      return pathname === '/';
    },
  },
  {
    href: '/explorer',
    tKey: 'content',
    isActive: (pathname: string): boolean => {
      return pathname.startsWith('/explorer');
    },
  },
  {
    href: '/blog',
    tKey: 'blog',
    isActive: (pathname: string): boolean => {
      return pathname.startsWith('/blog');
    },
  },
];

export default function TheHeader({ className }: Readonly<React.HTMLProps<HTMLDivElement>>) {
  const t = useTranslations('TheHeader');
  const pathname = usePathname();

  return (
    <header className={cn('layout-container flex items-center py-2 gap-4', className)}>
      <NavigationMenu>
        <NavigationMenuList>
          {NAVIGATION_MENU_ITEMS.map((navigationMenuItem) => {
            return (
              <NavigationMenuItem key={navigationMenuItem.href}>
                <NavigationMenuLink
                  active={navigationMenuItem.isActive(pathname)}
                  render={<Link href={navigationMenuItem.href} />}
                  className={cn(navigationMenuTriggerStyle(), navigationMenuItem.class)}
                >
                  {t(navigationMenuItem.tKey)}
                </NavigationMenuLink>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex gap-2 items-center ms-auto">
        <ThemeSwitcher />
        <LocaleSwitcher />
      </div>
    </header>
  );
}
