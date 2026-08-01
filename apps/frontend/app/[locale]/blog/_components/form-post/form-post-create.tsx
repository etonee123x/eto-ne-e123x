'use client';

import { Button } from '@/components/ui/button';
import { FormPostBase } from './form-post-base';

import { useTranslations } from 'next-intl';
import { type ComponentProps } from 'react';
import { client } from '@/lib/api/client';

const onSubmit: ComponentProps<typeof FormPostBase>['onSubmit'] = (...[, post, files]) => {
  client['/posts'].POST({
    body: {
      files: [],
      text: post.text,
    },
    bodySerializer: (body) => {
      const formData = new FormData();

      formData.append('text', body.text);

      files.forEach((file) => {
        formData.append('files', file);
      });

      return formData;
    },
  });
};

export const FormPostCreate = () => {
  const t = useTranslations('FormPostCreate');

  return (
    <>
      <FormPostBase id="form-create-post" onSubmit={onSubmit} />

      <Button size="lg" className="w-full mt-2" type="submit" form="form-create-post">
        {t('send')}
      </Button>
    </>
  );
};
