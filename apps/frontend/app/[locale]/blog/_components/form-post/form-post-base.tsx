'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { components } from '@/lib/types/openapi';
import { fileToFileWithHashName } from '@/lib/utils/file-to-file-with-hash-name';
import { FilePlus2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ComponentProps, HTMLProps, useRef, useState } from 'react';
import { FormAttachment } from './form-attachment';
import { extensionToFileType, FILE_TYPES } from '@/lib/helpers/folder-data';
import { nonNullable } from '@/lib/utils/non-nullable';

type Post = Omit<components['schemas']['PostUpdateRequest'], 'files'>;
type Attachment = NonNullable<Post['attachments'][number]>;
type FileOrAttachment = File | Attachment;

const fileOrAttachmentToKey = (fileOrAttachment: FileOrAttachment) => {
  return fileOrAttachment instanceof File
    ? [fileOrAttachment.name, fileOrAttachment.type, fileOrAttachment.lastModified, fileOrAttachment.size].join('-')
    : [fileOrAttachment.name, fileOrAttachment.src].join('-');
};

const fileOrAttachmentToType = (fileOrAttachment: FileOrAttachment) => {
  return fileOrAttachment instanceof File
    ? (extensionToFileType(
        `.${nonNullable(/^[^/]+\/(?<extension>.*)$/.exec(fileOrAttachment.type)?.groups?.extension)}`,
      ) ?? FILE_TYPES.UNKNOWN)
    : fileOrAttachment.fileType;
};

// новояз
// eslint-disable-next-line unicorn/prevent-abbreviations
const fileOrAttachmentToSrc = (fileOrAttachment: FileOrAttachment) => {
  return fileOrAttachment instanceof File ? URL.createObjectURL(fileOrAttachment) : fileOrAttachment.src;
};

export const FormPostBase = ({
  onSubmit,
  ...props
}: Omit<
  //
  HTMLProps<HTMLFormElement>,
  'onSubmit'
> & {
  onSubmit: (event: SubmitEvent, post: Post, files: Array<File>) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [modelText, setModelText] = useState('');

  const [modelFilesAndAttachments, setModelFilesAndAttachments] = useState<Array<FileOrAttachment>>([]);

  const t = useTranslations('FormPost');

  const onClickButtonAddAttachment = () => {
    inputRef.current?.click();
  };

  const onChangeInputFiles: ComponentProps<'input'>['onChange'] = (event) => {
    const files = event.target.files;

    if (!files) {
      return;
    }

    setModelFilesAndAttachments((modelFilesAndAttachments) => {
      return [
        ...modelFilesAndAttachments,
        ...[...files].map((file) => {
          return fileToFileWithHashName(file);
        }),
      ];
    });

    if (!inputRef.current) {
      return;
    }

    inputRef.current.value = '';
  };

  const _onSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault();

    onSubmit(
      event.nativeEvent,
      {
        text: modelText,
        attachments: modelFilesAndAttachments.map((fileOrAttachment) => {
          return fileOrAttachment instanceof File ? null : fileOrAttachment;
        }),
      },
      modelFilesAndAttachments.filter((fileOrAttachment): fileOrAttachment is File => {
        return fileOrAttachment instanceof File;
      }),
    );
  };

  const onClickDeleteFiles = () => {
    setModelFilesAndAttachments([]);
  };

  const onClickRemoveByIndex = (index: number) => {
    setModelFilesAndAttachments((modelFilesAndAttachments) => {
      return modelFilesAndAttachments.toSpliced(index, 1);
    });
  };

  return (
    <form {...props} className="flex flex-col gap-4" onSubmit={_onSubmit}>
      <div className="flex gap-2">
        <Textarea
          aria-label={t('message')}
          placeholder={t('message')}
          value={modelText}
          onChange={(event) => {
            setModelText(event.target.value);
          }}
        />
        <div className="sticky top-[calc(var(--spacing-header-height)+var(--spacing)*2)] flex flex-col gap-2 h-min">
          <Button className="h-auto p-2" onClick={onClickButtonAddAttachment}>
            <FilePlus2 className="size-8" />
          </Button>
          <input ref={inputRef} tabIndex={-1} multiple type="file" className="sr-only" onChange={onChangeInputFiles} />
        </div>
      </div>
      {modelFilesAndAttachments.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-4 flex-col">
            {modelFilesAndAttachments.map((fileOrAttachment, index) => {
              return (
                <FormAttachment
                  key={fileOrAttachmentToKey(fileOrAttachment)}
                  src={fileOrAttachmentToSrc(fileOrAttachment)}
                  type={fileOrAttachmentToType(fileOrAttachment)}
                  name={fileOrAttachment.name}
                  onClickRemove={() => {
                    onClickRemoveByIndex(index);
                  }}
                  className="w-full"
                />
              );
            })}
          </div>
          <Button className="self-end" size="sm" variant="ghost" onClick={onClickDeleteFiles}>
            {t('clearAll')}
            <X />
          </Button>
        </div>
      )}
    </form>
  );
};
