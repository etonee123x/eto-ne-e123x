'use client';
import { useRouter } from '@/i18n/navigation';
import { client } from '@/shared/api/client';
import { type ComponentProps, type Ref } from 'react';
import { FormPostBase, type FormPostBaseRef } from './form-post-base';
import type { components } from '@/shared/api/openapi';

export const FormPostUpdate = ({
  post,
  ...props
}: Omit<ComponentProps<typeof FormPostBase>, 'onSubmit'> & {
  post: components['schemas']['PostResponse'];
  ref?: Ref<FormPostBaseRef>;
}) => {
  const router = useRouter();

  const onSubmit: ComponentProps<typeof FormPostBase>['onSubmit'] = async (...[, _post, files]) => {
    await client['/posts/{id}'].PATCH({
      params: {
        path: {
          id: post._meta.id,
        },
      },
      body: {
        ..._post,
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

  return (
    <FormPostBase defaultValues={{ text: post.text, attachments: post.attachments }} onSubmit={onSubmit} {...props} />
  );
};
