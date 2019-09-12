import * as express from 'express';
import { Route, RouteClass } from './Route';
import { ValidateBody } from './ValidateBody';
import { Schema } from 'schrema';
import { Get, Post } from './Action';
import { Server, SendFn } from './Server';
import 'reflect-metadata';

const app = express();
app.use(express.json());

class AdioServer extends Server {
  public name = 'AdioServer';
  public test = 'another hello';
}

// @Route('test')
class TestController extends RouteClass {
  // @Get('/hello')
  // test() {
  //   return 'hello';
  // }
  public route = 'test';

  @Get('/')
  // @ValidateBody({ ball: Schema.string })
  async hello(
    req: express.Request,
    send: SendFn<{ test: string }>,
    server: AdioServer,
  ) {
    const data = {
      test: server.test,
    };

    send(data);

    this.logger.info(server.test, 'test');
    // send(null, new Error('Test'), 404);
  }
}

const start = () => {
  // const adio = new AdioServer(3000);
  // const adio = AdioServer.create(3000, [TestController]);
  const adio = AdioServer.create(3000);

  adio.registerRoutes([TestController]);

  adio.start();
};

start();
