import { describe, expect, it, vi } from 'vitest';

import { AppError } from '@/shared/errors/AppError';
import { PostsService } from '@/modules/posts/services/PostsService';

interface MockedPostsRepo {
  findFirstPosts: ReturnType<typeof vi.fn>;
  findPostsAroundPostId: ReturnType<typeof vi.fn>;
  findPostsByCursorPrevious: ReturnType<typeof vi.fn>;
  findPostsByCursorNext: ReturnType<typeof vi.fn>;
  findPostById: ReturnType<typeof vi.fn>;
  createPost: ReturnType<typeof vi.fn>;
  updatePostById: ReturnType<typeof vi.fn>;
  deletePostById: ReturnType<typeof vi.fn>;
}

interface MockedFilesService {
  upload: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
}

const buildService = () => {
  const postsRepo: MockedPostsRepo = {
    findFirstPosts: vi.fn(),
    findPostsAroundPostId: vi.fn(),
    findPostsByCursorPrevious: vi.fn(),
    findPostsByCursorNext: vi.fn(),
    findPostById: vi.fn(),
    createPost: vi.fn(),
    updatePostById: vi.fn(),
    deletePostById: vi.fn(),
  };

  const filesService: MockedFilesService = {
    upload: vi.fn(),
    delete: vi.fn(),
  };

  const service = new PostsService({
    postsRepo: postsRepo as never,
    filesService: filesService as never,
  });

  return { service, postsRepo, filesService };
};

const buildFile = (fileName: string, content: string) => {
  return {
    originalname: fileName,
    buffer: Buffer.from(content),
  } as Express.Multer.File;
};

describe('PostsService', () => {
  it('returns first page when no cursors or postId provided', async () => {
    const { service, postsRepo } = buildService();
    const page = {
      _meta: { cursorPrevious: null, cursorNext: null },
      rows: [],
    };

    postsRepo.findFirstPosts.mockResolvedValue(page);

    await expect(
      service.getPosts({
        postId: null,
        cursorNext: null,
        cursorPrevious: null,
        pageSize: 10,
      }),
    ).resolves.toBe(page);

    expect(postsRepo.findFirstPosts).toHaveBeenCalledWith({ pageSize: 10 });
  });

  it('throws 404 when around-post query returns null', async () => {
    const { service, postsRepo } = buildService();

    postsRepo.findPostsAroundPostId.mockResolvedValue(null);

    await expect(
      service.getPosts({
        postId: 'missing',
        cursorNext: null,
        cursorPrevious: null,
        pageSize: 10,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('uses previous and next cursor branches', async () => {
    const { service, postsRepo } = buildService();
    const previousPage = {
      _meta: { cursorPrevious: 500, cursorNext: 300 },
      rows: [],
    };
    const nextPage = {
      _meta: { cursorPrevious: 300, cursorNext: 100 },
      rows: [],
    };

    postsRepo.findPostsByCursorPrevious.mockResolvedValue(previousPage);
    postsRepo.findPostsByCursorNext.mockResolvedValue(nextPage);

    await expect(
      service.getPosts({
        postId: null,
        cursorNext: null,
        cursorPrevious: '500',
        pageSize: 2,
      }),
    ).resolves.toBe(previousPage);

    await expect(
      service.getPosts({
        postId: null,
        cursorNext: '300',
        cursorPrevious: null,
        pageSize: 2,
      }),
    ).resolves.toBe(nextPage);

    expect(postsRepo.findPostsByCursorPrevious).toHaveBeenCalledWith({ cursorPrevious: '500', pageSize: 2 });
    expect(postsRepo.findPostsByCursorNext).toHaveBeenCalledWith({ cursorNext: '300', pageSize: 2 });
  });

  it('createPost uploads every file then calls repo.createPost', async () => {
    const { service, postsRepo, filesService } = buildService();

    const files = [buildFile('a.mp3', 'A'), buildFile('b.mp3', 'B')];
    const [fileA, fileB] = files;
    if (!fileA || !fileB) {
      throw new Error('Expected test files to exist');
    }
    const attachmentA = { src: '/uploads/a.mp3', name: 'a.mp3' };
    const attachmentB = { src: '/uploads/b.mp3', name: 'b.mp3' };

    filesService.upload.mockResolvedValueOnce(attachmentA).mockResolvedValueOnce(attachmentB);

    postsRepo.createPost.mockResolvedValue({ id: 'created' });

    await service.createPost({ text: 'post', files });

    expect(filesService.upload).toHaveBeenNthCalledWith(1, {
      key: 'a.mp3',
      buffer: fileA.buffer,
    });
    expect(filesService.upload).toHaveBeenNthCalledWith(2, {
      key: 'b.mp3',
      buffer: fileB.buffer,
    });
    expect(postsRepo.createPost).toHaveBeenCalledWith({
      text: 'post',
      attachments: [attachmentA, attachmentB],
    });
  });

  it('updatePostById uploads null slots, keeps existing, deletes removed, updates repo', async () => {
    const { service, postsRepo, filesService } = buildService();

    const oldKeep = { src: '/uploads/keep.mp3', name: 'keep.mp3' };
    const oldDrop = { src: '/uploads/drop.mp3', name: 'drop.mp3' };
    const newAttachment = { src: '/uploads/new.mp3', name: 'new.mp3' };

    postsRepo.findPostById.mockResolvedValue({
      attachments: [oldKeep, oldDrop],
    });
    filesService.upload.mockResolvedValue(newAttachment);
    postsRepo.updatePostById.mockResolvedValue({ id: 'updated' });

    const attachmentsInput = [oldKeep, null];

    await service.updatePostById({
      id: 'post-1',
      text: 'updated text',
      attachments: attachmentsInput as never,
      files: [buildFile('new.mp3', 'N')],
    });

    expect(filesService.upload).toHaveBeenCalledWith({
      key: 'new.mp3',
      buffer: Buffer.from('N'),
    });
    expect(filesService.delete).toHaveBeenCalledWith({ key: 'drop.mp3' });
    expect(postsRepo.updatePostById).toHaveBeenCalledWith({
      id: 'post-1',
      text: 'updated text',
      attachments: [oldKeep, newAttachment],
    });
  });

  it('deletePostById deletes all attached files and returns deleted post', async () => {
    const { service, postsRepo, filesService } = buildService();

    const deletedPost = {
      _meta: { id: '1', createdAt: 1, updatedAt: 1 },
      text: 'x',
      attachments: [
        { name: 'a.mp3', src: '/uploads/a.mp3' },
        { name: 'b.mp3', src: '/uploads/b.mp3' },
      ],
    };

    postsRepo.deletePostById.mockResolvedValue(deletedPost);
    filesService.delete.mockResolvedValue(undefined);

    await expect(service.deletePostById({ id: '1' })).resolves.toBe(deletedPost);

    expect(filesService.delete).toHaveBeenNthCalledWith(1, { key: 'a.mp3' });
    expect(filesService.delete).toHaveBeenNthCalledWith(2, { key: 'b.mp3' });
  });
});
