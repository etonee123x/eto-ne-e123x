import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment';
import { Grip, X } from 'lucide-react';
import { ComponentProps } from 'react';

export const FormAttachmentImage = ({
  src,
  name,
  onClickRemove,
  ...props
}: Pick<ComponentProps<'img'>, 'src'> & {
  name: ComponentProps<typeof AttachmentTitle>['children'];
  onClickRemove: ComponentProps<typeof AttachmentAction>['onClick'];
} & ComponentProps<typeof Attachment>) => {
  return (
    <Attachment {...props}>
      <AttachmentMedia>
        <img src={src} alt="" />
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
