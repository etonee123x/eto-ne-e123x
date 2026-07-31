import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment';
import { X, FileQuestionMark } from 'lucide-react';
import { ComponentProps } from 'react';

export const FormAttachmentUnknown = ({
  name,
  className,
  onClickRemove,
}: {
  name: ComponentProps<typeof AttachmentTitle>['children'];
  className: ComponentProps<typeof Attachment>['className'];
  onClickRemove: ComponentProps<typeof AttachmentAction>['onClick'];
}) => {
  return (
    <Attachment className={className}>
      <AttachmentMedia>
        <FileQuestionMark className="size-6" />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{name}</AttachmentTitle>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction onClick={onClickRemove}>
          <X />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  );
};
