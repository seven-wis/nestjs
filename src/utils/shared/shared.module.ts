import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataScourceOptions } from 'db/data-source';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      // useFactory: databaseConfig,

      useFactory: async (configService: ConfigService) => (dataScourceOptions),
    }),

    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          signOptions: {
            expiresIn: '1d'
          },
          secret: configService.get<string>('JWT_SECRET'),
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [JwtModule],
  // providers: [SocketGateway],
})
export class SharedModule { }