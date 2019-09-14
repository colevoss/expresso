import { RequestHandler } from 'express';

export interface Type<T> extends Function {
  new (...args: any[]): T;
}

export type ControllerClass<T> = { new (): T };

export type Controller<T> = InstanceType<ControllerClass<T>>;

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
