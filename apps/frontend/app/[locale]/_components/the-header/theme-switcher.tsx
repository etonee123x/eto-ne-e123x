'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@teispace/next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations } from 'next-intl';

export const ThemeSwitcher = ({ className }: Readonly<React.ComponentProps<typeof Button>>) => {
  const { setTheme } = useTheme();
  const t = useTranslations('ThemeSwitcher');

  const themes = [
    {
      value: 'light',
      text: t('light'),
    },
    {
      value: 'dark',
      text: t('dark'),
    },
    {
      value: 'system',
      text: t('system'),
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={className}
        render={
          <Button variant="outline" size="icon">
            <Sun className="size-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute size-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">{t('toggleTheme')}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {themes.map((theme) => {
          return (
            <DropdownMenuItem
              key={theme.value}
              onClick={() => {
                setTheme(theme.value);
              }}
            >
              {theme.text}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
