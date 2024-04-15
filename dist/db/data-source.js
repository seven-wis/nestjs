"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataScourceOptions = void 0;
const typeorm_1 = require("typeorm");
const typeorm_config_1 = require("./typeorm.config");
const config_1 = require("@nestjs/config");
const databaseConfig = new typeorm_config_1.DatabaseConfig(new config_1.ConfigService);
exports.dataScourceOptions = databaseConfig.createPostgesDataSourceOptions();
const dataSource = new typeorm_1.DataSource(exports.dataScourceOptions);
exports.default = dataSource;
//# sourceMappingURL=data-source.js.map