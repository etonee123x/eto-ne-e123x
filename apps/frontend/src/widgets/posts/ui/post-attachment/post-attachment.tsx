import dynamic from 'next/dynamic';
import { FILE_TYPES } from '@/entities/file/@x/post';
import { checkExhaustive } from '@/shared/utils/check-exhaustive';
import type { components } from '@/shared/api/openapi';

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
  attachment,
  index,
  onClick,
}: Readonly<{
  attachment: components['schemas']['FolderDataItemFile'];
  index: number;
  onClick: () => void;
}>) => {
  switch (attachment.fileType) {
    case FILE_TYPES.IMAGE: {
      return <PostAttachmentImage {...{ attachment, onClick, index }} />;
    }
    case FILE_TYPES.AUDIO: {
      return <PostAttachmentAudio {...{ attachment }} />;
    }
    case FILE_TYPES.VIDEO: {
      return <PostAttachmentVideo {...{ attachment, onClick }} />;
    }
    case FILE_TYPES.UNKNOWN: {
      return <PostAttachmentUnknown {...{ attachment }} />;
    }
    default: {
      throw checkExhaustive(attachment);
    }
  }
};
