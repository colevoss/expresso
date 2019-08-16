import * as pino from 'pino';

export const logger = pino({
  prettyPrint: true,
});

type LoggerParams = { [key: string]: string };

export const Logger = (data: LoggerParams) => logger.child(data);
