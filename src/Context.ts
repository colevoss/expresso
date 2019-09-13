import { Request, Response } from 'express';
import { Server } from './Server';
import { Logger as ILogger } from 'pino';

type IContextContstructor<T> = {
  new (request: Request, response: Response, server: Server): T;
};

export class Context<Body = {}, Query = {}> {
  public params: { [key: string]: string };
  public body: Body;
  public query: Query;
  public logger: ILogger;

  constructor(
    public request: Request,
    public response: Response,
    public server: Server,
  ) {
    this.params = this.request.params as { [key: string]: string };
    this.body = this.request.body as Body;
    this.query = this.request.query as Query;

    this.createLogger();
  }

  private createLogger() {
    const { path, method, baseUrl } = this.request;

    this.logger = this.server.logger.child({ path, method, baseUrl });
  }

  public send<T>(data: T, code: number = 200) {
    this.response.status(code).json({ data });

    this.logger.info(
      { data, code } as any,
      `Request Success with code: ${code}`,
    );
  }

  public error<E extends Error & { code?: number }>(error: E) {
    this.response.status(error.code || 400).send(error);

    this.logger.error(error);
  }
}
