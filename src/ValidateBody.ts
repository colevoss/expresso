import * as express from 'express';
import { Schema } from 'schrema';
import 'reflect-metadata';

const createSchemaValidatorMiddleware = <T>(schema: Schema<T>) => {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const body = req.body;

    try {
      const validated = schema.validate(body);
      req.body = validated;

      next();
    } catch (e) {
      res.status(400).json({ errors: e.map((err: Error) => err.message) });
    }
  };
};

export function ValidateBody<T>(schemaObject: T) {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const schema = Schema.create(schemaObject);

    const keyMetaData = Reflect.getMetadata(key, target) || {};

    const newMetaData = {
      ...keyMetaData,
      middleware: [
        ...(keyMetaData.middleware || []),
        createSchemaValidatorMiddleware(schema),
      ],
    };

    Reflect.defineMetadata(key, newMetaData, target);

    return descriptor;
  };
}
