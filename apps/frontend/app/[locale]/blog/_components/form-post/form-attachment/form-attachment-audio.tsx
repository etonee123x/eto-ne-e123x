import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment';
import { Grip, Music, X } from 'lucide-react';
import { ComponentProps } from 'react';

export const FormAttachmentAudio = ({
  src,
  name,
  onClickRemove,
  ...props
}: Pick<ComponentProps<'audio'>, 'src'> & {
  name: ComponentProps<typeof AttachmentTitle>['children'];
  onClickRemove: ComponentProps<typeof AttachmentAction>['onClick'];
} & ComponentProps<typeof Attachment>) => {
  return (
    <Attachment {...props}>
      <AttachmentMedia>
        <Music />
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
      <audio src={src} controls className="w-full" />
    </Attachment>
  );
};
