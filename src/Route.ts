import { Router } from 'express';
import { Logger } from './Logger';
import 'reflect-metadata';
import { Logger as ILogger } from 'pino';
import { Server } from './Server';

type ClassType = { new (...args: any[]): {} };

export function Route(path: string) {
  return function<T extends ClassType>(target: T) {
    const basePath = `/${path}`;
    Reflect.defineMetadata('basePath', basePath, target.prototype);
  };
}

export abstract class RouteClass {
  public route: string = '';
}
