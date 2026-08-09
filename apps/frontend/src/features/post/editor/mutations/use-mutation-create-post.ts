import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost } from '../api/create-post';

const postsQueryKey = ['posts'] as const;

export const useMutationCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Awaited<ReturnType<typeof createPost>>,
    Error,
    {
      data: Parameters<typeof createPost>[0];
      files: Parameters<typeof createPost>[1];
    }
  >({
    mutationFn: ({ data, files }) => {
      return createPost(data, files);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: postsQueryKey });
    },
  });
};
