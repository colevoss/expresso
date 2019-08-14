import * as express from 'express';
import { Controller } from './Controller';
import { ValidateBody } from './ValidateBody';
import { Schema } from 'schrema';
import { Get, Post, IPathMetadata } from './Action';
import 'reflect-metadata';

type Controller = InstanceType<any>;

const app = express();
app.use(express.json());

@Controller('test')
class TestController {
  @Post('/:id')
  @ValidateBody({ ball: Schema.string })
  async hello(req: express.Request) {
    // @ts-ignore
    return await Promise.resolve({ ...req.params, ...req.query, ...req.body });
  }
}

const newController = new TestController();

const addRouteToServer = (controller: Controller) => {
  const route = express.Router();

  const controllerProtoType = Object.getPrototypeOf(controller);

  const baseRoute = Reflect.getMetadata('basePath', controllerProtoType);

  app.use(baseRoute, route);

  const props = Object.getOwnPropertyNames(controllerProtoType);

  for (const prop of props) {
    const routeMetadata: {
      path: IPathMetadata;
      middleware?: express.RequestHandler[];
    } = Reflect.getOwnMetadata(prop, controllerProtoType);

    if (!routeMetadata) continue;

    const { path, middleware = [] } = routeMetadata;

    route[path.mimeType](
      path.path,
      middleware,
      async (req: express.Request, res: express.Response) => {
        try {
          const result = await controller[prop](req);
          res.json(result);

          console.log(
            JSON.stringify(
              {
                path: `${path.mimeType.toUpperCase()} ${baseRoute}${path.path}`,
                result,
              },
              null,
              2,
            ),
          );
        } catch (e) {
          res.status(400).json({ ballllllllls: 'ball' });
        }
      },
    );
  }
};

addRouteToServer(newController);

app.listen(3000);
