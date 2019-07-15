import { Get, Controller, Res } from '@nestjs/common';
import { join } from 'path';

@Controller()
export class AppController {
    constructor() {}

    @Get()
    index(@Res() res) {
        res.sendFile(join(__dirname, 'dist/index.html'));
    }
}