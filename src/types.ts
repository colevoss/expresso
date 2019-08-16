import { RequestHandler } from 'express';

export type ControllerClass<T> = { new (): T };

export type Controller<T> = InstanceType<ControllerClass<T>>;
// type Constructor<T> = new (...args: any[]) => T;

// export type Controller<T extends ClassType> = InstanceType<T>;

export enum ActionMimeType {
  Get = 'get',
  Post = 'post',
  Put = 'put',
  Delete = 'delete',
}

export interface IPathData {
  mimeType: ActionMimeType;
  path: string;
}

export interface IActionMetadata {
  path: IPathData;
  middleware?: RequestHandler[];
}
