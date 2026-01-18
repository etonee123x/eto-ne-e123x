import { TableController } from '@/helpers/TableController';
import { throwError } from '@etonee123x/shared/utils/throwError';
import { isNil } from '@etonee123x/shared/utils/isNil';
import Express from 'express';
import multer from 'multer';
import slugify from 'slugify';
import nodePath from 'node:path';
import { randomUUID } from 'node:crypto';
import { parseFileByPath } from '@/helpers/parseFileByPath';
import { nonNullable } from '@/utils/nonNullable';
import { requestToUrl } from '@/utils/requestToUrl';
import type { components } from '@/types/openapi';
import type { RequestHandlerTyped } from '@/types/RequestHandlerTyped';
import { cookieAuth } from '@/middlewares/cookieAuth';

const uploadsPath = process.env.UPLOADS_PATH ?? throwError('UPLOADS_PATH is not defined');

const withPadStart00 = (value: number) => {
  return String(value).padStart(2, '0');
};

const uploadFiles = multer({
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  storage: multer.diskStorage({
    destination: (...[, , callback]) => {
      callback(null, uploadsPath);
    },
    filename: (...[, file, callback]) => {
      const { name, ext } = nodePath.parse(file.originalname);

      callback(
        null,
        (
          [
            (fileName) => {
              return slugify(fileName, { lower: true, strict: true, locale: 'ru' });
            },
            (fileName) => {
              const date = new Date();

              return [
                fileName,
                [
                  [
                    //
                    date.getFullYear(),
                    withPadStart00(date.getMonth() + 1),
                    withPadStart00(date.getDate()),
                  ].join('-'),
                  [
                    //
                    withPadStart00(date.getHours()),
                    withPadStart00(date.getMinutes()),
                    withPadStart00(date.getSeconds()),
                  ].join('-'),
                ].join('_'),
              ].join('_');
            },
            (fileName) => {
              return [fileName, randomUUID().split('-', 1)[0]].join('_');
            },
            (fileName) => {
              return [fileName, ext].join('');
            },
          ] satisfies Array<(fileName: string) => string>
        ).reduce((fileName, transformation) => {
          return transformation(fileName);
        }, name),
      );
    },
  }),
}).array('files');

const tableControllerPosts = new TableController<Omit<components['schemas']['PostResponse'], '_meta'>>('posts');

export const getPosts: RequestHandlerTyped<'/posts', 'get'> = async (request, response) => {
  const url = requestToUrl(request);
  const pageSize = Number(nonNullable(url.searchParams.get('pageSize')));
  const page = Number(nonNullable(url.searchParams.get('page')));

  const indexInitial = page * pageSize;
  const indexLast = indexInitial + pageSize;
  const posts = tableControllerPosts.read();

  return response.send({
    _meta: {
      isEnd: indexLast >= posts.length - 1,
      page,
    },
    rows: posts.slice(indexInitial, indexLast),
  });
};

export const getPostById: RequestHandlerTyped<'/posts/{id}', 'get'> = async (request, response) => {
  const id = request.params.id;

  const post = tableControllerPosts.readRowById(id);

  return response.send(post);
};

const parseMulterFile = async (file: globalThis.Express.Multer.File) => {
  // новояз
  // eslint-disable-next-line unicorn/prevent-abbreviations
  const src = `/uploads/${file.filename}`;

  return {
    ...(await parseFileByPath(file.path)),
    src,
    path: src,
  };
};

export const createPost: RequestHandlerTyped<
  '/posts',
  'post',
  Omit<components['schemas']['PostCreateRequest'], 'files'>
> = async (request, response) => {
  const files = request.files as Array<globalThis.Express.Multer.File>;

  const post = tableControllerPosts.writeEntityOrRow(undefined, {
    attachments: await Promise.all(
      files.map((file) => {
        return parseMulterFile(file);
      }),
    ),
    text: request.body.text,
  });

  return response.send(post);
};

export const updatePostById: RequestHandlerTyped<
  '/posts/{id}',
  'patch',
  Omit<components['schemas']['PostUpdateRequest'], 'files'>
> = async (request, response) => {
  const id = request.params.id;
  const files = request.files as Array<globalThis.Express.Multer.File>;

  let index = 0;

  const post = tableControllerPosts.writeEntityOrRow(id, {
    text: request.body.text,
    attachments: await Promise.all([
      // :((
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(JSON.parse(request.body.attachments as any) as typeof request.body.attachments).map(async (attachment) => {
        return isNil(attachment) && index < files.length ? parseMulterFile(nonNullable(files[index++])) : attachment;
      }),
      ...files.slice(index).map((file) => {
        return parseMulterFile(file);
      }),
    ]).then((attachments) => {
      return attachments.filter((attachment) => {
        return !isNil(attachment);
      });
    }),
  });

  return response.send(post);
};

export const deletePostById: RequestHandlerTyped<'/posts/{id}', 'delete'> = async (request, response) => {
  const id = request.params.id;

  const post = tableControllerPosts.deleteRowById(id);

  return response.send(post);
};

export const router = Express.Router();

router.post('/posts', cookieAuth, uploadFiles, createPost);
router.get('/posts', getPosts);
router.get('/posts/:id', getPostById);
router.patch('/posts/:id', cookieAuth, uploadFiles, updatePostById);
router.delete('/posts/:id', cookieAuth, deletePostById);
