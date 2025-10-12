import type { Id } from '@etonee123x/shared/helpers/id';
import type { Post } from '@etonee123x/shared/types/blog';
import { defineStore } from 'pinia';
import { useCounter, useToggle } from '@vueuse/core';

import {
  getPosts as _getPosts,
  postPost as _postPost,
  deletePost as _deletePost,
  putPost as _putPost,
  getPostById as _getPostById,
  type PostWithMetaWithSinseTimestamps,
} from '@/api/posts';
import { postUpload } from '@/api/upload';
import { useAsyncStateApi } from '@/composables/useAsyncStateApi';
import { useSourcedRef } from '@/composables/useSourcedRef';
import type { ForPut, ForPost } from '@etonee123x/shared/types/database';

export const useBlogStore = defineStore('blog', () => {
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
      all.value = all.value.concat(response.rows);
      isEnd.value = response._meta.isEnd;
      page.value = response._meta.page;

      return all.value;
    });
  }, []);

  const postPost = useAsyncStateApi(async (postData: ForPost<Post>, files: Array<File> = []) => {
    const filesUrls = files.length ? await postUpload(files) : [];

    return _postPost({ ...postData, filesUrls });
  });

  const putPostById = useAsyncStateApi(async (id: Id, post: ForPut<Post>, files: Array<File> = []) => {
    const filesUrls = files.length ? await postUpload(files) : [];

    return _putPost(id, { ...post, filesUrls });
  });

  const getPostById = useAsyncStateApi(_getPostById);

  const deletePostById = useAsyncStateApi(_deletePost);

  return {
    getPosts,
    postPost,
    putPostById,
    getPostById,
    deletePostById,

    isEnd,
  };
});
