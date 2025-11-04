import { useAsyncStateApi } from '@/composables/useAsyncStateApi';
import { inject, provide } from 'vue';
import type { InjectionKey, Ref } from 'vue';

import {
  getPosts as _getPosts,
  postPost as _postPost,
  deletePost as _deletePost,
  putPost as _putPost,
  getPostById as _getPostById,
} from '@/api/posts';
import type { PostWithMetaWithSinseTimestamps } from '@/api/posts';
import { postUpload } from '@/api/upload';
import { useSourcedRef } from '@/composables/useSourcedRef';
import type { ForPost, ForPut } from '@etonee123x/shared/types/database';
import type { Post } from '@etonee123x/shared/types/blog';
import type { Id } from '@etonee123x/shared/helpers/id';
import { nonNullable } from '@/utils/nonNullable';

interface BlogContext {
  getPosts: ReturnType<
    typeof useAsyncStateApi<Array<PostWithMetaWithSinseTimestamps>, [], [Partial<{ shouldReset: boolean }>] | []>
  >;
  postPost: ReturnType<
    typeof useAsyncStateApi<
      PostWithMetaWithSinseTimestamps,
      undefined,
      [ForPost<PostWithMetaWithSinseTimestamps>, Array<File>]
    >
  >;
  putPostById: ReturnType<
    typeof useAsyncStateApi<
      PostWithMetaWithSinseTimestamps,
      undefined,
      [Id, ForPut<PostWithMetaWithSinseTimestamps>, Array<File>]
    >
  >;
  getPostById: ReturnType<typeof useAsyncStateApi<PostWithMetaWithSinseTimestamps, undefined, [Id]>>;
  deletePostById: ReturnType<typeof useAsyncStateApi<PostWithMetaWithSinseTimestamps, undefined, [Id]>>;
  isEnd: Ref<boolean>;
  page: Ref<number>;
  all: Ref<Array<PostWithMetaWithSinseTimestamps>>;
}

export const INJECTION_KEY_BLOG: InjectionKey<BlogContext> = Symbol('blog');

export const provideBlogContext = () => {
  const [all, resetAll] = useSourcedRef<Array<PostWithMetaWithSinseTimestamps>>([]);
  const [page, resetPage] = useSourcedRef(0);
  const [isEnd, resetIsEnd] = useSourcedRef(false);

  const getPosts = useAsyncStateApi(async (options: { shouldReset?: boolean } = {}) => {
    if (options.shouldReset) {
      resetAll();
      resetIsEnd();
      resetPage();
    }

    return _getPosts(page.value).then((response) => {
      all.value = [...all.value, ...response.rows];
      isEnd.value = response._meta.isEnd;
      page.value = response._meta.page;

      return all.value;
    });
  }, []);

  const postPost = useAsyncStateApi(async (postData: ForPost<Post>, files: Array<File> = []) => {
    const filesUrls = files.length > 0 ? await postUpload(files) : [];

    return _postPost({ ...postData, filesUrls });
  });

  const putPostById = useAsyncStateApi(async (id: Id, post: ForPut<Post>, files: Array<File> = []) => {
    const filesUrls = files.length > 0 ? await postUpload(files) : [];

    return _putPost(id, { ...post, filesUrls });
  });

  const getPostById = useAsyncStateApi(_getPostById);

  const deletePostById = useAsyncStateApi(_deletePost);

  const blogContext = {
    getPosts,
    postPost,
    putPostById,
    getPostById,
    deletePostById,
    isEnd,
    page,
    all,
  };

  provide(INJECTION_KEY_BLOG, blogContext);

  return blogContext;
};

export const useBlogContext = () => nonNullable(inject(INJECTION_KEY_BLOG));
