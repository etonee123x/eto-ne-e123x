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

export const FormAttachmentVideo = ({
  src,
  name,
  onClickRemove,
  ...props
}: Pick<ComponentProps<'video'>, 'src'> & {
  name: ComponentProps<typeof AttachmentTitle>['children'];
  onClickRemove: ComponentProps<typeof AttachmentAction>['onClick'];
} & ComponentProps<typeof Attachment>) => {
  return (
    <Attachment {...props}>
      <AttachmentMedia>
        <video src={src} />
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
