'use client';

import type { components } from '@/shared/api/openapi';
import { throwError } from '@/shared/utils/throw-error';
import { createContext, type PropsWithChildren, useContext, useState } from 'react';

type PostId = components['schemas']['PostResponse']['_meta']['id'];

interface EditPostContextValue {
  postId: PostId | null;
  enterEditPostById: (postId: PostId) => void;
  exitEditPost: () => void;
}

export const EditPostContext = createContext<EditPostContextValue | null>(null);

export const EditPostProvider = ({ children }: PropsWithChildren) => {
  const [postId, setPostId] = useState<PostId | null>(null);

  const enterEditPostById = (id: PostId) => {
    setPostId(id);
  };

  const exitEditPost = () => {
    setPostId(null);
  };

  return (
    <EditPostContext
      value={{
        postId,
        enterEditPostById,
        exitEditPost,
      }}
    >
      {children}
    </EditPostContext>
  );
};

export const useEditPostContext = () => {
  return useContext(EditPostContext) ?? throwError();
};
