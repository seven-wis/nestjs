import { ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';
export declare class DatabaseConfig {
    private configService;
    constructor(configService: ConfigService);
    createPostgesDataSourceOptions(): DataSourceOptions;
}
