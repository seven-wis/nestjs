import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import * as fs from 'fs';

async function bootstrap() {

    const app = await NestFactory.create(AppModule, { });

    const options = new DocumentBuilder()
        .setTitle('Backend API')
        .setVersion('1.0')
        .addServer(process.env.BACKEND_URL)
        .addTag('Ping')
        .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api-docs', app, document);

    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe());

    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));

    app.enableCors({
        origin: [
            process.env.FRONTEND_URL,
            process.env.GAME_URL
        ],
        credentials: true,
    });

    await app.listen(process.env.BACKEND_PORT | 3000, () => { });
}
bootstrap();