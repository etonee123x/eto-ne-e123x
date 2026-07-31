import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment';
import { Music, X } from 'lucide-react';
import { ComponentProps } from 'react';

export const FormAttachmentAudio = ({
  src,
  name,
  className,
  onClickRemove,
}: Pick<ComponentProps<'audio'>, 'src'> & {
  name: ComponentProps<typeof AttachmentTitle>['children'];
  className: ComponentProps<typeof Attachment>['className'];
  onClickRemove: ComponentProps<typeof AttachmentAction>['onClick'];
}) => {
  return (
    <Attachment className={className}>
      <AttachmentMedia>
        <Music />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{name}</AttachmentTitle>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction onClick={onClickRemove}>
          <X />
        </AttachmentAction>
      </AttachmentActions>
      <audio src={src} controls className={className} />
    </Attachment>
  );
};
