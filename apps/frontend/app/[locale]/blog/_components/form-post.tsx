import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils/cn';
import { useTranslations } from 'next-intl';
import { HTMLProps } from 'react';

export const FormPost = ({ className, ...props }: HTMLProps<HTMLFormElement>) => {
  const t = useTranslations('FormPost');

  return (
    <form {...props} className={cn('flex gap-4 flex-col', className)}>
      <label className="sr-only" htmlFor="text">
        {t('message')}
      </label>
      {/* TODO: fix me, могут быть несколько форм на странице */}
      <Textarea id="text" placeholder={t('message')} />
    </form>
  );
};
