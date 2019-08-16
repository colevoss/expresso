import * as express from 'express';
import { Schema } from 'schrema';
import { Logger } from './Logger';
import { Logger as ILogger } from 'pino';
import 'reflect-metadata';

const createSchemaValidatorMiddleware = <T>(
  schema: Schema<T>,
  logger: ILogger,
) => {
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
      const errors = e.map((err: Error) => err.message);

      const error = {
        type: 'ValidationError',
        errors,
      };

      res.status(400).json({
        error,
        data: {},
      });

      logger.info(
        { method: req.method, route: `${req.baseUrl}${req.path}`, error },
        'Body validation failed',
      );
    }
  };
};

export function ValidateBody<T>(schemaObject: T) {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const schema = Schema.create(schemaObject);
    const logger = Logger({});

    const keyMetaData = Reflect.getMetadata(key, target) || {};

    const newMetaData = {
      ...keyMetaData,
      middleware: [
        ...(keyMetaData.middleware || []),
        createSchemaValidatorMiddleware(schema, logger),
      ],
    };

    Reflect.defineMetadata(key, newMetaData, target);

    return descriptor;
  };
}
