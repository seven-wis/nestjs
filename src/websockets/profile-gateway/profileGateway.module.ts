import { Module, forwardRef } from '@nestjs/common';
import { ProfileGatewayService } from './profileGateway.service';
import { ProfileGateway } from './profileGateway.gateway';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    JwtModule,
    ConfigModule
  ],
  providers: [ProfileGateway, ProfileGatewayService],
  exports: [ProfileGatewayService],
})
export class ProfileModule { }
