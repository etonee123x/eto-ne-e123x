import type { Attachment, AttachmentAction, AttachmentTitle } from '@/components/ui/attachment';
import { FILE_TYPES } from '@/lib/helpers/folder-data';
import { checkExhaustive } from '@/lib/utils/check-exhaustive';
import dynamic from 'next/dynamic';
import { ComponentProps } from 'react';

const FormAttachmentAudio = dynamic(() => {
  return import('./form-attachment-audio').then((module) => {
    return module.FormAttachmentAudio;
  });
});

const FormAttachmentImage = dynamic(() => {
  return import('./form-attachment-image').then((module) => {
    return module.FormAttachmentImage;
  });
});

const FormAttachmentVideo = dynamic(() => {
  return import('./form-attachment-video').then((module) => {
    return module.FormAttachmentVideo;
  });
});

const FormAttachmentUnknown = dynamic(() => {
  return import('./form-attachment-unknown').then((module) => {
    return module.FormAttachmentUnknown;
  });
});

export const FormAttachment = ({
  type,
  ...props
}: {
  type: (typeof FILE_TYPES)[keyof typeof FILE_TYPES];
  src: string;
  name: ComponentProps<typeof AttachmentTitle>['children'];
  className: ComponentProps<typeof Attachment>['className'];
  onClickRemove: ComponentProps<typeof AttachmentAction>['onClick'];
  ref: ComponentProps<typeof Attachment>['ref'];
}) => {
  switch (type) {
    case FILE_TYPES.AUDIO: {
      return <FormAttachmentAudio {...props} />;
    }
    case FILE_TYPES.IMAGE: {
      return <FormAttachmentImage {...props} />;
    }
    case FILE_TYPES.VIDEO: {
      return <FormAttachmentVideo {...props} />;
    }
    case FILE_TYPES.UNKNOWN: {
      return <FormAttachmentUnknown {...props} />;
    }
    default: {
      throw checkExhaustive(type);
    }
  }
};
