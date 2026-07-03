import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from "@nestjs/common";

interface JsonResponse {
  status(statusCode: number): {
    json(body: unknown): void;
  };
}

interface HttpRequest {
  method?: string;
  url?: string;
}

interface ErrorResponseBody {
  statusCode: number;
  message: string | string[];
  error: string;
  path?: string;
  timestamp: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<JsonResponse>();
    const request = context.getRequest<HttpRequest>();
    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const body = this.createBody(exception, statusCode, request.url);
    response.status(statusCode).json(body);
  }

  private createBody(exception: unknown, statusCode: number, path?: string): ErrorResponseBody {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === "object" && response !== null) {
        const record = response as Record<string, unknown>;

        return {
          statusCode,
          message: this.normalizeMessage(record.message),
          error: typeof record.error === "string" ? record.error : exception.name,
          path,
          timestamp: new Date().toISOString()
        };
      }

      return {
        statusCode,
        message: String(response),
        error: exception.name,
        path,
        timestamp: new Date().toISOString()
      };
    }

    return {
      statusCode,
      message: "Internal server error",
      error: "Internal Server Error",
      path,
      timestamp: new Date().toISOString()
    };
  }

  private normalizeMessage(message: unknown): string | string[] {
    if (Array.isArray(message)) {
      return message.map(String);
    }

    if (typeof message === "string") {
      return message;
    }

    return "Unexpected error";
  }
}
