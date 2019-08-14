import { Router } from 'express';
import 'reflect-metadata';

type ClassType = { new (...args: any[]): {} };

export function Controller(path: string) {
  return function<T extends ClassType>(target: T) {
    Reflect.defineMetadata('basePath', `/${path}`, target.prototype);
  };
}
