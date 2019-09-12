import { Request } from 'express';
import {
  Server,
  Get,
  Post,
  Put,
  Delete,
  Route,
  SendFn,
  RouteClass,
} from '../src';

export class TestServer extends Server {}

// @Route('get')
export class GetRoute extends RouteClass {
  public route = 'get';
  @Get('/')
  baseGet(req: Request, send: SendFn<any>) {
    send({ getRequest: 'success' });
  }
}

// @Route('/post')
// export class PostRoute {
//   @Post('/')
//   basePost(req: any, send: SendFn<any>) {
//     send({ postRequest: 'success' });
//   }
// }

// @Route('/put')
// export class PutRoute {
//   @Put('/')
//   basePut(req: any, send: SendFn<any>) {
//     send({ putRequest: 'success' });
//   }
// }

// @Route('/delete')
// export class DeleteRoute {
//   @Delete('/')
//   baseDelete(req: any, send: SendFn<any>) {
//     send({ deleteRequest: 'success' });
//   }
// }
