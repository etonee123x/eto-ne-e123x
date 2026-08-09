'use client';

import type { components } from '@/shared/api/openapi';
import { throwError } from '@/shared/utils/throw-error';
import { createContext, type PropsWithChildren, useContext, useState } from 'react';
import { useMutationDeletePostById } from '../mutations/use-mutation-delete-post-by-id';

type PostId = components['schemas']['PostResponse']['_meta']['id'];

interface DeletePostContextValue {
  postId: PostId | null;
  requestDeletePostById: (postId: PostId) => void;
  closeDeletePost: () => void;
  deletePostById: (postId: PostId) => Promise<void>;
}

export const DeletePostContext = createContext<DeletePostContextValue | null>(null);

export const DeletePostProvider = ({ children }: PropsWithChildren) => {
  const [postId, setPostId] = useState<PostId | null>(null);
  const mutationDeletePostById = useMutationDeletePostById();

  const requestDeletePostById = (id: PostId) => {
    setPostId(id);
  };

  const closeDeletePost = () => {
    setPostId(null);
  };

  const deletePostById = async (id: PostId) => {
    await mutationDeletePostById.mutateAsync(id);
  };

  return (
    <DeletePostContext
      value={{
        postId,
        requestDeletePostById,
        closeDeletePost,
        deletePostById,
      }}
    >
      {children}
    </DeletePostContext>
  );
};

export const useDeletePostContext = () => {
  return useContext(DeletePostContext) ?? throwError();
};
