import { TableController } from '@/helpers/TableController';
import { throwError } from '@etonee123x/shared/utils/throwError';
import { isNil } from '@etonee123x/shared/utils/isNil';
import Express from 'express';
import multer from 'multer';
import nodePath from 'node:path';
import { parseFileByPath } from '@/helpers/parseFileByPath';
import { nonNullable } from '@/utils/nonNullable';
import { requestToUrl } from '@/utils/requestToUrl';
import type { components } from '@/types/openapi';
import type { RequestHandlerTyped } from '@/types/RequestHandlerTyped';
import { cookieAuth } from '@/middlewares/cookieAuth';
import { rm, writeFile } from 'node:fs/promises';
import { fileTypeFromBuffer } from 'file-type';
import createHttpError from 'http-errors';
import { _throw } from '@etonee123x/shared/utils/_throw';
import { pick } from '@etonee123x/shared/utils/pick';

const uploadsPath = process.env.UPLOADS_PATH ?? throwError('UPLOADS_PATH is not defined');

const idioticFieldMultipartFormDataToJSONParser = (fields: Array<string>): Express.RequestHandler => {
  return (...[request, , next]) => {
    for (const field of fields) {
      if (typeof request.body[field] === 'string') {
        try {
          request.body[field] = JSON.parse(request.body[field]);
        } catch {
          request.body[field] = undefined;
        }
      }
    }
    next();
  };
};

const deleteAttachment = (attachment: components['schemas']['FolderDataItemFile']) => {
  return rm(nodePath.join(uploadsPath, attachment.name));
};

const parseFiles = multer({
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  storage: multer.memoryStorage(),
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
      isEnd: indexLast >= posts.length,
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

const saveMulterFile = async (file: globalThis.Express.Multer.File) => {
  const fileType = (await fileTypeFromBuffer(file.buffer)) ?? _throw(createHttpError(400, 'Unsupported file type'));

  const fileName = `upload-${crypto.randomUUID()}.${fileType.ext}`;
  const filePath = nodePath.join(uploadsPath, fileName);

  await writeFile(filePath, file.buffer);

  // новояз
  // eslint-disable-next-line unicorn/prevent-abbreviations
  const src = `/uploads/${fileName}`;

  return {
    ...(await parseFileByPath(filePath)),
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
        return saveMulterFile(file);
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

  const postNew = {
    text: request.body.text,
    attachments: await Promise.all([
      ...request.body.attachments.map(async (attachment) => {
        return isNil(attachment) && index < files.length ? saveMulterFile(nonNullable(files[index++])) : attachment;
      }),
      ...files.slice(index).map((file) => {
        return saveMulterFile(file);
      }),
    ]).then((attachments) => {
      return attachments.filter((attachment) => {
        return !isNil(attachment);
      });
    }),
  };

  const postOld = tableControllerPosts.readRowById(id);

  postOld.attachments.forEach((attachmentInOldPost) => {
    if (
      postNew.attachments.some((attachmentInNewPost) => {
        return attachmentInNewPost.src === attachmentInOldPost.src;
      })
    ) {
      return;
    }

    deleteAttachment(attachmentInOldPost);
  });

  const post = tableControllerPosts.writeEntityOrRow(id, { ...postNew, ...pick(postOld, ['_meta']) });

  return response.send(post);
};

export const deletePostById: RequestHandlerTyped<'/posts/{id}', 'delete'> = async (request, response) => {
  const id = request.params.id;

  const post = tableControllerPosts.deleteRowById(id);

  post.attachments.forEach((attachment) => {
    deleteAttachment(attachment);
  });

  return response.send(post);
};

export const router = Express.Router();

router.post('/posts', cookieAuth, parseFiles, createPost);
router.get('/posts', getPosts);
router.get('/posts/:id', getPostById);
router.patch(
  '/posts/:id',
  cookieAuth,
  parseFiles,
  idioticFieldMultipartFormDataToJSONParser(['attachments']),
  updatePostById,
);
router.delete('/posts/:id', cookieAuth, deletePostById);
