import * as express from 'express';
import * as helmet from 'helmet';
import { Logger } from './Logger';
import 'reflect-metadata';

import { Controller, ControllerClass, IActionMetadata } from './types';
import { Logger as ILogger } from 'pino';

export abstract class Server {
  public app: express.Application;
  public routes: { [baseRoute: string]: Controller<any> };
  public logger: ILogger;

  constructor() {
    this.app = express();
    this.logger = Logger({ name: 'Server' });

    this.bootstrapApp();
  }

  private bootstrapApp() {
    this.app.use(express.json());
    this.app.use(helmet());
  }

  public async start() {
    this.app.listen(3000, () => {
      this.logger.info({ port: 3000 }, 'Server started and listening');
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
        try {
          // @ts-ignore
          const result = await actionFn(req);
          const response = {
            data: result,
          };

          res.json(response);

          actionLogger.info(response);
        } catch (e) {
          const error = {
            type: e.name,
            message: e.message,
          };

          res.status(400).json({
            error,
          });

          actionLogger.info({ error });
        }
      };

      router[path.mimeType](path.path, middleware, handler);
    }

    this.app.use(baseRoute, router);
  }

  public registerRoutes<T>(routeTypes: ControllerClass<T>[]) {
    for (const routeType of routeTypes) {
      this.registerRoute(routeType);
    }
  }
}
