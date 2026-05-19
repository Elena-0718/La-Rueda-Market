import {
  NextFunction,
  Request,
  Response,
} from 'express';

export function loggerGlobal(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    const log = `
[${new Date().toISOString()}]
${req.method} ${req.originalUrl}
Status: ${res.statusCode}
IP: ${req.ip}
Tiempo: ${duration}ms
    `.trim();

    console.log(log);
  });

  next();
}