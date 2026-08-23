'use client';

import { Button } from '@/shared/ui/ds/button';
import { FormPost } from './form-post';

import { useTranslations } from 'next-intl';
import { type ComponentProps, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useMutationCreatePost } from '../mutations/use-mutation-create-post';

export const FormPostCreate = () => {
  const t = useTranslations('FormPostCreate');
  const router = useRouter();
  const [isFormValid, setIsFormValid] = useState(false);
  const mutationCreatePost = useMutationCreatePost();

  const onSubmit: ComponentProps<typeof FormPost>['onSubmit'] = async (...[, post, files]) => {
    await mutationCreatePost.mutateAsync({
      data: { text: post.text },
      files,
    });

    router.push('/blog', { scroll: false });
  };

  const onValidityChange: ComponentProps<typeof FormPost>['onValidityChange'] = (isValid) => {
    setIsFormValid(isValid);
  };

  return (
    <>
      <FormPost id="form-create-post" {...{ onValidityChange, onSubmit }} />

      {isFormValid && (
        <Button size="lg" className="w-full mt-2" type="submit" form="form-create-post">
          {t('send')}
        </Button>
      )}
    </>
  );
};
