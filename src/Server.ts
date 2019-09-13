import * as express from 'express';
import * as helmet from 'helmet';
import { Logger } from './Logger';
import { Context } from './Context';
import 'reflect-metadata';

import { Controller, ControllerClass, IActionMetadata } from './types';
import { Logger as ILogger } from 'pino';
import { RouteClass } from './Route';

export class Server {
  public name: string;
  public app: express.Application;
  public routes: { [baseRoute: string]: Controller<any> };
  public logger: ILogger;

  constructor() {
    this.app = express();
    this.bootstrapApp();
  }

  static async create<S extends Server>(
    this: { new (): S },
    // routes?: ControllerClass<any>[],
    routes?: (new (server: S) => RouteClass<S>)[],
  ): Promise<S> {
    const server = new this();

    // server.bootstrapApp();

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

  // public registerRoute<T>(routeType: ControllerClass<T>) {
  public registerRoute<
    // T extends new <S extends Server>(server: S) => RouteClass<S>
    S extends Server,
    T extends RouteClass<S>
  >(
    // routeType: ControllerClass<T>,
    // routeType: T,
    routeType: new (server: S) => T,
  ) {
    // @ts-ignore
    const route = new routeType(this as S);
    // route.init(this);
    const router = express.Router();
    const routePrototype = Object.getPrototypeOf(route);
    // const baseRoute = Reflect.getMetadata('basePath', routePrototype);
    const baseRoute = '/' + route.route;

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

  public registerRoutes<
    // T extends new <S extends Server>(server: S) => RouteClass<S>
    S extends Server,
    T extends RouteClass<S>
  >(
    // routeTypes: ControllerClass<T>[],
    // routeTypes: T[],
    routeTypes: (new (server: S) => T)[],
  ) {
    for (const routeType of routeTypes) {
      this.registerRoute(routeType);
    }
  }
}
