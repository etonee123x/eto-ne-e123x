import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Link } from '@/i18n/navigation';
import React from 'react';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { cn } from '@/lib/utils/cn';
import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from './locale-switcher';

export default function TheHeader({ className }: Readonly<React.HTMLProps<HTMLDivElement>>) {
  const t = useTranslations('TheHeader');

  const navigationMenuItems = [
    {
      href: '/explorer',
      text: t('content'),
    },
    {
      href: '/blog',
      text: t('blog'),
    },
  ];

  return (
    <header className={cn('layout-container flex items-center py-2 gap-4', className)}>
      <NavigationMenu>
        <NavigationMenuList>
          {navigationMenuItems.map((navigationMenuItem) => {
            return (
              <NavigationMenuItem key={navigationMenuItem.href}>
                <NavigationMenuLink
                  render={<Link href={navigationMenuItem.href} />}
                  className={navigationMenuTriggerStyle()}
                >
                  {navigationMenuItem.text}
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
