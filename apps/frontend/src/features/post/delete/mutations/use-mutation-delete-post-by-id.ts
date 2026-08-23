import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePostById } from '../api/delete-post-by-id';

const postsQueryKey = ['posts'] as const;

export const useMutationDeletePostById = () => {
  const queryClient = useQueryClient();

  return useMutation<Awaited<ReturnType<typeof deletePostById>>, Error, Parameters<typeof deletePostById>[0]>({
    mutationFn: (id) => {
      return deletePostById(id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: postsQueryKey });
    },
  });
};
