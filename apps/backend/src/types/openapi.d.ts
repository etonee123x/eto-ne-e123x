import type {
  Context,
  UnknownParams,
} from 'openapi-backend';

declare namespace Components {
    namespace Schemas {
        export interface Error400 {
            message: string;
        }
        export interface Error401 {
            message: string;
        }
        export interface Error404 {
            message: string;
        }
        export type FileType = "IMAGE" | "VIDEO" | "AUDIO" | "UNKNOWN";
        export interface FolderDataItemAudio {
            name: string;
            path: string;
            _meta: FolderDataItemMeta;
            itemType: "FOLDER" | "FILE" | "FILE";
            src: string;
            fileType: "IMAGE" | "VIDEO" | "AUDIO" | "UNKNOWN" | "AUDIO";
            metadata: {
                album: string | null;
                bpm: number | null;
                year: number | null;
                artists: string[];
                bitrate: number | null;
                duration: number | null;
            };
        }
        export interface FolderDataItemBase {
            name: string;
            path: string;
            _meta: FolderDataItemMeta;
        }
        export type FolderDataItemFile = FolderDataItemAudio | FolderDataItemImage | FolderDataItemVideo | FolderDataItemUnknown;
        export interface FolderDataItemFileBase {
            name: string;
            path: string;
            _meta: FolderDataItemMeta;
            itemType: "FOLDER" | "FILE" | "FILE";
            src: string;
        }
        export interface FolderDataItemFolder {
            name: string;
            path: string;
            _meta: FolderDataItemMeta;
            itemType: "FOLDER" | "FILE" | "FOLDER";
        }
        export interface FolderDataItemImage {
            name: string;
            path: string;
            _meta: FolderDataItemMeta;
            itemType: "FOLDER" | "FILE" | "FILE";
            src: string;
            fileType: "IMAGE" | "VIDEO" | "AUDIO" | "UNKNOWN" | "IMAGE";
            metadata: FolderDataSize;
        }
        export interface FolderDataItemMeta {
            createdAt: number;
            updatedAt: number;
        }
        export interface FolderDataItemUnknown {
            name: string;
            path: string;
            _meta: FolderDataItemMeta;
            itemType: "FOLDER" | "FILE" | "FILE";
            src: string;
            fileType: "IMAGE" | "VIDEO" | "AUDIO" | "UNKNOWN" | "UNKNOWN";
        }
        export interface FolderDataItemVideo {
            name: string;
            path: string;
            _meta: FolderDataItemMeta;
            itemType: "FOLDER" | "FILE" | "FILE";
            src: string;
            fileType: "IMAGE" | "VIDEO" | "AUDIO" | "UNKNOWN" | "VIDEO";
            metadata: FolderDataSize;
        }
        export interface FolderDataResponse {
            folders: FolderDataItemFolder[];
            files: FolderDataItemFile[];
            file: FolderDataItemFile | null;
            path: string;
        }
        export interface FolderDataSize {
            width: number;
            height: number;
        }
        export type ItemType = "FOLDER" | "FILE";
        export type PostAttachment = {
            _meta: {
                createdAt: number;
                updatedAt: number;
                id: string;
            };
        } & (FolderDataItemAudio | FolderDataItemImage | FolderDataItemVideo | FolderDataItemUnknown);
        export interface PostCreateRequest {
            files: string /* binary */[];
            text: string;
        }
        export interface PostResponse {
            _meta: {
                id: string;
                createdAt: number;
                updatedAt: number;
            };
            text: string;
            attachments: PostAttachment[];
        }
        export interface PostUpdateRequest {
            text: string;
            attachments: (PostAttachment | null)[];
            files: string[];
        }
        export interface PostsResponse {
            _meta: {
                isEnd: boolean;
                page: number;
            };
            rows: PostResponse[];
        }
    }
}
declare namespace Paths {
    namespace CreateAuth {
        namespace Parameters {
            export type Jwt = string;
        }
        export interface QueryParameters {
            jwt?: Parameters.Jwt;
        }
        namespace Responses {
            export interface $200 {
                jwt: string;
            }
            export type $401 = Components.Schemas.Error401;
        }
    }
    namespace CreatePost {
        export type RequestBody = Components.Schemas.PostCreateRequest;
        namespace Responses {
            export type $200 = Components.Schemas.PostResponse;
            export type $400 = Components.Schemas.Error400;
            export type $401 = Components.Schemas.Error401;
        }
    }
    namespace DeleteAuth {
        namespace Responses {
            export interface $200 {
                jwt: null;
            }
            export type $401 = Components.Schemas.Error401;
        }
    }
    namespace DeletePostById {
        namespace Parameters {
            export type Id = string;
        }
        export interface PathParameters {
            id: Parameters.Id;
        }
        namespace Responses {
            export type $200 = Components.Schemas.PostResponse;
            export type $401 = Components.Schemas.Error401;
            export type $404 = Components.Schemas.Error404;
        }
    }
    namespace GetFolderData {
        namespace Parameters {
            export type Path = string;
        }
        export interface QueryParameters {
            path: Parameters.Path;
        }
        namespace Responses {
            export type $200 = Components.Schemas.FolderDataResponse;
            export type $404 = Components.Schemas.Error404;
        }
    }
    namespace GetPostById {
        namespace Parameters {
            export type Id = string;
        }
        export interface PathParameters {
            id: Parameters.Id;
        }
        namespace Responses {
            export type $200 = Components.Schemas.PostResponse;
            export type $404 = Components.Schemas.Error404;
        }
    }
    namespace GetPosts {
        namespace Parameters {
            export type Page = number;
            export type PageSize = number;
        }
        export interface QueryParameters {
            page?: Parameters.Page;
            pageSize?: Parameters.PageSize;
        }
        namespace Responses {
            export type $200 = Components.Schemas.PostsResponse;
            export type $400 = Components.Schemas.Error400;
        }
    }
    namespace UpdatePostById {
        namespace Parameters {
            export type Id = string;
        }
        export interface PathParameters {
            id: Parameters.Id;
        }
        export type RequestBody = Components.Schemas.PostUpdateRequest;
        namespace Responses {
            export type $200 = Components.Schemas.PostResponse;
            export type $400 = Components.Schemas.Error400;
            export type $401 = Components.Schemas.Error401;
            export type $404 = Components.Schemas.Error404;
        }
    }
}


