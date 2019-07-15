import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

import { join } from 'path';

async function load() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalFilters(new HttpExceptionFilter());
    app.useStaticAssets(join(__dirname, 'dist')); // TODO fix it

    await app.listen(process.env.PORT || 3000); 
}
load();