import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment';
import { X } from 'lucide-react';
import { ComponentProps } from 'react';

export const FormAttachmentVideo = ({
  src,
  name,
  className,
  onClickRemove,
}: Pick<ComponentProps<'video'>, 'src'> & {
  name: ComponentProps<typeof AttachmentTitle>['children'];
  className: ComponentProps<typeof Attachment>['className'];
  onClickRemove: ComponentProps<typeof AttachmentAction>['onClick'];
}) => {
  return (
    <Attachment className={className}>
      <AttachmentMedia>
        <video src={src} />
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
