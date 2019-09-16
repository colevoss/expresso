import * as express from 'express';
import * as helmet from 'helmet';
import { Logger } from './Logger';
import { Context } from './Context';
import 'reflect-metadata';

import { Type, Controller, ControllerClass, IActionMetadata } from './types';
import { Logger as ILogger } from 'pino';
import { RouteClass } from './Route';

export class Server {
  public name: string;
  public app: express.Application;
  public logger: ILogger;

  constructor() {
    this.app = express();
    this.bootstrapApp();
  }

  static async create<S extends Server>(
    this: Type<S>,
    routes?: (new () => RouteClass)[],
    ...args: any[]
  ): Promise<S> {
    const server = new this(...args);

    if (routes) {
      server.registerRoutes(routes);
    }

    await server.created();

    return server;
  }

  public async created(): Promise<void> {}

  public async started(): Promise<void> {}

  public contextFactory<B = {}, Q = {}>(
    request: express.Request,
    response: express.Response,
  ): Context<B, Q> {
    return new Context(request, response, this);
  }

  protected bootstrapApp() {
    this.logger = Logger({ name: this.name || 'Server' });
    this.app.use(express.json());
    this.app.use(helmet());
  }

  public start(port: number) {
    this.app.listen(port, () => {
      this.logger.info({ port: port }, `${this.name} started and listening`);

      this.started();
    });
  }

  public registerRoute<T extends RouteClass>(routeType: Type<T>) {
    const route = new routeType();
    const router = express.Router();
    const routePrototype = Object.getPrototypeOf(route);
    const baseRoute = '/' + route.route;

    const routeActions = Object.getOwnPropertyNames(routePrototype);

    for (const routeAction of routeActions) {
      const routeMetadata: IActionMetadata = Reflect.getOwnMetadata(
        routeAction,
        routePrototype,
      );

      if (!routeMetadata) continue;

      const { path, middleware = [] } = routeMetadata;

      const actionFnName = routeAction as keyof InstanceType<
        ControllerClass<T>
      >;

      // @ts-ignore
      const actionFn = route[actionFnName].bind(route);

      const handler = async (req: express.Request, res: express.Response) => {
        const context = this.contextFactory(req, res);

        try {
          await actionFn(context);
        } catch (error) {
          context.error(error);
        }
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

  public registerRoutes<T extends RouteClass>(routeTypes: Type<T>[]) {
    for (const routeType of routeTypes) {
      this.registerRoute(routeType);
    }
  }
}
