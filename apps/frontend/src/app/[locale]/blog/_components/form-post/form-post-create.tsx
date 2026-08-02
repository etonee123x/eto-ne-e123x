'use client';

import { Button } from '@/shared/ui/ds/button';
import { FormPostBase } from './form-post-base';

import { useTranslations } from 'next-intl';
import { type ComponentProps, useState } from 'react';
import { client } from '@/shared/api/client';
import { useRouter } from '@/i18n/navigation';

export const FormPostCreate = () => {
  const t = useTranslations('FormPostCreate');
  const router = useRouter();
  const [isFormValid, setIsFormValid] = useState(false);

  const onSubmit: ComponentProps<typeof FormPostBase>['onSubmit'] = async (...[, post, files]) => {
    await client['/posts'].POST({
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

    router.refresh();
  };

  const onValidityChange: ComponentProps<typeof FormPostBase>['onValidityChange'] = (isValid) => {
    setIsFormValid(isValid);
  };

  return (
    <>
      <FormPostBase id="form-create-post" {...{ onValidityChange, onSubmit }} />

      {isFormValid && (
        <Button size="lg" className="w-full mt-2" type="submit" form="form-create-post">
          {t('send')}
        </Button>
      )}
    </>
  );
};
