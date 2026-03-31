import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('LoggingInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const { method, url, ip } = request;
    const now = Date.now();

    this.logger.log(`Incoming Request: [${method}] ${url} - From: ${ip}`);

    return next.handle().pipe(
      tap(() => {
        const response = httpContext.getResponse<Response>();
        const { statusCode } = response;
        const delay = Date.now() - now;

        this.logger.log(
          `Outgoing Response: [${method}] ${url} - Status: ${statusCode} - Duration: ${delay}ms`,
        );
      }),
    );
  }
}
