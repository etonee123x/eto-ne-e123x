import type { Pool } from 'pg';
import { describe, expect, it } from 'vitest';

import { PostsPgRepo } from '@/modules/posts/repos/PostsPgRepo';

describe('PostsPgRepo', () => {
  it('throws not implemented in every method', async () => {
    const repo = new PostsPgRepo({ pool: {} as Pool });

    await expect(repo.findFirstPosts({ pageSize: 10 })).rejects.toThrow('Not implemented');
    await expect(repo.findPostsAroundPostId({ postId: '1', pageSize: 10 })).rejects.toThrow('Not implemented');
    await expect(repo.findPostsByCursorPrevious({ cursorPrevious: '1', pageSize: 10 })).rejects.toThrow(
      'Not implemented',
    );
    await expect(repo.findPostsByCursorNext({ cursorNext: '1', pageSize: 10 })).rejects.toThrow('Not implemented');
    await expect(repo.findPostById({ id: '1' })).rejects.toThrow('Not implemented');
    await expect(repo.createPost({ text: 'x', attachments: [] })).rejects.toThrow('Not implemented');
    await expect(repo.updatePostById({ id: '1', text: 'x', attachments: [] })).rejects.toThrow('Not implemented');
    await expect(repo.deletePostById({ id: '1' })).rejects.toThrow('Not implemented');
  });
});
