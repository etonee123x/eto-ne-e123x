import { queryOptions, useQuery } from '@tanstack/react-query';
import { getPosts } from '../api/get-posts';

export const postsQueryKey = ['posts'] as const;

export const postsQueryOptions = () => {
  return queryOptions({
    queryKey: [...postsQueryKey, 'list'],
    queryFn: getPosts,
  });
};

export const useQueryPosts = () => {
  return useQuery(postsQueryOptions());
};
