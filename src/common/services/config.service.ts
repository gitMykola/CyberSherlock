import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as crypto from 'crypto';

// TODO move readFile to constructor, use config in app.module

const config = JSON.parse(
    fs.readFileSync('./config.json', 'utf-8')
);

@Injectable()
export class ConfigService {
    static get mysql() {
        const {
            host,
            port,
            db,
            user,
            password,
            host_client,
        } = config.mysql;

        return {
            host,
            port,
            db,
            user,
            host_client,
            password: ConfigService.decipher(password),
        };
    }
    static decipher(password) {
        const decipher = crypto.createDecipher(
            'aes-192-ccm',
            'kcolrehS31rebyC'
        );
        const decrypted = decipher.update(
            password,
            'hex',
            'utf8'
        );
        return decrypted + decipher.final('utf8');
    }
}