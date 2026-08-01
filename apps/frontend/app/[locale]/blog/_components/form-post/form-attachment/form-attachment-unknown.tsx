import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment';
import { X, FileQuestionMark, Grip } from 'lucide-react';
import { ComponentProps } from 'react';

export const FormAttachmentUnknown = ({
  name,
  onClickRemove,
  ...props
}: {
  name: ComponentProps<typeof AttachmentTitle>['children'];
  onClickRemove: ComponentProps<typeof AttachmentAction>['onClick'];
} & ComponentProps<typeof Attachment>) => {
  return (
    <Attachment {...props}>
      <AttachmentMedia>
        <FileQuestionMark className="size-6" />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{name}</AttachmentTitle>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction>
          <Grip />
        </AttachmentAction>
        <AttachmentAction onClick={onClickRemove}>
          <X />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  );
};
