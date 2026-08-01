'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { type components } from '@/lib/types/openapi';
import { fileToFileWithHashName } from '@/lib/utils/file-to-file-with-hash-name';
import { FilePlus2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type ComponentProps, type ComponentRef, type HTMLProps, useEffect, useRef, useState } from 'react';
import { FormAttachment } from './form-attachment';
import { extensionToFileType, FILE_TYPES } from '@/lib/helpers/folder-data';
import { nonNullable } from '@/lib/utils/non-nullable';
import { DragDropProvider } from '@dnd-kit/react';
import { isSortable, useSortable } from '@dnd-kit/react/sortable';

type Post = Omit<components['schemas']['PostUpdateRequest'], 'files'>;
type Attachment = NonNullable<Post['attachments'][number]>;
type FileOrAttachment = File | Attachment;

const onKeyDownTextarea: ComponentProps<typeof Textarea>['onKeyDown'] = (event) => {
  if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) {
    return;
  }

  if (navigator.maxTouchPoints !== 0) {
    return;
  }

  event.preventDefault();
  event.currentTarget.form?.requestSubmit();
};

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

const SortableFormAttachment = ({
  id,
  index,
  fileOrAttachment,
  onClickRemoveByIndex,
}: {
  id: string;
  index: number;
  fileOrAttachment: FileOrAttachment;
  onClickRemoveByIndex: (index: number) => void;
}) => {
  const { handleRef, ref } = useSortable({ id, index });

  return (
    <FormAttachment
      ref={ref}
      handleRef={handleRef}
      src={fileOrAttachmentToSrc(fileOrAttachment)}
      type={fileOrAttachmentToType(fileOrAttachment)}
      name={fileOrAttachment.name}
      onClickRemove={() => {
        onClickRemoveByIndex(index);
      }}
      className="w-full"
    />
  );
};

const INITIAL_STATE = {
  text: '',
  filesAndAttachments: [] as Array<Attachment>,
};

export const FormPostBase = ({
  onSubmit,
  onValidityChange,
  ...props
}: Omit<
  //
  HTMLProps<HTMLFormElement>,
  'onSubmit'
> & {
  onSubmit: (event: SubmitEvent, post: Post, files: Array<File>) => void | Promise<void>;
  onValidityChange?: (isValid: boolean) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<ComponentRef<typeof Textarea>>(null);

  const [modelText, setModelText] = useState(INITIAL_STATE.text);
  const [modelFilesAndAttachments, setModelFilesAndAttachments] = useState<Array<FileOrAttachment>>(
    INITIAL_STATE.filesAndAttachments,
  );

  const isValid = modelText.length > 0 || modelFilesAndAttachments.length > 0;

  const t = useTranslations('FormPost');

  useEffect(() => {
    onValidityChange?.(isValid);
  }, [isValid, onValidityChange]);

  const onClickButtonAddAttachment = () => {
    inputRef.current?.click();
  };

  const onChangeInputFiles: ComponentProps<'input'>['onChange'] = (event) => {
    const files = [...(event.currentTarget.files ?? [])];

    if (files.length === 0) {
      return;
    }

    setModelFilesAndAttachments((modelFilesAndAttachments) => {
      return [
        ...modelFilesAndAttachments,
        ...files.map((file) => {
          return fileToFileWithHashName(file);
        }),
      ];
    });

    event.currentTarget.value = '';
  };

  const _onSubmit: ComponentProps<'form'>['onSubmit'] = async (event) => {
    event.preventDefault();

    if (!isValid) {
      return;
    }

    await onSubmit(
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

    setModelText(INITIAL_STATE.text);
    setModelFilesAndAttachments(INITIAL_STATE.filesAndAttachments);
    textareaRef.current?.focus();
  };

  const onClickDeleteFiles = () => {
    setModelFilesAndAttachments(INITIAL_STATE.filesAndAttachments);
  };

  const onClickRemoveByIndex = (index: number) => {
    setModelFilesAndAttachments((modelFilesAndAttachments) => {
      return modelFilesAndAttachments.toSpliced(index, 1);
    });
  };

  const onDragEnd: ComponentProps<typeof DragDropProvider>['onDragEnd'] = (event) => {
    const { source } = event.operation;

    if (event.canceled || !isSortable(source) || source.initialIndex === source.index) {
      return;
    }

    setModelFilesAndAttachments((modelFilesAndAttachments) => {
      const fileOrAttachment = modelFilesAndAttachments[source.initialIndex];

      return modelFilesAndAttachments.toSpliced(source.initialIndex, 1).toSpliced(source.index, 0, fileOrAttachment);
    });
  };

  return (
    <form {...props} className="flex flex-col gap-4" onSubmit={_onSubmit}>
      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          aria-label={t('message')}
          placeholder={t('message')}
          value={modelText}
          onChange={(event) => {
            setModelText(event.target.value);
          }}
          onKeyDown={onKeyDownTextarea}
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
          <DragDropProvider onDragEnd={onDragEnd}>
            <div className="flex gap-4 flex-col group/form-post-base-attachments">
              {modelFilesAndAttachments.map((fileOrAttachment, index) => {
                return (
                  <SortableFormAttachment
                    id={fileOrAttachmentToKey(fileOrAttachment)}
                    index={index}
                    key={fileOrAttachmentToKey(fileOrAttachment)}
                    fileOrAttachment={fileOrAttachment}
                    onClickRemoveByIndex={onClickRemoveByIndex}
                  />
                );
              })}
            </div>
          </DragDropProvider>
          <Button className="self-end" size="sm" variant="ghost" onClick={onClickDeleteFiles}>
            {t('clearAll')}
            <X />
          </Button>
        </div>
      )}
    </form>
  );
};
