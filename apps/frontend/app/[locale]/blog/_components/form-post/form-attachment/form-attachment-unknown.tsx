import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment';
import { X, FileQuestionMark, Grip } from 'lucide-react';
import { type ComponentProps } from 'react';

export const FormAttachmentUnknown = ({
  name,
  onClickRemove,
  handleRef,
  ...props
}: {
  name: ComponentProps<typeof AttachmentTitle>['children'];
  onClickRemove: ComponentProps<typeof AttachmentAction>['onClick'];
  handleRef: ComponentProps<typeof AttachmentAction>['ref'];
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
        <AttachmentAction className="cursor-grab" size="lg" ref={handleRef}>
          <Grip />
        </AttachmentAction>
        <AttachmentAction className="ms-2" variant="destructive" onClick={onClickRemove}>
          <X />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  );
};
