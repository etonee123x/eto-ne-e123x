import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from '@/components/ui/navigation-menu';
import { HTMLProps } from 'react';
import { cn } from '@/lib/utils/cn';
import { ThemeSwitcher } from './theme-switcher';
import { LocaleSwitcher } from './locale-switcher';
import { ButtonLogout } from './button-logout';
import { NavigationMenuLink } from './navigation-menu-link';
import { getIsAdmin } from '@/lib/auth/get-is-admin';
import { getTranslations } from 'next-intl/server';

export const TheHeader = async ({ className }: Readonly<HTMLProps<HTMLDivElement>>) => {
  const t = await getTranslations('TheHeader');
  const isAdmin = await getIsAdmin();

  const NAVIGATION_MENU_ITEMS = [
    {
      className: 'text-xl text-primary',
      href: '/',
      text: t('etonee123x'),
    },
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
      <NavigationMenu className="-ms-2.5">
        <NavigationMenuList>
          {NAVIGATION_MENU_ITEMS.map((navigationMenuItem) => {
            return (
              <NavigationMenuItem key={navigationMenuItem.href}>
                <NavigationMenuLink href={navigationMenuItem.href} className={navigationMenuItem.className}>
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
        {isAdmin && <ButtonLogout />}
      </div>
    </header>
  );
};
