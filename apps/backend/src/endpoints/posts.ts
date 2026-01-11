import { TableController } from '@/helpers/TableController';
import type { OperationHandler, OperationResponse, PostResponse } from '@/types/openapi';
import { throwError } from '@etonee123x/shared';
import Express from 'express';
import multer from 'multer';

const uploadAsync = (request: Express.Request, response: Express.Response): Promise<Express.Request['files']> => {
  return new Promise((resolve, reject) => {
    multer({
      // dest: process.env.UPLOADS_PATH ?? throwError('UPLOADS_PATH is not defined'),
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
      storage: multer.diskStorage({
        destination: () => {
          return process.env.UPLOADS_PATH ?? throwError('UPLOADS_PATH is not defined');
        },
        filename: (...[, file, callback]) => {
          console.log({ file });
          // const fileName = (
          //   [
          //     [
          //       //
          //       true,
          //       (fileName) => {
          //         return slugify(fileName, { lower: true, strict: true, locale: 'ru' });
          //       },
          //     ],
          //     [
          //       true,
          //       (fileName) => {
          //         const date = new Date();

          //         return [
          //           fileName,
          //           [
          //             [
          //               //
          //               date.getFullYear(),
          //               withPadStart(date.getMonth() + 1),
          //               withPadStart(date.getDate()),
          //             ].join('-'),
          //             [
          //               //
          //               withPadStart(date.getHours()),
          //               withPadStart(date.getMinutes()),
          //               withPadStart(date.getSeconds()),
          //             ].join('-'),
          //           ].join('_'),
          //         ].join('_');
          //       },
          //     ],
          //     [
          //       //
          //       true,
          //       (fileName) => {
          //         return [fileName, randomUUID().split('-', 1)[0]].join('_');
          //       },
          //     ],
          //     [
          //       //
          //       true,
          //       (fileName) => {
          //         return [fileName, ext].join('');
          //       },
          //     ],
          //   ] as Array<[boolean, (fileName: string) => string]>
          // ).reduce((fileName, [condition, transformation]) => {
          //   // лол
          //   // eslint-disable-next-line sonarjs/no-selector-parameter
          //   return condition ? transformation(fileName) : fileName;
          // }, file.filename);
        },
      }),
    }).array('files')(request, response, (error: unknown) => {
      if (error) {
        reject(new Error('File upload error'));
      } else {
        resolve(request.files);
      }
    });
  });
};

const tableControllerPosts = new TableController<Omit<PostResponse, '_meta'>>('posts');

export const getPosts: OperationHandler<'getPosts', [Express.Request, Express.Response]> = async (
  ...[context, , response]
) => {
  const posts = tableControllerPosts.read();

  const perPage = context.request.query.pageSize ?? 10;
  const page = context.request.query.page ?? 0;

  const indexInitial = page * perPage;
  const indexLast = indexInitial + perPage;

  const data: OperationResponse<'getPosts'> = {
    _meta: {
      isEnd: indexLast >= posts.length - 1,
      page,
    },
    rows: posts.slice(indexInitial, indexLast),
  };
  return response.send(data);
};

export const getPostById: OperationHandler<'getPostById', [Express.Request, Express.Response]> = async (
  ...[context, , response]
) => {
  const post = tableControllerPosts.readRowById(context.request.params.id);

  const data: OperationResponse<'getPostById'> = post;
  return response.send(data);
};

export const createPost: OperationHandler<'createPost', [Express.Request, Express.Response]> = async (
  context,
  request,
  response,
) => {
  const files = await uploadAsync(request, response);
  console.log({ files });

  const post = tableControllerPosts.writeEntityOrRow(undefined, {
    attachments: [],
    text: String(request.body.text),
  });

  const data: OperationResponse<'createPost'> = post;
  return response.send(data);
};

export const updatePostById: OperationHandler<'updatePostById', [Express.Request, Express.Response]> = async (
  ...[context, , response]
) => {
  const post = tableControllerPosts.writeEntityOrRow(context.request.params.id, context.request.body);

  const data: OperationResponse<'updatePostById'> = post;
  return response.send(data);
};

export const deletePostById: OperationHandler<'deletePostById', [Express.Request, Express.Response]> = async (
  ...[context, , response]
) => {
  const post = tableControllerPosts.deleteRowById(context.request.params.id);

  const data: OperationResponse<'deletePostById'> = post;
  return response.send(data);
};
