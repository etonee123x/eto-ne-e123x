import dynamic from 'next/dynamic';
import { FILE_TYPES } from '@/entities/file/@x/post';
import { checkExhaustive } from '@/shared/utils/check-exhaustive';
import type { ComponentProps } from 'react';

const PostAttachmentAudio = dynamic(() => {
  return import('./post-attachment-audio').then((module) => {
    return module.PostAttachmentAudio;
  });
});

const PostAttachmentImage = dynamic(() => {
  return import('./post-attachment-image').then((module) => {
    return module.PostAttachmentImage;
  });
});

const PostAttachmentVideo = dynamic(() => {
  return import('./post-attachment-video').then((module) => {
    return module.PostAttachmentVideo;
  });
});

const PostAttachmentUnknown = dynamic(() => {
  return import('./post-attachment-unknown').then((module) => {
    return module.PostAttachmentUnknown;
  });
});

export const PostAttachment = ({
  ...props
}: Readonly<
  | ComponentProps<typeof PostAttachmentImage>
  | ComponentProps<typeof PostAttachmentVideo>
  | ComponentProps<typeof PostAttachmentAudio>
  | ComponentProps<typeof PostAttachmentUnknown>
>) => {
  switch (props.attachment.fileType) {
    case FILE_TYPES.IMAGE: {
      return <PostAttachmentImage {...(props as ComponentProps<typeof PostAttachmentImage>)} />;
    }
    case FILE_TYPES.AUDIO: {
      return <PostAttachmentAudio {...(props as ComponentProps<typeof PostAttachmentAudio>)} />;
    }
    case FILE_TYPES.VIDEO: {
      return <PostAttachmentVideo {...(props as ComponentProps<typeof PostAttachmentVideo>)} />;
    }
    case FILE_TYPES.UNKNOWN: {
      return <PostAttachmentUnknown {...(props as ComponentProps<typeof PostAttachmentUnknown>)} />;
    }
    default: {
      throw checkExhaustive(props.attachment);
    }
  }
};
