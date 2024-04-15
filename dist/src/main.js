"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const cookieParser = require("cookie-parser");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const express_1 = require("express");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {});
    const options = new swagger_1.DocumentBuilder()
        .setTitle('Backend API')
        .setVersion('1.0')
        .addServer(process.env.BACKEND_URL)
        .addTag('Ping')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, options);
    swagger_1.SwaggerModule.setup('api-docs', app, document);
    app.use(cookieParser());
    app.useGlobalPipes(new common_1.ValidationPipe());
    app.use((0, express_1.json)({ limit: '50mb' }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: '50mb' }));
    app.enableCors({
        origin: [
            process.env.FRONTEND_URL,
            process.env.GAME_URL
        ],
        credentials: true,
    });
    await app.listen(process.env.BACKEND_PORT, () => { });
}
bootstrap();
//# sourceMappingURL=main.js.map