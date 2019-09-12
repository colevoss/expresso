import * as express from 'express';
import * as helmet from 'helmet';
import { Logger } from './Logger';
import 'reflect-metadata';

import { Controller, ControllerClass, IActionMetadata } from './types';
import { Logger as ILogger } from 'pino';

export type SendFn<Data> = (data?: Data, error?: Error, code?: number) => void;

export const createServer = <S>() => {};

export abstract class Server {
  public name: string;
  public app: express.Application;
  public routes: { [baseRoute: string]: Controller<any> };
  public logger: ILogger;

  constructor(public port: number) {
    this.app = express();
    this.logger = Logger({ name: this.name || 'Server' });

    this.bootstrapApp();
  }

  static create<S extends Server>(
    this: { new (port: number): S },
    port: number,
    routes?: ControllerClass<any>[],
  ): S {
    const server = new this(port);

    if (routes) {
      server.registerRoutes(routes);
    }

    return server;
  }

  private bootstrapApp() {
    this.app.use(express.json());
    this.app.use(helmet());
  }

  public start() {
    this.app.listen(this.port, () => {
      this.logger.info({ port: this.port }, 'Server started and listening');
    });
  }

  public registerRoute<T>(routeType: ControllerClass<T>) {
    const route = new routeType();
    const router = express.Router();
    const routePrototype = Object.getPrototypeOf(route);
    const baseRoute = Reflect.getMetadata('basePath', routePrototype);

    const routeActions = Object.getOwnPropertyNames(routePrototype);

    for (const routeAction of routeActions) {
      const routeMetadata: IActionMetadata = Reflect.getOwnMetadata(
        routeAction,
        routePrototype,
      );

      if (!routeMetadata) continue;

      const { path, middleware = [] } = routeMetadata;

      const actionLogger = this.logger.child({
        method: path.mimeType.toUpperCase(),
        route: `${baseRoute}${path.path}`,
      });

      const actionFnName = routeAction as keyof InstanceType<
        ControllerClass<T>
      >;

      const actionFn = route[actionFnName];

      const handler = async (req: express.Request, res: express.Response) => {
        const sendFn: SendFn<T> = <T>(
          data: T,
          error: Error = null,
          code: number = 200,
        ) => {
          if (error) {
            const errorResult = {
              type: error.name,
              message: error.message,
            };

            res.status(code).json({ error: errorResult });

            return;
          }

          const response = {
            data,
          };

          res.status(code).json(response);

          actionLogger.info(response);
        };

        // @ts-ignore
        await actionFn(req, sendFn, this);
      };

      router[path.mimeType](path.path, middleware, handler);

      this.logger.info(
        {
          type: path.mimeType.toUpperCase(),
          path: path.path,
          route: baseRoute,
        },
        'Action Registered',
      );
    }

    this.app.use(baseRoute, router);
    this.logger.info({ baseRoute }, 'Route Registered');
  }

  public registerRoutes<T>(routeTypes: ControllerClass<T>[]) {
    for (const routeType of routeTypes) {
      this.registerRoute(routeType);
    }
  }
}
