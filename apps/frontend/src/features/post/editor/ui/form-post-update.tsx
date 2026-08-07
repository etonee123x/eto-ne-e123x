import { useRouter } from '@/i18n/navigation';
import { client } from '@/shared/api/client';
import { useState, type ComponentProps } from 'react';
import { FormPostBase } from './form-post-base';
import type { components } from '@/shared/api/openapi';

export const FormPostUpdate = ({ postId }: { postId: components['schemas']['PostResponse']['_meta']['id'] }) => {
  const router = useRouter();
  const [isFormValid, setIsFormValid] = useState(false);

  const onSubmit: ComponentProps<typeof FormPostBase>['onSubmit'] = async (...[, post, files]) => {
    await client['/posts/{id}'].PATCH({
      params: {
        path: {
          id: postId,
        },
      },
      body: {
        ...post,
        files: [],
      },
      bodySerializer: (body) => {
        const formData = new FormData();

        formData.append('text', body.text);
        formData.append(`attachments`, JSON.stringify(body.attachments));

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

  return <FormPostBase {...{ onValidityChange, onSubmit }} />;
};
