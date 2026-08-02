'use client';

import { NavigationMenuLink as _NavigationMenuLink, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils/cn';
import { type ComponentProps } from 'react';

export const NavigationMenuLink = ({
  href,
  children,
  className,
  ...props
}: ComponentProps<typeof _NavigationMenuLink> & Required<Pick<ComponentProps<typeof _NavigationMenuLink>, 'href'>>) => {
  const pathname = usePathname();
  const isActive = pathname === href || (pathname.startsWith(href) && href !== '/');

  return (
    <_NavigationMenuLink
      {...props}
      active={isActive}
      render={<Link href={href} />}
      className={cn(navigationMenuTriggerStyle(), className)}
    >
      {children}
    </_NavigationMenuLink>
  );
};
