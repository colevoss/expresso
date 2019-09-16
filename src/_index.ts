import { Request, Response } from 'express';
import { RouteClass } from './Route';
import { ValidateBody } from './ValidateBody';
import { Schema } from 'schrema';
import { Context } from './Context';
import { Get, Post } from './Action';
import { Server } from './Server';
import 'reflect-metadata';

class AdioServer extends Server {
  public name = 'AdioServer';
  public test = 'another hello';

  public db: { test: string };

  constructor(public someTest: string, public anotherTest: string) {
    super();
  }

  public async created() {
    this.db = { test: 'hello' };
  }

  public async started() {
    this.logger.info('STARTED');
  }
}

interface MyContext<B = {}, Q = {}> extends Context<B, Q> {
  server: AdioServer;
}

class TestRoute extends RouteClass {
  public route = 'test';

  constructor(public test: string = 'HELLOOOOo') {
    super();
  }

  @Get('/hello')
  // @ValidateBody({ ball: Schema.string })
  async hello(ctx: MyContext<{ test: string }>) {
    const data = {
      test: ctx.server.db.test,
      controllerTest: this.test,
    };

    ctx.send(data);
  }
}

const start = async () => {
  // const adio = new AdioServer(3000);
  // const adio = AdioServer.create(3000, [TestController]);
  const adio = await AdioServer.create([TestRoute], 'HELLO', 'ANOTHER HELLo');

  // adio.registerRoutes([TestRoute]);

  adio.start(3000);
};

start();