export interface Operations {
  /**
   * POST /auth
   */
  ['createAuth']: {
    requestBody: any;
    params: UnknownParams;
    query: Paths.CreateAuth.QueryParameters;
    headers: UnknownParams;
    cookies: UnknownParams;
    context: Context<any, UnknownParams, Paths.CreateAuth.QueryParameters, UnknownParams, UnknownParams>;
    response: Paths.CreateAuth.Responses.$200 | Paths.CreateAuth.Responses.$401;
  }
  /**
   * DELETE /auth
   */
  ['deleteAuth']: {
    requestBody: any;
    params: UnknownParams;
    query: UnknownParams;
    headers: UnknownParams;
    cookies: UnknownParams;
    context: Context<any, UnknownParams, UnknownParams, UnknownParams, UnknownParams>;
    response: Paths.DeleteAuth.Responses.$200 | Paths.DeleteAuth.Responses.$401;
  }
  /**
   * GET /posts
   */
  ['getPosts']: {
    requestBody: any;
    params: UnknownParams;
    query: Paths.GetPosts.QueryParameters;
    headers: UnknownParams;
    cookies: UnknownParams;
    context: Context<any, UnknownParams, Paths.GetPosts.QueryParameters, UnknownParams, UnknownParams>;
    response: Paths.GetPosts.Responses.$200 | Paths.GetPosts.Responses.$400;
  }
  /**
   * POST /posts
   */
  ['createPost']: {
    requestBody: Paths.CreatePost.RequestBody;
    params: UnknownParams;
    query: UnknownParams;
    headers: UnknownParams;
    cookies: UnknownParams;
    context: Context<Paths.CreatePost.RequestBody, UnknownParams, UnknownParams, UnknownParams, UnknownParams>;
    response: Paths.CreatePost.Responses.$200 | Paths.CreatePost.Responses.$400 | Paths.CreatePost.Responses.$401;
  }
  /**
   * GET /posts/{id}
   */
  ['getPostById']: {
    requestBody: any;
    params: Paths.GetPostById.PathParameters;
    query: UnknownParams;
    headers: UnknownParams;
    cookies: UnknownParams;
    context: Context<any, Paths.GetPostById.PathParameters, UnknownParams, UnknownParams, UnknownParams>;
    response: Paths.GetPostById.Responses.$200 | Paths.GetPostById.Responses.$404;
  }
  /**
   * PATCH /posts/{id}
   */
  ['updatePostById']: {
    requestBody: Paths.UpdatePostById.RequestBody;
    params: Paths.UpdatePostById.PathParameters;
    query: UnknownParams;
    headers: UnknownParams;
    cookies: UnknownParams;
    context: Context<Paths.UpdatePostById.RequestBody, Paths.UpdatePostById.PathParameters, UnknownParams, UnknownParams, UnknownParams>;
    response: Paths.UpdatePostById.Responses.$200 | Paths.UpdatePostById.Responses.$400 | Paths.UpdatePostById.Responses.$401 | Paths.UpdatePostById.Responses.$404;
  }
  /**
   * DELETE /posts/{id}
   */
  ['deletePostById']: {
    requestBody: any;
    params: Paths.DeletePostById.PathParameters;
    query: UnknownParams;
    headers: UnknownParams;
    cookies: UnknownParams;
    context: Context<any, Paths.DeletePostById.PathParameters, UnknownParams, UnknownParams, UnknownParams>;
    response: Paths.DeletePostById.Responses.$200 | Paths.DeletePostById.Responses.$401 | Paths.DeletePostById.Responses.$404;
  }
  /**
   * GET /folder-data
   */
  ['getFolderData']: {
    requestBody: any;
    params: UnknownParams;
    query: Paths.GetFolderData.QueryParameters;
    headers: UnknownParams;
    cookies: UnknownParams;
    context: Context<any, UnknownParams, Paths.GetFolderData.QueryParameters, UnknownParams, UnknownParams>;
    response: Paths.GetFolderData.Responses.$200 | Paths.GetFolderData.Responses.$404;
  }
}

