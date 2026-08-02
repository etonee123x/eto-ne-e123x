import type { components } from '@/shared/api/openapi';
import dynamic from 'next/dynamic';
import { FILE_TYPES } from '@/shared/utils/file-types';
import { checkExhaustive } from '@/shared/utils/check-exhaustive';

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

export default function PostAttachment({
  attachment,
  index,
}: Readonly<{
  attachment: components['schemas']['FolderDataItemFile'];
  index: number;
}>) {
  switch (attachment.fileType) {
    case FILE_TYPES.IMAGE: {
      return <PostAttachmentImage attachment={attachment} index={index} />;
    }
    case FILE_TYPES.AUDIO: {
      return <PostAttachmentAudio attachment={attachment} />;
    }
    case FILE_TYPES.VIDEO: {
      return <PostAttachmentVideo attachment={attachment} />;
    }
    case FILE_TYPES.UNKNOWN: {
      return <PostAttachmentUnknown attachment={attachment} />;
    }
    default: {
      throw checkExhaustive(attachment);
    }
  }
}
