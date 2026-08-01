import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment';
import { Grip, X } from 'lucide-react';
import { type ComponentProps } from 'react';

export const FormAttachmentVideo = ({
  src,
  name,
  onClickRemove,
  handleRef,
  ...props
}: Pick<ComponentProps<'video'>, 'src'> & {
  name: ComponentProps<typeof AttachmentTitle>['children'];
  onClickRemove: ComponentProps<typeof AttachmentAction>['onClick'];
  handleRef: ComponentProps<typeof AttachmentAction>['ref'];
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
        <AttachmentAction
          className="cursor-grab group-not-has-[>:nth-child(2)]/form-post-base-attachments:hidden"
          size="lg"
          ref={handleRef}
        >
          <Grip />
        </AttachmentAction>
        <AttachmentAction className="ms-2" variant="destructive" onClick={onClickRemove}>
          <X />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  );
};
