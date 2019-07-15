import { 
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        let ctx = host.switchToHttp();
        let response = ctx.getResponse();
        response
            .status(exception.getStatus())
            .json(exception.message);
    }
}