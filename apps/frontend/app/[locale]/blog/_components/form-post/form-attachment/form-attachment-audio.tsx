import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment';
import { Grip, Music, X } from 'lucide-react';
import { type ComponentProps } from 'react';

export const FormAttachmentAudio = ({
  src,
  name,
  onClickRemove,
  handleRef,
  ...props
}: Pick<ComponentProps<'audio'>, 'src'> & {
  name: ComponentProps<typeof AttachmentTitle>['children'];
  onClickRemove: ComponentProps<typeof AttachmentAction>['onClick'];
  handleRef: ComponentProps<typeof AttachmentAction>['ref'];
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
        <AttachmentAction className="cursor-grab" size="lg" ref={handleRef}>
          <Grip />
        </AttachmentAction>
        <AttachmentAction className="ms-2" variant="destructive" onClick={onClickRemove}>
          <X />
        </AttachmentAction>
      </AttachmentActions>
      <audio src={src} controls className="w-full" />
    </Attachment>
  );
};
