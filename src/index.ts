import * as express from 'express';
import { Route } from './Controller';
import { ValidateBody } from './ValidateBody';
import { Schema } from 'schrema';
import { Get, Post, IPathMetadata } from './Action';
import { Server } from './Server';
import 'reflect-metadata';

const app = express();
app.use(express.json());

@Route('test')
class TestController {
  @Get('/hello')
  test() {
    return 'hello';
  }

  @Post('/rando/:id')
  @ValidateBody({ ball: Schema.string })
  async hello(req: express.Request) {
    throw new Error('TEST');
    return await Promise.resolve({ ...req.params, ...req.query, ...req.body });
  }
}

class AdioServer extends Server {}

const start = () => {
  const adio = new AdioServer();

  adio.registerRoutes([TestController]);

  adio.start();
};

start();
