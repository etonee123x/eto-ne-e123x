import { nonNullable } from '@/utils/nonNullable';
import { requestToUrl } from '@/utils/requestToUrl';
import type { components } from '@/types/openapi';
import type { RequestHandlerTyped } from '@/types/RequestHandlerTyped';
import { cookieAuth } from '@/middlewares/cookieAuth';
import { PostsService } from '../services/PostsService';
import { idioticFieldMultipartFormDataToJsonParser } from '../middlewares/idioticFieldMultipartFormDataToJsonParser';
import { parseFiles } from '../middlewares/parseFiles';
import { PostsRepo } from '../repos/PostsRepo';
import { Controller } from '@/shared/Controller';

export class PostsController extends Controller {
  private getPosts: RequestHandlerTyped<'/posts', 'get'> = async (request, response) => {
    const url = requestToUrl(request);
    const pageSize = Number(nonNullable(url.searchParams.get('pageSize') ?? 10));
    const cursorPrevious = url.searchParams.get('filters[cursorPrevious]');
    const cursorNext = url.searchParams.get('filters[cursorNext]');
    const postId = url.searchParams.get('filters[postId]');

    response.send(await this.postsService.getPosts({ cursorPrevious, cursorNext, postId, pageSize }));
  };

  private createPost: RequestHandlerTyped<'/posts', 'post', Omit<components['schemas']['PostCreateRequest'], 'files'>> =
    async (request, response) => {
      const files = request.files as Array<globalThis.Express.Multer.File>;
      const text = request.body.text;

      return response.send(await this.postsService.createPost({ text, files }));
    };

  private updatePostById: RequestHandlerTyped<
    '/posts/{id}',
    'patch',
    Omit<components['schemas']['PostUpdateRequest'], 'files'>
  > = async (request, response) => {
    const id = request.params.id;
    const files = request.files as Array<globalThis.Express.Multer.File>;
    const attachments = request.body.attachments;
    const text = request.body.text;

    return response.send(
      await this.postsService.updatePostById({
        id,
        text,
        files,
        attachments,
      }),
    );
  };

  private deletePostById: RequestHandlerTyped<'/posts/{id}', 'delete'> = async (request, response) => {
    const id = request.params.id;

    return response.send(await this.postsService.deletePostById({ id }));
  };

  constructor(private readonly postsService: PostsService) {
    super();

    this.router.get('/posts', this.getPosts);
    this.router.post('/posts', cookieAuth, parseFiles, this.createPost);
    this.router.patch(
      '/posts/:id',
      cookieAuth,
      parseFiles,
      idioticFieldMultipartFormDataToJsonParser(['attachments']),
      this.updatePostById,
    );
  }
}
