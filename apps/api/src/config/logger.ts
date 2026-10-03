import { pino } from 'pino';
import { APP_NAME } from './app-info';
import { env } from './env';

export const logger = pino({
  name: APP_NAME,
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      '*.password',
      '*.token',
    ],
    censor: '[REDACTED]',
  },
  // Human-readable logs locally; structured JSON everywhere else.
  ...(env.NODE_ENV === 'development' && {
    transport: { target: 'pino-pretty', options: { colorize: true, singleLine: true } },
  }),
});
