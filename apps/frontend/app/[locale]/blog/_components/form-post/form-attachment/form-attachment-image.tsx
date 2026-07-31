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

export const FormAttachmentImage = ({
  src,
  name,
  className,
  onClickRemove,
}: Pick<ComponentProps<'img'>, 'src'> & {
  name: ComponentProps<typeof AttachmentTitle>['children'];
  className: ComponentProps<typeof Attachment>['className'];
  onClickRemove: ComponentProps<typeof AttachmentAction>['onClick'];
}) => {
  return (
    <Attachment className={className}>
      <AttachmentMedia>
        <img src={src} alt="" />
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
