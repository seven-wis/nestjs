import { DataSource, DataSourceOptions } from "typeorm";
import { DatabaseConfig } from "./typeorm.config";
import { ConfigService } from "@nestjs/config";

const databaseConfig = new DatabaseConfig(new ConfigService);

export const dataScourceOptions: DataSourceOptions = databaseConfig.createPostgesDataSourceOptions();

const dataSource = new DataSource(dataScourceOptions);

export default dataSource;