export type OperationContext<operationId extends keyof Operations> = Operations[operationId]["context"];
export type OperationResponse<operationId extends keyof Operations> = Operations[operationId]["response"];
export type HandlerResponse<ResponseBody, ResponseModel = Record<string, any>> = ResponseModel & { _t?: ResponseBody };
export type OperationHandlerResponse<operationId extends keyof Operations> = HandlerResponse<OperationResponse<operationId>>;
export type OperationHandler<operationId extends keyof Operations, HandlerArgs extends unknown[] = unknown[]> = (...params: [OperationContext<operationId>, ...HandlerArgs]) => Promise<OperationHandlerResponse<operationId>>;


export type Error400 = Components.Schemas.Error400;
export type Error401 = Components.Schemas.Error401;
export type Error404 = Components.Schemas.Error404;
export type FileType = Components.Schemas.FileType;
export type FolderDataItemAudio = Components.Schemas.FolderDataItemAudio;
export type FolderDataItemBase = Components.Schemas.FolderDataItemBase;
export type FolderDataItemFile = Components.Schemas.FolderDataItemFile;
export type FolderDataItemFileBase = Components.Schemas.FolderDataItemFileBase;
export type FolderDataItemFolder = Components.Schemas.FolderDataItemFolder;
export type FolderDataItemImage = Components.Schemas.FolderDataItemImage;
export type FolderDataItemMeta = Components.Schemas.FolderDataItemMeta;
export type FolderDataItemUnknown = Components.Schemas.FolderDataItemUnknown;
export type FolderDataItemVideo = Components.Schemas.FolderDataItemVideo;
export type FolderDataResponse = Components.Schemas.FolderDataResponse;
export type FolderDataSize = Components.Schemas.FolderDataSize;
export type ItemType = Components.Schemas.ItemType;
export type PostAttachment = Components.Schemas.PostAttachment;
export type PostCreateRequest = Components.Schemas.PostCreateRequest;
export type PostResponse = Components.Schemas.PostResponse;
export type PostUpdateRequest = Components.Schemas.PostUpdateRequest;
export type PostsResponse = Components.Schemas.PostsResponse;
