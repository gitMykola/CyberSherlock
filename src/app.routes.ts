import { Routes } from 'nest-router';
import { AppModule } from './app.module';

export const routes: Routes = [{
    path: '/api',
    module: AppModule,
    children: []
}]