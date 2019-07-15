import { Module } from '@nestjs/common';
import { RouterModule } from 'nest-router';
import { TypeOrmModule } from '@nestjs/typeorm';

import { routes } from './app.routes';

import { AppController } from './app.controller';
import { ConfigService } from './common/services/config.service';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: ConfigService.mysql.host,
            port: ConfigService.mysql.port,
            username: ConfigService.mysql.user,
            password: ConfigService.mysql.password,
            database: ConfigService.mysql.db,
            entities: [],
            syncronize: false,
            logging: false
        }),

        RouterModule.forRoutes(routes)
    ],
    controllers: [ AppController ]
})
export class AppModule {}