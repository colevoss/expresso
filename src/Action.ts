import 'reflect-metadata';

enum ActionMimeType {
  Get = 'get',
  Post = 'post',
  Put = 'put',
  Delete = 'delete',
}

export interface IPathMetadata {
  mimeType: ActionMimeType;
  path: string;
}

function createAction(mimeType: ActionMimeType, path: string = '/') {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const keyMetaData = Reflect.getMetadata(key, target) || {};

    const newMetaData = {
      ...keyMetaData,
      path: { mimeType, path },
    };

    Reflect.defineMetadata(key, newMetaData, target);

    return descriptor;
  };
}

export function Get(path?: string) {
  return createAction(ActionMimeType.Get, path);
}

export function Post(path?: string) {
  return createAction(ActionMimeType.Post, path);
}

export function Put(path?: string) {
  return createAction(ActionMimeType.Put, path);
}

export function Delete(path?: string) {
  return createAction(ActionMimeType.Delete, path);
}
